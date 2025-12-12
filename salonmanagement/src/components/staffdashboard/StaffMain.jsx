// components/staffdashboard/StaffMain.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StaffProfile from './StaffProfile';
import StaffCalendar from './StaffCalendar';
import PhotoUpload from './PhotoUpload';
import '../../styles/StaffDashboard.css';

const StaffMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  
  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem('user')) || {};
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'staff') {
      navigate('/');
    }
  }, [navigate, user]);

  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path === 'calendar') setActiveTab('calendar');
    else if (path === 'upload') setActiveTab('upload');
    else setActiveTab('profile');
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'profile' ? '' : tab);
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="staff-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>👨‍💼 Staff Portal</h1>
            <p className="welcome-message">
              Welcome, <strong>{user.name || 'Staff Member'}</strong>!
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return ' Good morning! Ready for today\'s appointments?';
                if (hour < 18) return ' Good afternoon! Hope your day is going well.';
                return ' Good evening! Time to wrap up for the day.';
              })()}
            </p>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
          >
            <span className="tab-icon">👤</span>
            <span className="tab-text">My Profile</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => handleTabClick('calendar')}
          >
            <span className="tab-icon">📅</span>
            <span className="tab-text">My Schedule</span>
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => handleTabClick('upload')}
          >
            <span className="tab-icon">📸</span>
            <span className="tab-text">Customer Photos</span>
          </button>
        </div>

        {/* Main Content Area */}
        <main className="dashboard-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="profile" element={<StaffProfile />} />
              <Route path="calendar" element={<StaffCalendar />} />
              <Route path="upload" element={<PhotoUpload />} />
              <Route path="/" element={<StaffProfile />} />
            </Routes>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default StaffMain;