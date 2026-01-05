import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState(1); // Default to Administrator
  const timerRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  // Session expiry after 10 mins of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      setIsAuthenticated(false);
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, 10 * 60 * 1000); // 10 minutes
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        {isAuthenticated ? (
          <Dashboard roleId={selectedRole} />
        ) : (
          <Login onLogin={setIsAuthenticated} selectedRole={selectedRole} />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;