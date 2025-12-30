// src/components/reception/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const ReceptionDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'RECEPTION') {
      navigate('/login');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reception dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar role={user?.role} />
      
      <main className="main-content">
        <div className="content-header">
          <h2>Reception Dashboard</h2>
          <p>Welcome, {user?.name || 'Reception Staff'}!</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Today's Bookings</h3>
              <div className="stat-icon">📅</div>
            </div>
            <div className="stat-value">12</div>
            <p className="stat-desc">3 walk-ins</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Customers Today</h3>
              <div className="stat-icon">👥</div>
            </div>
            <div className="stat-value">15</div>
            <p className="stat-desc">+2 waiting</p>
          </div>
        </div>
        
        <div style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
          <h3>Reception Features Coming Soon</h3>
          <p>Booking management, customer check-in, and more!</p>
        </div>
      </main>
    </div>
  );
};

export default ReceptionDashboard;