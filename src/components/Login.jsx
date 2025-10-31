import React, { useState } from 'react';

const API_URL = 'http://localhost:3000/api/auth';

const Login = ({ onLogin, selectedRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Admin can log in as any role
        if (data.role_id === 1) {
          // Always allow
        }
        // Project Manager can log in as Project Manager or Team Member
        else if (data.role_id === 2) {
          if (selectedRole === 1) {
            setError('Project Manager cannot log in as Administrator.');
            setLoading(false);
            return;
          }
        }
        // Team Member can log in only as Team Member
        else if (data.role_id === 3) {
          if (selectedRole !== 3) {
            setError('Team Member can only log in as Team Member.');
            setLoading(false);
            return;
          }
        }
        // If role_id is not recognized
        else {
          setError('Invalid role.');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user_id);
        onLogin(true);
        
      } else {
        setError(data.error || 'Login failed. Check your credentials.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container max-w-md mx-auto mt-32 p-8 rounded-xl">
        <h2 className="text-green-600 text-center text-4xl font-semibold mb-16">Internal Ops Login</h2>
        {error && (
          <p className="text-red-500 bg-transparent p-2 mb-6 text-center rounded-full">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              id="email"
              className={`peer w-full h-12 px-3 py-2 border border-slate-300 rounded-full bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${email ? 'peer-filled' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder=" "
            />
            <label
              htmlFor="email"
              className={`absolute left-5 top-2 bg-white px-1 transition-all duration-200 pointer-events-none
                text-gray-700 text-sm
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-700
                peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-500
                ${email ? 'peer-filled-label' : ''}
              `}
            >
              Email
            </label>
          </div>
          <div className="relative">
            <input
              type="password"
              id="password"
              className={`peer w-full h-12 px-3 py-2 border border-slate-300 rounded-full bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500 ${password ? 'peer-filled' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className={`absolute left-5 top-2 bg-white px-1 transition-all duration-200 pointer-events-none
                text-gray-700 text-sm
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-700
                peer-focus:-top-3 peer-focus:text-xs peer-focus:text-blue-500
                ${password ? 'peer-filled-label' : ''}
              `}
            >
              Password
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-full border border-blue-600 hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;