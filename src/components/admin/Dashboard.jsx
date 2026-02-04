// src/components/admin/Dashboard.jsx - FINAL
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Users, Image } from 'lucide-react';
import './Dashboard.css'; // Import the matching CSS

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData || userData.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="content-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Loading your salon information...</p>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="content-header">
        <div>
          <h2>
            <Users size={24} />
            Welcome back, {user?.name || 'Admin'}!
          </h2>
          <p>Here's what's happening with your salon today.</p>
        </div>
      </div>

      {/* Stats Grid - EXACT same structure as Revenue */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="stat-value">Rs. --</div>
          <p className="stat-desc">From all appointments</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Today's Appointments</h3>
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="stat-value">--</div>
          <p className="stat-desc">Scheduled appointments</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Active Staff</h3>
            <div className="stat-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="stat-value">--</div>
          <p className="stat-desc">Currently working</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending Photos</h3>
            <div className="stat-icon">
              <Image size={24} />
            </div>
          </div>
          <div className="stat-value">--</div>
          <p className="stat-desc">Awaiting approval</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;