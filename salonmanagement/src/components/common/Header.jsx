// components/common/Header.jsx
import React from 'react';
import '../../styles/Header.css';

const Header = ({ user, onLogout }) => {
  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // If parent component passed logout function, use it
    if (onLogout && typeof onLogout === 'function') {
      onLogout();
    } else {
      // Force page reload to go back to login
      window.location.href = '/';
    }
  };

  // Get user data from localStorage if not passed as prop
  const currentUser = user || JSON.parse(localStorage.getItem('user')) || { 
    username: 'User', 
    name: 'User',
    email: 'user@salon.com',
    role: 'user'
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="brand-section">
          <div className="brand-logo">
            <span className="logo-icon">🌸</span>
            <div className="brand-text">
              <h1 className="brand-title">Salon Blossoms</h1>
              <p className="brand-subtitle">Premium Beauty & Salon Management</p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{currentUser.name || currentUser.username || 'User'}</span>
              <span className="user-role">{currentUser.role ? `(${currentUser.role})` : ''}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;