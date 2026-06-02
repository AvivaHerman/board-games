import { type Board, type Cell, makeMove, checkWinner, getEmptyCells } from './logic';

function minimax(board: Board, isMaximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === 'O') return 1;
  if (winner === 'X') return -1;
  if (winner === 'draw') return 0;

  const empty = getEmptyCells(board);
  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) {
      const next = makeMove(board, i, 'O' as Cell)!;
      best = Math.max(best, minimax(next, false));
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) {
      const next = makeMove(board, i, 'X' as Cell)!;
      best = Math.min(best, minimax(next, true));
    }
    return best;
  }
}

export function getBestMove(board: Board): number {
  const empty = getEmptyCells(board);
  let bestScore = -Infinity;
  let bestMove = empty[0];

  for (const i of empty) {
    const next = makeMove(board, i, 'O' as Cell)!;
    const score = minimax(next, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = i;
    }
  }

  return bestMove;
}
