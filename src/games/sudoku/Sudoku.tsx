import { useState, useEffect, useRef, useCallback } from 'react';
import { createPuzzle, isConflict, isSolved } from './logic';
import type { SudokuBoard, Difficulty } from './logic';
import type { GameComponentProps } from '../../types';
import styles from './Sudoku.module.css';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const DIFFICULTY_DESCS: Record<Difficulty, string> = {
  beginner: '45 clues — great for learning',
  intermediate: '32 clues — a real challenge',
  expert: '24 clues — for seasoned solvers',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Sudoku({ onGameEnd }: GameComponentProps) {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<SudokuBoard>([]);
  const [given, setGiven] = useState<boolean[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback((diff: Difficulty) => {
    const { puzzle, solution: sol } = createPuzzle(diff);
    const givenMap = puzzle.map((row) => row.map((cell) => cell !== null));
    setDifficulty(diff);
    setBoard(puzzle.map((row) => [...row]));
    setSolution(sol);
    setGiven(givenMap);
    setSelected(null);
    setElapsed(0);
    startTime.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const enterNumber = useCallback(
    (num: number | null) => {
      if (!selected) return;
      const [r, c] = selected;
      if (given[r]?.[c]) return;

      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = num;

        if (num !== null && isSolved(next, solution)) {
          if (timerRef.current) clearInterval(timerRef.current);
          const durationMs = Date.now() - startTime.current;
          // Defer so the board re-renders first
          setTimeout(() => onGameEnd({ winner: 'player', durationMs }), 50);
        }

        return next;
      });
    },
    [selected, given, solution, onGameEnd]
  );

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected) return;
      const [r, c] = selected;
      if (e.key >= '1' && e.key <= '9') {
        enterNumber(Number(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        enterNumber(null);
      } else if (e.key === 'ArrowUp' && r > 0) setSelected([r - 1, c]);
      else if (e.key === 'ArrowDown' && r < 8) setSelected([r + 1, c]);
      else if (e.key === 'ArrowLeft' && c > 0) setSelected([r, c - 1]);
      else if (e.key === 'ArrowRight' && c < 8) setSelected([r, c + 1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, enterNumber]);

  // ── Difficulty picker ──────────────────────────────────────────────────────
  if (!difficulty) {
    return (
      <div className={styles.picker}>
        <h3 className={styles.pickerTitle}>Choose Difficulty</h3>
        <div className={styles.pickerButtons}>
          {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((d) => (
            <button key={d} className={`${styles.diffBtn} ${styles[d]}`} onClick={() => startGame(d)}>
              <span className={styles.diffLabel}>{DIFFICULTY_LABELS[d]}</span>
              <span className={styles.diffDesc}>{DIFFICULTY_DESCS[d]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Helpers for cell styling ───────────────────────────────────────────────
  const [selR, selC] = selected ?? [-1, -1];
  const selBox = selected ? [Math.floor(selR / 3), Math.floor(selC / 3)] : null;

  function cellClass(r: number, c: number): string {
    const classes = [styles.cell];
    const val = board[r]?.[c];
    const isGiven = given[r]?.[c];
    const isSel = r === selR && c === selC;
    const inBox =
      selBox && Math.floor(r / 3) === selBox[0] && Math.floor(c / 3) === selBox[1];
    const inRowCol = r === selR || c === selC;

    if (isGiven) classes.push(styles.given);
    if (isSel) classes.push(styles.selected);
    else if (inBox || inRowCol) classes.push(styles.highlight);

    // Conflict: same non-null value in row/col/box
    if (val !== null && isConflict(board, r, c, val)) classes.push(styles.conflict);

    // Bold user-entered cells that match selection value
    if (!isGiven && val !== null && selected && board[selR]?.[selC] === val && !isSel) {
      classes.push(styles.sameValue);
    }

    return classes.join(' ');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[difficulty]}`}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
        <span className={styles.timer}>{formatTime(elapsed)}</span>
      </div>

      <div className={styles.board}>
        {board.map((row, r) =>
          row.map((val, c) => {
            // thick right border after cols 2, 5
            const thickRight = c === 2 || c === 5;
            // thick bottom border after rows 2, 5
            const thickBottom = r === 2 || r === 5;
            return (
              <button
                key={`${r}-${c}`}
                className={`${cellClass(r, c)} ${thickRight ? styles.thickRight : ''} ${thickBottom ? styles.thickBottom : ''}`}
                onClick={() => setSelected([r, c])}
              >
                {val ?? ''}
              </button>
            );
          })
        )}
      </div>

      <div className={styles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            className={styles.numBtn}
            onClick={() => enterNumber(n)}
          >
            {n}
          </button>
        ))}
        <button className={`${styles.numBtn} ${styles.eraseBtn}`} onClick={() => enterNumber(null)}>
          ✕
        </button>
      </div>
    </div>
  );
}
