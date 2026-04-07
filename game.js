import {
  initFirebase,
  createRoom,
  joinRoom,
  makeMove,
  listenRoom,
  setRematch,
  removePlayer
} from './firebase.js';

import {
  initOfflineGame,
  handleOfflineCellClick,
  resetOfflineGame
} from './offline.js';

// Load Firebase config from separate file (not committed to version control)
// See config.example.js for template
const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  databaseURL: "REPLACE_WITH_YOUR_DATABASE_URL",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Initialize Firebase
initFirebase(FIREBASE_CONFIG);

// Global state
const state = {
  mode: null,           // 'online' | 'offline' | 'ai'
  mySymbol: null,
  board: Array(9).fill(null),
  currentTurn: 'X',
  gameStatus: 'waiting',
  difficulty: null,
  roomId: null
};

// Firebase listener reference for cleanup
let roomListener = null;

// Winning lines
const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

// Helper: Check for winner
function checkWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Helper: Check for draw
function checkDraw(board) {
  return board.every(cell => cell !== null);
}

// Show/hide screens
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Render board UI
function renderBoard(board) {
  state.board = board;
  document.querySelectorAll('.cell').forEach((cell, index) => {
    const value = board[index];
    cell.textContent = value ? value : '';
    cell.dataset.symbol = value ? value : '';

    // Set color based on symbol
    if (value === 'X') {
      cell.style.background = 'var(--primary)';
      cell.style.color = 'white';
    } else if (value === 'O') {
      cell.style.background = 'var(--secondary)';
      cell.style.color = 'white';
    } else {
      cell.style.background = 'white';
      cell.style.color = 'var(--dark)';
    }

    cell.disabled = value !== null || state.gameStatus !== 'playing';
  });
}

// Update status bar
function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

// Show game result
function renderResult(outcome, winner) {
  let text = '';
  if (outcome === 'won') {
    if (state.mode === 'ai') {
      text = winner === 'X' ? 'You won!' : 'You lost!';
    } else {
      text = `${winner} wins!`;
    }
    state.gameStatus = 'won';
  } else if (outcome === 'draw') {
    text = "It's a draw!";
    state.gameStatus = 'draw';
  }

  updateStatus(text);

  // Disable all cells
  document.querySelectorAll('.cell').forEach(cell => {
    cell.disabled = true;
  });

  // Show rematch button
  document.getElementById('btn-rematch').style.display = 'block';
}

// Handle online cell click
async function handleOnlineCellClick(index) {
  // Guard: only if it's my turn and cell is empty and game is playing
  if (state.mySymbol !== state.currentTurn) {
    return;
  }
  if (state.board[index] !== null) {
    return;
  }
  if (state.gameStatus !== 'playing') {
    return;
  }

  try {
    const nextTurn = state.currentTurn === 'X' ? 'O' : 'X';
    await makeMove(state.roomId, index, state.mySymbol, nextTurn);
  } catch (error) {
    console.error('Error making move:', error);
  }
}

// Handle room updates (Firebase listener)
function onRoomUpdate(data) {
  if (!data) return;

  state.board = data.board || Array(9).fill(null);
  state.currentTurn = data.turn || 'X';
  state.gameStatus = data.status || 'waiting';

  // Check for winner
  const winner = checkWinner(state.board);
  if (winner) {
    state.gameStatus = 'won';
  } else if (checkDraw(state.board)) {
    state.gameStatus = 'draw';
  }

  // Transition to game screen when game starts
  if (state.gameStatus === 'playing' || state.gameStatus === 'won' || state.gameStatus === 'draw') {
    showScreen('screen-game');
  }

  renderBoard(state.board);

  if (state.gameStatus === 'won') {
    renderResult('won', winner);
  } else if (state.gameStatus === 'draw') {
    renderResult('draw', null);
  } else if (state.gameStatus === 'playing') {
    const turnText = `Current turn: ${state.currentTurn} ${state.currentTurn === state.mySymbol ? '(Your turn)' : '(Opponent turn)'}`;
    updateStatus(turnText);
  } else {
    updateStatus('Waiting for opponent...');
  }
}

