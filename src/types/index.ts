import type { ComponentType } from 'react';

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  bestTimeMs: number | null;
}

export interface GameComponentProps {
  onGameEnd: (result: GameResult) => void;
}

export interface GameResult {
  winner: 'player' | 'computer' | 'draw';
  durationMs: number;
}

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: ComponentType<GameComponentProps>;
}
