import { useState, useCallback } from 'react';
import { getJson, setJson } from '../utils/storage';
import type { GameStats, GameResult } from '../types';

const defaultStats: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  bestTimeMs: null,
};

function storageKey(username: string, gameId: string) {
  return `boardgames:stats:${username}:${gameId}`;
}

export function useGameStats(username: string | null, gameId: string) {
  const key = username ? storageKey(username, gameId) : null;

  const [stats, setStats] = useState<GameStats>(
    () => (key ? getJson(key, defaultStats) : defaultStats)
  );

  const recordGame = useCallback(
    (result: GameResult) => {
      if (!key) return;
      setStats((prev) => {
        const next: GameStats = {
          totalGames: prev.totalGames + 1,
          wins: prev.wins + (result.winner === 'player' ? 1 : 0),
          losses: prev.losses + (result.winner === 'computer' ? 1 : 0),
          draws: prev.draws + (result.winner === 'draw' ? 1 : 0),
          bestTimeMs:
            result.winner === 'player'
              ? prev.bestTimeMs === null
                ? result.durationMs
                : Math.min(prev.bestTimeMs, result.durationMs)
              : prev.bestTimeMs,
        };
        setJson(key, next);
        return next;
      });
    },
    [key]
  );

  return { stats, recordGame };
}