// Create online room
async function handleCreateRoom() {
  try {
    const roomId = generateRoomId();
    state.roomId = roomId;
    state.mySymbol = 'X';
    state.gameStatus = 'waiting';

    await createRoom(roomId, 'host');
    removePlayer(roomId, 'O');

    document.getElementById('txt-room-code').textContent = roomId;
    document.getElementById('txt-player-role').textContent = 'X (Host)';
    showScreen('screen-lobby');

    roomListener = listenRoom(roomId, onRoomUpdate);
  } catch (error) {
    console.error('Error creating room:', error);
  }
}

// Join online room
async function handleJoinRoom(roomId) {
  try {
    state.roomId = roomId;
    state.mySymbol = 'O';
    state.gameStatus = 'waiting';

    await joinRoom(roomId, 'guest');
    removePlayer(roomId, 'X');

    document.getElementById('txt-room-code').textContent = roomId;
    document.getElementById('txt-player-role').textContent = 'O (Guest)';
    showScreen('screen-lobby');

    roomListener = listenRoom(roomId, onRoomUpdate);
  } catch (error) {
    console.error('Error joining room:', error);
  }
}

// Generate room ID
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Clean up online game
function cleanupOnlineGame() {
  if (roomListener) {
    roomListener();
    roomListener = null;
  }
  state.roomId = null;
  state.mySymbol = null;
}

// DOMContentLoaded - Wire up all events
document.addEventListener('DOMContentLoaded', () => {
  // Home screen - Online Multiplayer
  document.getElementById('btn-create-room').addEventListener('click', () => {
    state.mode = 'online';
    handleCreateRoom();
  });

  document.getElementById('btn-join-room').addEventListener('click', () => {
    state.mode = 'online';
    const roomId = document.getElementById('input-join-room').value.toUpperCase().trim();
    if (roomId) {
      handleJoinRoom(roomId);
    }
  });

  // Home screen - vs Friend
  document.getElementById('btn-start-friend').addEventListener('click', () => {
    state.mode = 'offline';
    state.board = Array(9).fill(null);
    state.currentTurn = 'X';
    state.gameStatus = 'playing';
    initOfflineGame('friend');
    showScreen('screen-game');
    document.getElementById('btn-rematch').style.display = 'block';
  });

  // Home screen - vs AI
  document.getElementById('btn-start-ai').addEventListener('click', () => {
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    state.mode = 'ai';
    state.difficulty = difficulty;
    state.board = Array(9).fill(null);
    state.currentTurn = 'X';
    state.gameStatus = 'playing';
    initOfflineGame('ai', difficulty);
    showScreen('screen-game');
    document.getElementById('btn-rematch').style.display = 'block';
  });

  // Game screen - Rematch
  document.getElementById('btn-rematch').addEventListener('click', async () => {
    if (state.mode === 'online') {
      try {
        await setRematch(state.roomId);
      } catch (error) {
        console.error('Error restarting game:', error);
      }
    } else {
      state.gameStatus = 'playing';
      state.board = Array(9).fill(null);
      resetOfflineGame();
      showScreen('screen-game');
    }
    document.getElementById('btn-rematch').style.display = 'none';
  });

  // Game screen - Back to Home
  document.getElementById('btn-home').addEventListener('click', () => {
    cleanupOnlineGame();
    state.mode = null;
    state.gameStatus = 'waiting';
    state.board = Array(9).fill(null);
    document.getElementById('btn-rematch').style.display = 'none';
    showScreen('screen-home');
  });

  // Game board cells
  document.querySelectorAll('.cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      if (state.mode === 'online') {
        handleOnlineCellClick(index);
      } else {
        handleOfflineCellClick(index);
      }
    });
  });

  showScreen('screen-home');
});

// Expose to window for offline.js
window.renderBoard = renderBoard;
window.updateStatusBar = updateStatus;
window.renderResult = renderResult;
