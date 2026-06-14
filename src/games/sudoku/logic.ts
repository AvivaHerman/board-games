export type SudokuBoard = (number | null)[][];
export type Difficulty = 'beginner' | 'intermediate' | 'expert';

const EMPTY_CELLS: Record<Difficulty, number> = {
  beginner: 36,
  intermediate: 49,
  expert: 57,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyBoard(): SudokuBoard {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function copyBoard(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]);
}

/** Check if placing `num` at (row, col) is valid on the board (ignoring the cell itself). */
export function isValid(board: SudokuBoard, row: number, col: number, num: number): boolean {
  // Row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return false;
  }
  // Column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return false;
  }
  // 3×3 box
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }
  return true;
}

/** Returns true if `num` at (row, col) conflicts with any existing cell. */
export function isConflict(board: SudokuBoard, row: number, col: number, num: number): boolean {
  return !isValid(board, row, col, num);
}

/** Backtracking solver. Fills `board` in-place. Returns true if solved. */
function solve(board: SudokuBoard): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== null) continue;
      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (const num of digits) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          if (solve(board)) return true;
          board[row][col] = null;
        }
      }
      return false; // no valid digit found
    }
  }
  return true; // all cells filled
}

/** Generate a complete, randomised valid Sudoku solution. */
export function generateSolution(): SudokuBoard {
  const board = emptyBoard();
  solve(board);
  return board;
}

/** Create a puzzle by removing cells from the solution based on difficulty. */
export function createPuzzle(difficulty: Difficulty): { puzzle: SudokuBoard; solution: SudokuBoard } {
  const solution = generateSolution();
  const puzzle = copyBoard(solution);

  // Build a list of all positions and shuffle
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  const target = EMPTY_CELLS[difficulty];

  for (const [r, c] of positions) {
    if (removed >= target) break;
    puzzle[r][c] = null;
    removed++;
  }

  return { puzzle, solution };
}

/** Check if the puzzle board matches the solution exactly. */
export function isSolved(board: SudokuBoard, solution: SudokuBoard): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
