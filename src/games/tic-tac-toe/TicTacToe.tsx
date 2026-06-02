import { useState, useEffect, useRef } from 'react';
import { createBoard, makeMove, checkWinner } from './logic';
import { getBestMove } from './ai';
import type { Board } from './logic';
import type { GameComponentProps } from '../../types';
import styles from './TicTacToe.module.css';

export function TicTacToe({ onGameEnd }: GameComponentProps) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (isPlayerTurn || gameOver) return;

    const timer = setTimeout(() => {
      const move = getBestMove(board);
      const nextBoard = makeMove(board, move, 'O')!;
      setBoard(nextBoard);

      const winner = checkWinner(nextBoard);
      if (winner) {
        setGameOver(true);
        onGameEnd({
          winner: winner === 'X' ? 'player' : winner === 'O' ? 'computer' : 'draw',
          durationMs: Date.now() - startTime.current,
        });
      } else {
        setIsPlayerTurn(true);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [isPlayerTurn, gameOver, board, onGameEnd]);

  const handleClick = (index: number) => {
    if (!isPlayerTurn || gameOver || board[index]) return;

    const nextBoard = makeMove(board, index, 'X');
    if (!nextBoard) return;
    setBoard(nextBoard);

    const winner = checkWinner(nextBoard);
    if (winner) {
      setGameOver(true);
      onGameEnd({
        winner: winner === 'X' ? 'player' : winner === 'O' ? 'computer' : 'draw',
        durationMs: Date.now() - startTime.current,
      });
    } else {
      setIsPlayerTurn(false);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.turn}>
        {gameOver ? 'Game Over' : isPlayerTurn ? 'Your turn (X)' : 'Computer thinking...'}
      </p>
      <div className={styles.board}>
        {board.map((cell, i) => (
          <button
            key={i}
            className={`${styles.cell} ${cell === 'X' ? styles.x : cell === 'O' ? styles.o : ''}`}
            onClick={() => handleClick(i)}
            disabled={!isPlayerTurn || gameOver || cell !== null}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}
