import type { GameStats } from '../types';
import styles from './StatsPanel.module.css';

interface Props {
  stats: GameStats;
}

function formatTime(ms: number | null): string {
  if (ms === null) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

function winRate(stats: GameStats): string {
  if (stats.totalGames === 0) return '—';
  return `${Math.round((stats.wins / stats.totalGames) * 100)}%`;
}

export function StatsPanel({ stats }: Props) {
  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Your Stats</h3>
      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.value}>{stats.totalGames}</span>
          <span className={styles.label}>Games</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{winRate(stats)}</span>
          <span className={styles.label}>Win Rate</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{stats.wins}</span>
          <span className={styles.label}>Wins</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{stats.losses}</span>
          <span className={styles.label}>Losses</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{stats.draws}</span>
          <span className={styles.label}>Draws</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.value}>{formatTime(stats.bestTimeMs)}</span>
          <span className={styles.label}>Best Time</span>
        </div>
      </div>
    </div>
  );
}
