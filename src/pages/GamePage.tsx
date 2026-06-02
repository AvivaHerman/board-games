import { useState, useCallback } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getGameById } from '../games/registry';
import { useGameStats } from '../hooks/useGameStats';
import { StatsPanel } from '../components/StatsPanel';
import type { GameResult } from '../types';
import styles from './GamePage.module.css';

interface Props {
  username: string | null;
}

export function GamePage({ username }: Props) {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? getGameById(gameId) : undefined;
  const { stats, recordGame } = useGameStats(username, gameId ?? '');
  const [result, setResult] = useState<GameResult | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleGameEnd = useCallback(
    (r: GameResult) => {
      setResult(r);
      recordGame(r);
    },
    [recordGame]
  );

  const handlePlayAgain = () => {
    setResult(null);
    setGameKey((k) => k + 1);
  };

  if (!game) return <Navigate to="/" replace />;

  if (!username) {
    return (
      <div className={styles.page}>
        <Link to="/" className={styles.backBtn}>Home</Link>
        <div className={styles.loginPrompt}>
          <p>Please log in on the home page to play.</p>
          <Link to="/" className={styles.homeLink}>Go to Home</Link>
        </div>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backBtn}>&#8592; Back</Link>
        <h2 className={styles.gameName}>{game.name}</h2>
        <div className={styles.spacer} />
      </div>

      <div className={styles.content}>
        <div className={styles.gameArea}>
          <GameComponent key={gameKey} onGameEnd={handleGameEnd} />

          {result && (
            <div className={styles.overlay}>
              <div className={styles.resultCard}>
                <p className={styles.resultText}>
                  {result.winner === 'player'
                    ? 'You Win!'
                    : result.winner === 'computer'
                      ? 'Computer Wins!'
                      : "It's a Draw!"}
                </p>
                <p className={styles.resultTime}>
                  Time: {Math.round(result.durationMs / 1000)}s
                </p>
                <button className={styles.playAgainBtn} onClick={handlePlayAgain}>
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <StatsPanel stats={stats} />
      </div>
    </div>
  );
}
