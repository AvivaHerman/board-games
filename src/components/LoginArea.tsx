import { useState } from 'react';
import styles from './LoginArea.module.css';

interface Props {
  username: string | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
}

export function LoginArea({ username, onLogin, onLogout }: Props) {
  const [input, setInput] = useState('');

  if (username) {
    return (
      <div className={styles.loggedIn}>
        <span>Playing as <strong>{username}</strong></span>
        <button className={styles.switchBtn} onClick={onLogout}>
          Switch User
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onLogin(trimmed);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Enter your name to play..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <button className={styles.loginBtn} type="submit">
        Play
      </button>
    </form>
  );
}
