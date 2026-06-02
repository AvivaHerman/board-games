export type Cell = 'X' | 'O' | null;
export type Board = Cell[];

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function createBoard(): Board {
  return Array(9).fill(null);
}

export function makeMove(board: Board, index: number, player: Cell): Board | null {
  if (board[index] !== null) return null;
  const next = [...board];
  next[index] = player;
  return next;
}

export function checkWinner(board: Board): 'X' | 'O' | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) return 'draw';
  return null;
}

export function getEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i);
    return acc;
  }, []);
}
