// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ProjectList from './components/ProjectList'; // <-- NEW IMPORT

// Placeholder for your main application dashboard
const Dashboard = () => {
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        window.location.reload(); // Simple way to reset state
    };

    return (
        <>
            <div style={{ 
                padding: 'var(--space-md)', 
                textAlign: 'right', 
                backgroundColor: 'var(--color-light-gray)',
                borderBottom: '1px solid var(--color-medium-gray)'
            }}>
                <button 
                    className="btn" 
                    onClick={handleLogout} 
                    style={{ 
                        backgroundColor: 'var(--color-status-danger)', 
                        color: 'white', 
                        border: 'none',
                        fontWeight: 'normal',
                        padding: 'var(--space-xs) var(--space-sm)'
                    }}
                >
                    Logout
                </button>
            </div>
            
            {/* Render the Project List below the header */}
            <ProjectList /> 
        </>
    );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;