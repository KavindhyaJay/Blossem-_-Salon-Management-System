// src/components/staff/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'STAFF') {
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
        <p>Loading staff dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar role={user?.role} />
      
      <main className="main-content">
        <div className="content-header">
          <h2>Staff Dashboard</h2>
          <p>Welcome, {user?.name || 'Staff Member'}!</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Today's Appointments</h3>
              <div className="stat-icon">📅</div>
            </div>
            <div className="stat-value">5</div>
            <p className="stat-desc">Next: 2:00 PM</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Photos Uploaded</h3>
              <div className="stat-icon">📸</div>
            </div>
            <div className="stat-value">24</div>
            <p className="stat-desc">This month</p>
          </div>
        </div>
        
        <div style={{ padding: '30px', textAlign: 'center', background: 'white', borderRadius: '12px' }}>
          <h3>Staff Features Coming Soon</h3>
          <p>Photo upload, schedule management, and more!</p>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;