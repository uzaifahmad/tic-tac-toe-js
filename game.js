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

import {
  checkWinner,
  checkDraw,
  generateRoomId,
  getStoredInt
} from './utils.js';

// ---------------------------------------------------------------------------
// Firebase bootstrap
// ---------------------------------------------------------------------------

const FIREBASE_CONFIG = window.FIREBASE_CONFIG || {};
initFirebase(FIREBASE_CONFIG);

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

const state = {
  mode:        null,
  mySymbol:    null,
  board:       Array(9).fill(null),
  currentTurn: 'X',
  gameStatus:  'waiting',
  difficulty:  null,
  roomId:      null,
  resultShown: false,
  stats: {
    wins:   getStoredInt('tictactoe_wins'),
    losses: getStoredInt('tictactoe_losses'),
    draws:  getStoredInt('tictactoe_draws')
  }
};

let roomListener = null;

// ---------------------------------------------------------------------------
// Screen routing
// ---------------------------------------------------------------------------

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ---------------------------------------------------------------------------
// Board rendering
// ---------------------------------------------------------------------------

function renderBoard(board, winLine = null) {
  state.board = board;
  document.querySelectorAll('.cell').forEach((cell, index) => {
    const value = board[index];
    cell.textContent    = value ?? '';
    cell.dataset.symbol = value ?? '';
    cell.setAttribute('aria-label',
      value ? `Cell ${index + 1}: ${value}` : `Cell ${index + 1}: empty`);

    if (value === 'X') {
      cell.style.background = 'var(--primary)';
      cell.style.color      = 'white';
    } else if (value === 'O') {
      cell.style.background = 'var(--secondary)';
      cell.style.color      = 'white';
    } else {
      cell.style.background = 'white';
      cell.style.color      = 'var(--dark)';
    }

    cell.classList.toggle('winning', !!(winLine && winLine.includes(index)));
    cell.disabled = value !== null || state.gameStatus !== 'playing';
  });
}

// ---------------------------------------------------------------------------
// Status bar
// ---------------------------------------------------------------------------

function updateStatus(text) {
  document.getElementById('status').textContent = text;
}

// ---------------------------------------------------------------------------
// Win / draw result
// ---------------------------------------------------------------------------

function renderResult(outcome, winner, winLine = null) {
  if (state.resultShown) return;
  state.resultShown = true;

  let text = '';
  if (outcome === 'won') {
    text = state.mode === 'ai'
      ? (winner === 'X' ? 'You won! 🎉' : 'AI wins! 😢')
      : `${winner} wins! 🎉`;
    state.gameStatus = 'won';
    launchFirecrackers();
  } else {
    text = "It's a draw! 🤝";
    state.gameStatus = 'draw';
  }

  updateStatus(text);
  updateStats(outcome, winner);
  renderBoard(state.board, winLine);

  document.querySelectorAll('.cell').forEach(cell => { cell.disabled = true; });
  document.getElementById('btn-rematch').classList.add('visible');
}

// ---------------------------------------------------------------------------
// Stats / leaderboard
// ---------------------------------------------------------------------------

function updateLeaderboard() {
  document.getElementById('stat-wins').textContent   = state.stats.wins;
  document.getElementById('stat-losses').textContent = state.stats.losses;
  document.getElementById('stat-draws').textContent  = state.stats.draws;
}

function updateStats(outcome, winner) {
  if (state.mode === 'ai') {
    if (outcome === 'won') {
      if (winner === 'X') state.stats.wins++;
      else                state.stats.losses++;
    } else if (outcome === 'draw') {
      state.stats.draws++;
    }
  } else if (state.mode === 'offline') {
    if (outcome === 'won')       state.stats.wins++;
    else if (outcome === 'draw') state.stats.draws++;
  }
  localStorage.setItem('tictactoe_wins',   state.stats.wins);
  localStorage.setItem('tictactoe_losses', state.stats.losses);
  localStorage.setItem('tictactoe_draws',  state.stats.draws);
  updateLeaderboard();
}

// ---------------------------------------------------------------------------
// Win animation
// ---------------------------------------------------------------------------

