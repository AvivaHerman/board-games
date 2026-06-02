export type Cell = 'red' | 'yellow' | null;
export type Board = Cell[][];

export const ROWS = 6;
export const COLS = 7;

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function dropDisc(board: Board, col: number, player: Cell): { board: Board; row: number } | null {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === null) {
      const next = board.map((r) => [...r]);
      next[row][col] = player;
      return { board: next, row };
    }
  }
  return null;
}

export function checkWinner(board: Board): 'red' | 'yellow' | 'draw' | null {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = board[row][col];
      if (!cell) continue;

      for (const [dr, dc] of directions) {
        let count = 1;
        for (let k = 1; k < 4; k++) {
          const r = row + dr * k;
          const c = col + dc * k;
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== cell) break;
          count++;
        }
        if (count >= 4) return cell;
      }
    }
  }

  if (board.every((row) => row.every((cell) => cell !== null))) return 'draw';
  return null;
}

export function getValidColumns(board: Board): number[] {
  const cols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) cols.push(c);
  }
  return cols;
}
