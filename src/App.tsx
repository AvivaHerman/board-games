import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';

export default function App() {
  const { username, login, logout } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage username={username} onLogin={login} onLogout={logout} />}
      />
      <Route path="/game/:gameId" element={<GamePage username={username} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
