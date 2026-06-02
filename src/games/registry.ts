import type { GameDefinition } from '../types';
import { TicTacToe } from './tic-tac-toe/TicTacToe';
import { ConnectFour } from './connect-four/ConnectFour';

export const gameRegistry: GameDefinition[] = [
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3×3 grid. Get three in a row to win.',
    icon: '❌⭕',
    component: TicTacToe,
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    description: 'Drop discs into columns. Connect four to win!',
    icon: '🔴🟡',
    component: ConnectFour,
  },
];

export function getGameById(id: string): GameDefinition | undefined {
  return gameRegistry.find((g) => g.id === id);
}
