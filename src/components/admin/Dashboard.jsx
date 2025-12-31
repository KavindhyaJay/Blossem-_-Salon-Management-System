// src/components/admin/Dashboard.jsx - CLEAN VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Common.css';
import { DollarSign, Calendar, Users, Image } from 'lucide-react';

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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <main className="main-content">
        <div className="content-header">
          <h2>Welcome back, {user?.name || 'Admin'}! 👋</h2>
          <p>Here's what's happening with your salon today.</p>
        </div>

        {/* Stats Cards Only */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Revenue</h3>
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="stat-value">--</div>
            <p className="stat-desc">Loading data...</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Today's Appointments</h3>
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="stat-value">--</div>
            <p className="stat-desc">Loading data...</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Active Staff</h3>
              <div className="stat-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="stat-value">--</div>
            <p className="stat-desc">Loading data...</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Pending Photos</h3>
              <div className="stat-icon">
                <Image size={24} />
              </div>
            </div>
            <div className="stat-value">--</div>
            <p className="stat-desc">Loading data...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;