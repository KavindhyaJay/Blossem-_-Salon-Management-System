// src/components/staff/Dashboard.jsx - UPDATED MODULAR
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import Header from '../common/Header';
import HorizontalNavbar from '../common/HorizontalNavbar';
import StaffAppointments from './StaffAppointments';
import StaffPhotos from './StaffPhotos';
import StaffProfile from './StaffProfile';
import StaffServices from './StaffServices';
import DashboardHome from './DashboardHome';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('staffToken') || 
           localStorage.getItem('authToken');
  }, []);

  // Fetch staff profile
  const fetchStaffProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          alert('Your account is deactivated. Contact admin.');
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      const formattedUser = {
        ...userData,
        role: 'STAFF',
        name: userData.name || 'Staff Member'
      };
      
      localStorage.setItem('user', JSON.stringify(formattedUser));
      setUser(formattedUser);
      return formattedUser;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, [API_BASE_URL, getAuthToken, navigate]);

  // Initialize dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      
      // Check if user exists in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || storedUser.role !== 'STAFF') {
        navigate('/login');
        return;
      }
      
      // Always fetch fresh user data
      const freshUser = await fetchStaffProfile();
      if (!freshUser) {
        navigate('/login');
        return;
      }
      
      setUser(freshUser);
      setLoading(false);
    };

    initializeDashboard();
  }, [fetchStaffProfile, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="staff-loading-container">
        <div className="staff-loading-spinner"></div>
        <p className="staff-loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-container">
      <Header user={user} onLogout={handleLogout} theme="dark" />
      <HorizontalNavbar role={user?.role} />
      
      <main className="staff-main-content">
        <Routes>
          <Route path="/" element={<DashboardHome user={user} />} />
          <Route path="/schedule" element={<StaffAppointments user={user} />} />
          <Route path="/photos" element={<StaffPhotos user={user} />} />
          <Route path="/services" element={<StaffServices user={user} />} />
          <Route path="/profile" element={<StaffProfile user={user} />} />
        </Routes>
      </main>
    </div>
  );
};

export default StaffDashboard;