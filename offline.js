import { getEasyMove, getMediumMove, getHardMove } from './ai.js';

// Offline game state
const offlineState = {
  mode: null,        // 'friend' or 'ai'
  difficulty: null,  // 'easy', 'medium', 'hard'
  board: Array(9).fill(null),
  currentTurn: 'X',
  gameOver: false
};

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

// Initialize offline game
export function initOfflineGame(mode, difficulty) {
  offlineState.mode = mode;
  offlineState.difficulty = difficulty || 'medium';
  offlineState.board = Array(9).fill(null);
  offlineState.currentTurn = 'X';
  offlineState.gameOver = false;

  // Reset UI
  if (window.renderBoard) window.renderBoard(offlineState.board);
  const initialStatus = offlineState.mode === 'ai' ? 'Your turn (X)' : 'Player X\'s turn';
  if (window.updateStatusBar) window.updateStatusBar(initialStatus);
}

// Handle offline cell click
export function handleOfflineCellClick(index) {
  // Guard: cell not empty
  if (offlineState.board[index] !== null) {
    return;
  }

  // Guard: game not over
  if (offlineState.gameOver) {
    return;
  }

  // Place current player's symbol
  offlineState.board[index] = offlineState.currentTurn;

  // Check win/draw
  const winner = checkWinner(offlineState.board);
  const isDraw = checkDraw(offlineState.board);

  if (winner) {
    offlineState.gameOver = true;
    if (window.renderResult) window.renderResult('won', winner);
    if (window.renderBoard) window.renderBoard(offlineState.board);
    return;
  }

  if (isDraw) {
    offlineState.gameOver = true;
    if (window.renderResult) window.renderResult('draw', null);
    if (window.renderBoard) window.renderBoard(offlineState.board);
    return;
  }

  // Switch turn
  offlineState.currentTurn = offlineState.currentTurn === 'X' ? 'O' : 'X';
  const statusText = `Current turn: ${offlineState.currentTurn} ${offlineState.mode === 'ai' && offlineState.currentTurn === 'O' ? '(AI thinking)' : ''}`;
  if (window.updateStatusBar) window.updateStatusBar(statusText);
  if (window.renderBoard) window.renderBoard(offlineState.board);

  // If AI mode and O's turn, trigger AI move with delay
  if (offlineState.mode === 'ai' && offlineState.currentTurn === 'O' && !offlineState.gameOver) {
    setTimeout(triggerAIMove, 350);
  }
}

// Trigger AI move
export function triggerAIMove() {
  if (offlineState.gameOver) {
    return;
  }

  let moveIndex;

  if (offlineState.difficulty === 'easy') {
    moveIndex = getEasyMove(offlineState.board);
  } else if (offlineState.difficulty === 'medium') {
    moveIndex = getMediumMove(offlineState.board, 'O');
  } else {
    moveIndex = getHardMove(offlineState.board, 'O');
  }

  // Place AI symbol
  offlineState.board[moveIndex] = 'O';

  // Check win/draw
  const winner = checkWinner(offlineState.board);
  const isDraw = checkDraw(offlineState.board);

  if (winner) {
    offlineState.gameOver = true;
    if (window.renderResult) window.renderResult('won', 'O');
    if (window.renderBoard) window.renderBoard(offlineState.board);
    return;
  }

  if (isDraw) {
    offlineState.gameOver = true;
    if (window.renderResult) window.renderResult('draw', null);
    if (window.renderBoard) window.renderBoard(offlineState.board);
    return;
  }

  // Switch back to X
  offlineState.currentTurn = 'X';
  const statusText = offlineState.mode === 'ai' ? 'Your turn (X)' : 'Player X\'s turn';
  if (window.updateStatusBar) window.updateStatusBar(statusText);
  if (window.renderBoard) window.renderBoard(offlineState.board);
}

// Reset offline game with same settings
export function resetOfflineGame() {
  initOfflineGame(offlineState.mode, offlineState.difficulty);
}
