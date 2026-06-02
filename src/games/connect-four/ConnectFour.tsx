import { useState, useEffect, useRef } from 'react';
import { createBoard, dropDisc, checkWinner, ROWS, COLS } from './logic';
import { getBestColumn } from './ai';
import type { Board } from './logic';
import type { GameComponentProps } from '../../types';
import styles from './ConnectFour.module.css';

export function ConnectFour({ onGameEnd }: GameComponentProps) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const col = getBestColumn(board);
      const result = dropDisc(board, col, 'yellow');
      if (!result) return;

      setBoard(result.board);
      const winner = checkWinner(result.board);
      if (winner) {
        setGameOver(true);
        onGameEnd({
          winner: winner === 'red' ? 'player' : winner === 'yellow' ? 'computer' : 'draw',
          durationMs: Date.now() - startTime.current,
        });
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board, onGameEnd]);

  const handleColumnClick = (col: number) => {
    if (!isPlayerTurn || gameOver) return;

    const result = dropDisc(board, col, 'red');
    if (!result) return;

    setBoard(result.board);
    const winner = checkWinner(result.board);
    if (winner) {
      setGameOver(true);
      onGameEnd({
        winner: winner === 'red' ? 'player' : winner === 'yellow' ? 'computer' : 'draw',
        durationMs: Date.now() - startTime.current,
      });
    } else {
      setIsPlayerTurn(false);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.turn}>
        {gameOver ? 'Game Over' : isPlayerTurn ? 'Your turn (Red)' : 'Computer thinking...'}
      </p>
      <div className={styles.board}>
        {Array.from({ length: COLS }, (_, col) => (
          <div
            key={col}
            className={`${styles.column} ${hoverCol === col && isPlayerTurn && !gameOver ? styles.columnHover : ''}`}
            onClick={() => handleColumnClick(col)}
            onMouseEnter={() => setHoverCol(col)}
            onMouseLeave={() => setHoverCol(null)}
          >
            {Array.from({ length: ROWS }, (_, row) => {
              const cell = board[row][col];
              return (
                <div key={row} className={styles.cellWrapper}>
                  <div
                    className={`${styles.disc} ${
                      cell === 'red' ? styles.red : cell === 'yellow' ? styles.yellow : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
