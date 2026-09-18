/**
 * utils.js — Shared game utilities
 * Single source of truth for game logic used across ai.js, offline.js, and game.js
 */

// All eight possible winning combinations on a 3×3 board
export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

/**
 * Returns the winning symbol ('X' or 'O') if there is one, otherwise null.
 * Also returns the winning line indices for highlighting.
 * @param {Array<string|null>} board
 * @returns {{ symbol: string, line: number[] } | null}
 */
export function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { symbol: board[a], line };
    }
  }
  return null;
}

/**
 * Returns true if every cell is filled (draw condition).
 * @param {Array<string|null>} board
 * @returns {boolean}
 */
export function checkDraw(board) {
  if (!Array.isArray(board)) return false;
  return board.every(cell => cell !== null);
}

/**
 * Returns indices of all empty cells.
 * @param {Array<string|null>} board
 * @returns {number[]}
 */
export function getEmptyCells(board) {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter(index => index !== null);
}

/**
 * Generates a cryptographically random room ID (6 alphanumeric characters).
 * Falls back to Math.random() in environments without crypto.getRandomValues.
 * @returns {string}
 */
export function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  try {
    const randomValues = new Uint32Array(6);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < 6; i++) {
      id += chars[randomValues[i] % chars.length];
    }
  } catch {
    // Fallback for environments without crypto API
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return id;
}

/**
 * Safely reads an integer from localStorage, returning 0 if missing or invalid.
 * @param {string} key
 * @returns {number}
 */
export function getStoredInt(key) {
  const raw = localStorage.getItem(key);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
