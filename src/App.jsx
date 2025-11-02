import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom'; // <-- Add this import
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedRole, setSelectedRole] = useState(1); // Default to Administrator

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

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