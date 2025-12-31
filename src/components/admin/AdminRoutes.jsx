// src/components/admin/AdminRoutes.jsx - WITH STICKY HEADER CONTAINER
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HorizontalNavbar from '../common/HorizontalNavbar';
import Header from '../common/Header';
import AdminDashboard from './Dashboard';
import StaffManagement from './StaffManagement';
import ReceptionManagement from './ReceptionManagement';
import AppointmentsManager from './AppointmentsManager';
import PhotoReview from './PhotoReview';
import Revenue from './Revenue';
import { useNavigate } from 'react-router-dom';

const AdminRoutes = () => {
  const navigate = useNavigate();

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sticky header container */}
      <div className="sticky-header-container">
        <Header user={user} onLogout={handleLogout} />
        <HorizontalNavbar role={user?.role} />
      </div>
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/reception" element={<ReceptionManagement />} />
          <Route path="/appointments" element={<AppointmentsManager />} />
          <Route path="/photos" element={<PhotoReview />} />
          <Route path="/revenue" element={<Revenue />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminRoutes;