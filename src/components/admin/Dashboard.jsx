// src/components/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
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
    <div className="admin-container">
      <Sidebar role={user?.role} user={user} />
      
      <main className="main-content">
        <div className="content-header">
          <h2>Welcome back, {user?.name || 'Admin'}! 👋</h2>
          <p>Here's what's happening with your salon today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Revenue</h3>
              <div className="stat-icon">
                <DollarSign size={24} />
              </div>
            </div>
            <div className="stat-value">₹85,500</div>
            <p className="stat-desc">+12% from last month</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Today's Appointments</h3>
              <div className="stat-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="stat-value">23</div>
            <p className="stat-desc">8 completed, 15 upcoming</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Active Staff</h3>
              <div className="stat-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="stat-value">8</div>
            <p className="stat-desc">2 on leave</p>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <h3>Pending Photos</h3>
              <div className="stat-icon">
                <Image size={24} />
              </div>
            </div>
            <div className="stat-value">15</div>
            <p className="stat-desc">Awaiting approval</p>
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Appointments</h3>
            <button className="action-btn">
              View All
            </button>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Staff</th>
                <th>Time</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sarah Johnson</td>
                <td>Hair Coloring</td>
                <td>Emma Wilson</td>
                <td>10:00 AM</td>
                <td><span className="status-badge status-active">Completed</span></td>
                <td>₹3,500</td>
              </tr>
              <tr>
                <td>Mike Ross</td>
                <td>Haircut & Styling</td>
                <td>John Davis</td>
                <td>11:30 AM</td>
                <td><span className="status-badge status-active">In Progress</span></td>
                <td>₹1,500</td>
              </tr>
              <tr>
                <td>Lisa Wang</td>
                <td>Manicure</td>
                <td>Sophia Lee</td>
                <td>2:00 PM</td>
                <td><span className="status-badge status-pending">Upcoming</span></td>
                <td>₹800</td>
              </tr>
              <tr>
                <td>David Chen</td>
                <td>Facial Treatment</td>
                <td>Maria Garcia</td>
                <td>3:30 PM</td>
                <td><span className="status-badge status-pending">Upcoming</span></td>
                <td>₹2,200</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button className="action-btn">
            Add New Staff
          </button>
          <button className="action-btn" style={{ background: '#70a6ec' }}>
            Manage Reception
          </button>
          <button className="action-btn" style={{ background: '#43c03e' }}>
            View Analytics
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;