function launchFirecrackers() {
  const emojis    = ['🎉', '✨', '🎊', '🌟', '🎈'];
  const board     = document.getElementById('board');
  const boardRect = board.getBoundingClientRect();

  for (let i = 0; i < 28; i++) {
    const el       = document.createElement('span');
    el.className   = 'firecracker';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.setAttribute('aria-hidden', 'true');
    el.style.left           = (Math.random() * boardRect.width  + boardRect.left) + 'px';
    el.style.top            = (Math.random() * boardRect.height + boardRect.top)  + 'px';
    el.style.animationDelay = (Math.random() * 0.3) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  board.classList.add('game-win');
  setTimeout(() => board.classList.remove('game-win'), 650);
}

// ---------------------------------------------------------------------------
// Online (Firebase) helpers
// ---------------------------------------------------------------------------

function convertBoardToArray(boardData) {
  if (Array.isArray(boardData)) return boardData;
  if (!boardData || typeof boardData !== 'object') return Array(9).fill(null);
  const board = Array(9).fill(null);
  Object.keys(boardData).forEach(key => {
    const idx = parseInt(key, 10);
    if (idx >= 0 && idx < 9) board[idx] = boardData[key];
  });
  return board;
}

async function handleOnlineCellClick(index) {
  if (state.mySymbol   !== state.currentTurn) return;
  if (state.board[index] !== null)            return;
  if (state.gameStatus !== 'playing')         return;
  try {
    const nextTurn = state.currentTurn === 'X' ? 'O' : 'X';
    await makeMove(state.roomId, index, state.mySymbol, nextTurn);
  } catch (err) {
    console.error('[game] makeMove error:', err);
    updateStatus('Error placing move. Please try again.');
  }
}

function onRoomUpdate(data) {
  if (!data) return;
  const newBoard    = convertBoardToArray(data.board);
  state.currentTurn = data.turn   || 'X';
  const dbStatus    = data.status || 'waiting';
  const boardIsEmpty = newBoard.every(c => c === null);
  if (boardIsEmpty && (state.gameStatus === 'won' || state.gameStatus === 'draw')) {
    state.gameStatus  = 'playing';
    state.resultShown = false;
  }
  state.board = newBoard;
  const winResult = checkWinner(state.board);
  const isDraw    = !winResult && checkDraw(state.board);
  if (dbStatus === 'playing' || winResult || isDraw) {
    showScreen('screen-game');
    document.getElementById('leaderboard').classList.add('visible');
  }
  renderBoard(state.board, winResult ? winResult.line : null);
  if (winResult && !state.resultShown) {
    state.gameStatus = 'won';
    renderResult('won', winResult.symbol, winResult.line);
  } else if (isDraw && !state.resultShown) {
    state.gameStatus = 'draw';
    renderResult('draw', null, null);
  } else if (dbStatus === 'playing' && !winResult && !isDraw) {
    state.gameStatus = 'playing';
    const isMyTurn  = state.currentTurn === state.mySymbol;
    updateStatus(state.currentTurn + "'s turn" + (isMyTurn ? ' — Your move!' : ' — Opponent thinking\u2026'));
  } else if (dbStatus === 'waiting') {
    updateStatus('Waiting for opponent\u2026');
  }
}

async function handleCreateRoom() {
  const btn = document.getElementById('btn-create-room');
  btn.disabled = true; btn.textContent = 'Creating\u2026';
  try {
    const roomId      = generateRoomId();
    state.roomId      = roomId;
    state.mySymbol    = 'X';
    state.gameStatus  = 'waiting';
    state.resultShown = false;
    await createRoom(roomId, 'host');
    removePlayer(roomId, 'O');
    document.getElementById('txt-room-code').textContent   = roomId;
    document.getElementById('txt-player-role').textContent = 'X (Host)';
    showScreen('screen-lobby');
    roomListener = listenRoom(roomId, onRoomUpdate);
  } catch (err) {
    console.error('[game] createRoom error:', err);
    updateStatus('Could not create room. Check your connection.');
  } finally { btn.disabled = false; btn.textContent = 'Create Room'; }
}

async function handleJoinRoom(roomId) {
  const btn = document.getElementById('btn-join-room');
  btn.disabled = true; btn.textContent = 'Joining\u2026';
  try {
    state.roomId      = roomId;
    state.mySymbol    = 'O';
    state.gameStatus  = 'waiting';
    state.resultShown = false;
    await joinRoom(roomId, 'guest');
    removePlayer(roomId, 'O');
    document.getElementById('txt-room-code').textContent   = roomId;
    document.getElementById('txt-player-role').textContent = 'O (Guest)';
    showScreen('screen-lobby');
    roomListener = listenRoom(roomId, onRoomUpdate);
  } catch (err) {
    console.error('[game] joinRoom error:', err);
    updateStatus('Could not join room. Check the room code and your connection.');
  } finally { btn.disabled = false; btn.textContent = 'Join Room'; }
}

function cleanupOnlineGame() {
  if (roomListener) { roomListener(); roomListener = null; }
  state.roomId = null; state.mySymbol = null;
}

function startOfflineGame(mode, difficulty) {
  state.mode = mode; state.difficulty = difficulty || null;
  state.board = Array(9).fill(null); state.currentTurn = 'X';
  state.gameStatus = 'playing'; state.resultShown = false;
  initOfflineGame(mode, difficulty);
  document.getElementById('leaderboard').classList.add('visible');
  document.getElementById('btn-rematch').classList.add('visible');
  showScreen('screen-game');
}

window.renderBoard     = (board, winLine) => renderBoard(board, winLine);
window.updateStatusBar = updateStatus;
window.renderResult    = (outcome, winner, winLine) => renderResult(outcome, winner, winLine);

function setupCopyRoomCode() {
  const codeEl = document.getElementById('txt-room-code');
  if (!codeEl) return;
  codeEl.setAttribute('title', 'Click to copy'); codeEl.style.cursor = 'pointer';
  codeEl.addEventListener('click', () => {
    const code = codeEl.textContent.trim(); if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      const orig = codeEl.textContent; codeEl.textContent = 'Copied!';
      setTimeout(() => { codeEl.textContent = orig; }, 1500);
    }).catch(() => {});
  });
}

