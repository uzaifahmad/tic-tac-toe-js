import { checkWinner, getEmptyCells } from './utils.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Finds a single-move winning index for `symbol`, or null if none exists.
 * @param {Array<string|null>} board
 * @param {string} symbol
 * @returns {number|null}
 */
function findWinningMove(board, symbol) {
  for (const index of getEmptyCells(board)) {
    const testBoard = [...board];
    testBoard[index] = symbol;
    if (checkWinner(testBoard)) return index;
  }
  return null;
}

/**
 * Determines which player should move next based on piece counts.
 * @param {Array<string|null>} board
 * @returns {'X'|'O'}
 */
function getCurrentPlayer(board) {
  const xCount = board.filter(cell => cell === 'X').length;
  const oCount = board.filter(cell => cell === 'O').length;
  return xCount > oCount ? 'O' : 'X';
}

/**
 * Minimax with alpha-beta pruning.  Returns a heuristic score for the board.
 */
function minimax(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
  const result = checkWinner(board);

  if (result?.symbol === aiSymbol)    return 10 - depth;
  if (result?.symbol === humanSymbol) return depth - 10;

  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return 0; // draw

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = aiSymbol;
      const score = minimax(newBoard, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha    = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = humanSymbol;
      const score = minimax(newBoard, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
      minScore = Math.min(minScore, score);
      beta     = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

// ---------------------------------------------------------------------------
// Public AI move functions
// ---------------------------------------------------------------------------

/**
 * Easy mode: 30 % chance to take an immediate winning move, otherwise random.
 * @param {Array<string|null>} board
 * @returns {number}
 */
export function getEasyMove(board) {
  const currentPlayer = getCurrentPlayer(board);
  const winningMove   = findWinningMove(board, currentPlayer);

  if (winningMove !== null && Math.random() < 0.3) return winningMove;

  const emptyCells = getEmptyCells(board);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

/**
 * Medium mode: wins immediately, then blocks, otherwise random.
 * @param {Array<string|null>} board
 * @param {string} aiSymbol
 * @returns {number}
 */
export function getMediumMove(board, aiSymbol) {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  const winMove   = findWinningMove(board, aiSymbol);
  if (winMove   !== null) return winMove;

  const blockMove = findWinningMove(board, humanSymbol);
  if (blockMove !== null) return blockMove;

  const emptyCells = getEmptyCells(board);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

/**
 * Hard mode: unbeatable Minimax with alpha-beta pruning.
 * @param {Array<string|null>} board
 * @param {string} aiSymbol
 * @returns {number}
 */
export function getHardMove(board, aiSymbol) {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';
  const emptyCells  = getEmptyCells(board);

  let bestScore = -Infinity;
  let bestMove  = emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [...board];
    newBoard[index] = aiSymbol;
    const score = minimax(newBoard, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove  = index;
    }
  }

  return bestMove;
}
