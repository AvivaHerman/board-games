import { type Board, type Cell, ROWS, COLS, dropDisc, checkWinner, getValidColumns } from './logic';

const AI: Cell = 'yellow';
const HUMAN: Cell = 'red';

function scoreWindow(window: Cell[]): number {
  const aiCount = window.filter((c) => c === AI).length;
  const humanCount = window.filter((c) => c === HUMAN).length;
  const emptyCount = window.filter((c) => c === null).length;

  if (aiCount === 4) return 100;
  if (humanCount === 4) return -100;
  if (aiCount === 3 && emptyCount === 1) return 5;
  if (humanCount === 3 && emptyCount === 1) return -4;
  if (aiCount === 2 && emptyCount === 2) return 2;
  return 0;
}

function evaluateBoard(board: Board): number {
  let score = 0;

  // Prefer center column
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === AI) score += 3;
  }

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]);
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      score += scoreWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]);
    }
  }

  // Diagonal down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      score += scoreWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]);
    }
  }

  // Diagonal down-left
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 3; c < COLS; c++) {
      score += scoreWindow([board[r][c], board[r + 1][c - 1], board[r + 2][c - 2], board[r + 3][c - 3]]);
    }
  }

  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === AI) return 10000 + depth;
  if (winner === HUMAN) return -10000 - depth;
  if (winner === 'draw') return 0;
  if (depth === 0) return evaluateBoard(board);

  const validCols = getValidColumns(board);

  if (isMaximizing) {
    let value = -Infinity;
    for (const col of validCols) {
      const result = dropDisc(board, col, AI)!;
      value = Math.max(value, minimax(result.board, depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const col of validCols) {
      const result = dropDisc(board, col, HUMAN)!;
      value = Math.min(value, minimax(result.board, depth - 1, alpha, beta, true));
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
}

export function getBestColumn(board: Board): number {
  const validCols = getValidColumns(board);
  let bestScore = -Infinity;
  let bestCol = validCols[0];

  for (const col of validCols) {
    const result = dropDisc(board, col, AI)!;
    const score = minimax(result.board, 5, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}
