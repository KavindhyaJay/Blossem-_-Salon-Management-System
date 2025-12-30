// src/components/common/Header.jsx
import React, { useState } from 'react';
import { LogOut, Menu } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <button 
        className="menu-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ display: 'none' }} // Hide on desktop, show via CSS on mobile
      >
        <Menu size={20} />
      </button>
      
      <header className="dashboard-header">
        <div className="header-left">
          <h1>SALON BLOSSOMS</h1>
          <p style={{ color: '#aaa', fontSize: '14px' }}>{user?.role || 'ADMIN'} Panel</p>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          
          <div className="user-details">
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.role || 'Role'} • {user?.email || 'email@example.com'}</p>
          </div>
          
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;