import { Link } from 'react-router-dom';
import type { GameDefinition } from '../types';
import styles from './GameCard.module.css';

interface Props {
  game: GameDefinition;
}

export function GameCard({ game }: Props) {
  return (
    <Link to={`/game/${game.id}`} className={styles.card}>
      <span className={styles.icon}>{game.icon}</span>
      <h3 className={styles.name}>{game.name}</h3>
      <p className={styles.description}>{game.description}</p>
    </Link>
  );
}