function sanitizeRoomCode(raw) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-create-room').addEventListener('click', () => {
    state.mode = 'online'; handleCreateRoom();
  });

  const joinInput = document.getElementById('input-join-room');
  joinInput.addEventListener('input', () => {
    const clean = sanitizeRoomCode(joinInput.value);
    if (joinInput.value !== clean) joinInput.value = clean;
  });
  joinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const roomId = sanitizeRoomCode(joinInput.value);
      if (roomId.length >= 1) { state.mode = 'online'; handleJoinRoom(roomId); }
    }
  });
  document.getElementById('btn-join-room').addEventListener('click', () => {
    const roomId = sanitizeRoomCode(joinInput.value);
    if (!roomId) { joinInput.focus(); joinInput.setAttribute('aria-invalid', 'true'); return; }
    joinInput.removeAttribute('aria-invalid');
    state.mode = 'online'; handleJoinRoom(roomId);
  });

  document.getElementById('btn-start-friend').addEventListener('click', () => {
    startOfflineGame('offline', null);
  });
  document.getElementById('btn-start-ai').addEventListener('click', () => {
    const diff = document.querySelector('input[name="difficulty"]:checked')?.value || 'medium';
    startOfflineGame('ai', diff);
  });

  document.getElementById('btn-rematch').addEventListener('click', async () => {
    document.getElementById('btn-rematch').classList.remove('visible');
    state.resultShown = false;
    if (state.mode === 'online') {
      try { await setRematch(state.roomId); state.gameStatus = 'playing'; }
      catch (err) { console.error('[game] setRematch error:', err); }
    } else {
      resetOfflineGame(); state.gameStatus = 'playing'; state.board = Array(9).fill(null);
      renderBoard(state.board);
      updateStatus(state.mode === 'ai' ? 'Your turn (X)' : "Player X's turn");
    }
  });

  document.getElementById('btn-home').addEventListener('click', () => {
    cleanupOnlineGame(); state.mode = null; state.gameStatus = 'waiting';
    state.resultShown = false; state.board = Array(9).fill(null);
    document.getElementById('btn-rematch').classList.remove('visible');
    document.getElementById('leaderboard').classList.remove('visible');
    showScreen('screen-home');
  });

  document.getElementById('btn-lobby-cancel').addEventListener('click', () => {
    cleanupOnlineGame(); state.mode = null; state.gameStatus = 'waiting';
    state.resultShown = false; showScreen('screen-home');
  });

  document.querySelectorAll('.cell').forEach((cell) => {
    cell.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      if (state.mode === 'online') handleOnlineCellClick(index);
      else                         handleOfflineCellClick(index);
    });
  });

  updateLeaderboard(); setupCopyRoomCode(); showScreen('screen-home');
});
