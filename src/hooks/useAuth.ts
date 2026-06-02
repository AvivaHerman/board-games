import { useState } from 'react';

const STORAGE_KEY = 'boardgames:currentUser';

export function useAuth() {
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEY)
  );

  const login = (name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsername(null);
  };

  return { username, login, logout };
}
