// components/auth/Login.jsx
import React, { useState } from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // For testing without backend - REMOVE LATER
    const demoUsers = {
      'admin@salon.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
      'staff@salon.com': { password: 'staff123', role: 'staff', name: 'John Staff' },
      'staff1@salon.com': { password: 'staff123', role: 'staff', name: 'Jane Staff' }
    };

    try {
      // DEMO MODE - Remove when backend is ready
      if (demoUsers[email] && demoUsers[email].password === password) {
        const user = demoUsers[email];
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
          email: email,
          name: user.name,
          role: user.role
        }));
        
        // Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'staff') {
          navigate('/staff-dashboard');
        }
        return;
      }

      // REAL BACKEND CALL - Uncomment when backend is ready
      /*
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      if (response.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (response.data.user.role === 'staff') {
        navigate('/staff-dashboard');
      }
      */
      
    } catch (err) {
      setError('Invalid credentials. Try: admin@salon.com / admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Salon Management System</h1>
          <p>Login to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <h4>Demo Accounts:</h4>
          <p><strong>Admin:</strong> admin@salon.com / admin123</p>
          <p><strong>Staff 1:</strong> staff@salon.com / staff123</p>
          
        </div>
      </div>
    </div>
  );
};

export default Login;