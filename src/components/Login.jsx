// File: src/components/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';

// NOTE: Ensure your backend is running on port 3000
const API_URL = 'http://localhost:3000/api/users'; 

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // Store the JWT token and user ID (or other relevant data)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user_id);
      
      // Call the parent handler to update application state
      onLogin(true); 

    } catch (err) {
      console.error('Login error:', err);
      // Display specific error from the backend or a general message
      setError(err.response?.data?.error || 'Login failed. Check your network and credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--color-light-gray)',
        borderRadius: 'var(--space-sm)'
    }}>
      <h2 style={{ color: 'var(--color-accent)', textAlign: 'center' }}>Internal Ops Login</h2>
      
      {error && <p style={{ 
          color: 'var(--color-status-danger)', 
          backgroundColor: '#fdd', 
          padding: 'var(--space-sm)',
          border: '1px solid var(--color-status-danger)'
      }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ color: 'var(--color-dark-gray)', fontSize: 'small' }}>Email</label>
        <input
          type="email"
          id="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <label htmlFor="password" style={{ color: 'var(--color-dark-gray)', fontSize: 'small' }}>Password</label>
        <input
          type="password"
          id="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
          {loading ? 'Logging In...' : 'Login'}
        </button>

        {/* Example Secondary Button */}
        <button type="button" className="btn btn-secondary" style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
          Register (Placeholder)
        </button>
      </form>
    </div>
  );
};

export default Login;