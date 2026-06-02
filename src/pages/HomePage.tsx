import { LoginArea } from '../components/LoginArea';
import { GameCard } from '../components/GameCard';
import { gameRegistry } from '../games/registry';
import styles from './HomePage.module.css';

interface Props {
  username: string | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
}

export function HomePage({ username, onLogin, onLogout }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Board Games</h1>
        <p className={styles.subtitle}>Pick a game and challenge the computer</p>
      </header>

      <section className={styles.loginSection}>
        <LoginArea username={username} onLogin={onLogin} onLogout={onLogout} />
      </section>

      <section className={styles.gamesGrid}>
        {gameRegistry.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>
    </div>
  );
}
