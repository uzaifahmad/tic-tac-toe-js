// Helper: Check for winner
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

// Helper: Get empty cells
function getEmptyCells(board) {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter(index => index !== null);
}

// Helper: Find winning move for a symbol
function findWinningMove(board, symbol) {
  const emptyCells = getEmptyCells(board);
  for (const index of emptyCells) {
    const testBoard = [...board];
    testBoard[index] = symbol;
    if (checkWinner(testBoard) === symbol) {
      return index;
    }
  }
  return null;
}

// Helper: Determine current player by counting pieces
function getCurrentPlayer(board) {
  const xCount = board.filter(cell => cell === 'X').length;
  const oCount = board.filter(cell => cell === 'O').length;
  return xCount > oCount ? 'O' : 'X';
}

// Helper: Minimax with alpha-beta pruning
function minimax(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
  const winner = checkWinner(board);

  // Terminal states
  if (winner === aiSymbol) {
    return 10 - depth;
  }
  if (winner === humanSymbol) {
    return depth - 10;
  }

  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    return 0; // Draw
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = aiSymbol;
      const score = minimax(newBoard, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = humanSymbol;
      const score = minimax(newBoard, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minScore;
  }
}

// Easy: 30% chance to take winning move, otherwise random empty cell
export function getEasyMove(board) {
  const currentPlayer = getCurrentPlayer(board);
  const winningMove = findWinningMove(board, currentPlayer);

  if (winningMove !== null && Math.random() < 0.3) {
    return winningMove;
  }

  const emptyCells = getEmptyCells(board);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Medium: Take winning move, block opponent's, otherwise random
export function getMediumMove(board, aiSymbol) {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  // Try to win
  const winningMove = findWinningMove(board, aiSymbol);
  if (winningMove !== null) {
    return winningMove;
  }

  // Block opponent
  const blockingMove = findWinningMove(board, humanSymbol);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // Random
  const emptyCells = getEmptyCells(board);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Hard: Minimax with alpha-beta pruning (unbeatable)
export function getHardMove(board, aiSymbol) {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';
  const emptyCells = getEmptyCells(board);

  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [...board];
    newBoard[index] = aiSymbol;
    const score = minimax(newBoard, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
}
