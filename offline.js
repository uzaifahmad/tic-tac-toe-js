import { getEasyMove, getMediumMove, getHardMove } from './ai.js';
import { checkWinner, checkDraw } from './utils.js';

// ---------------------------------------------------------------------------
// Offline game state
// ---------------------------------------------------------------------------

const offlineState = {
  mode:        null,   // 'friend' | 'ai'
  difficulty:  null,   // 'easy' | 'medium' | 'hard'
  board:       Array(9).fill(null),
  currentTurn: 'X',
  gameOver:    false,
  aiPending:   false   // prevents overlapping AI move calls
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialise (or re-initialise) an offline game.
 * @param {'friend'|'ai'} mode
 * @param {'easy'|'medium'|'hard'} [difficulty]
 */
export function initOfflineGame(mode, difficulty) {
  offlineState.mode        = mode;
  offlineState.difficulty  = difficulty || 'medium';
  offlineState.board       = Array(9).fill(null);
  offlineState.currentTurn = 'X';
  offlineState.gameOver    = false;
  offlineState.aiPending   = false;

  if (window.renderBoard)    window.renderBoard(offlineState.board);

  const initialStatus = offlineState.mode === 'ai' ? 'Your turn (X)' : "Player X's turn";
  if (window.updateStatusBar) window.updateStatusBar(initialStatus);
}

/**
 * Handle a human cell click in offline mode.
 * @param {number} index - board cell index (0–8)
 */
export function handleOfflineCellClick(index) {
  // Guards
  if (offlineState.gameOver)               return;
  if (offlineState.board[index] !== null)  return;
  // Prevent human input while AI is computing
  if (offlineState.mode === 'ai' && offlineState.currentTurn === 'O') return;

  _placeSymbol(index, offlineState.currentTurn);
}

/**
 * Reset to the same mode/difficulty as the previous game.
 */
export function resetOfflineGame() {
  initOfflineGame(offlineState.mode, offlineState.difficulty);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Place a symbol on the board, check for end-state, then switch turns.
 * @param {number} index
 * @param {'X'|'O'} symbol
 */
function _placeSymbol(index, symbol) {
  offlineState.board[index] = symbol;

  if (window.renderBoard) window.renderBoard(offlineState.board);

  const winResult = checkWinner(offlineState.board);
  if (winResult) {
    offlineState.gameOver  = true;
    offlineState.aiPending = false;
    if (window.renderResult) window.renderResult('won', winResult.symbol, winResult.line);
    return;
  }

  if (checkDraw(offlineState.board)) {
    offlineState.gameOver  = true;
    offlineState.aiPending = false;
    if (window.renderResult) window.renderResult('draw', null, null);
    return;
  }

  // Switch turn
  offlineState.currentTurn = offlineState.currentTurn === 'X' ? 'O' : 'X';

  if (offlineState.mode === 'ai' && offlineState.currentTurn === 'O') {
    if (window.updateStatusBar) window.updateStatusBar('AI thinking…');
    // Guard against double-scheduling
    if (!offlineState.aiPending) {
      offlineState.aiPending = true;
      setTimeout(_triggerAIMove, 380);
    }
  } else {
    const statusText = offlineState.mode === 'ai'
      ? 'Your turn (X)'
      : `Player ${offlineState.currentTurn}'s turn`;
    if (window.updateStatusBar) window.updateStatusBar(statusText);
  }
}

/**
 * Execute the AI move (called after a short delay for UX).
 */
function _triggerAIMove() {
  offlineState.aiPending = false;

  if (offlineState.gameOver) return;

  let moveIndex;
  const { board, difficulty } = offlineState;

  if (difficulty === 'easy') {
    moveIndex = getEasyMove(board);
  } else if (difficulty === 'medium') {
    moveIndex = getMediumMove(board, 'O');
  } else {
    moveIndex = getHardMove(board, 'O');
  }

  // Safety fallback: if AI returns undefined/null pick any free cell
  if (moveIndex === undefined || moveIndex === null) {
    const free = board.map((v, i) => v === null ? i : null).filter(i => i !== null);
    if (free.length === 0) return;
    moveIndex = free[0];
  }

  _placeSymbol(moveIndex, 'O');
}

