import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { offlineService } from './services/OfflineService';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('agent_token'));
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Gestion du Thème (Clair/Sombre par défaut sur système)
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }

    // Gestion de la connexion
    const handleOnline = () => {
      setIsOnline(true);
      offlineService.syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('agent_token'));
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1 z-[9999]">
          Mode Hors-Ligne Actif
        </div>
      )}
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/scan/:tripId"
            element={isAuthenticated ? <Scanner /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
