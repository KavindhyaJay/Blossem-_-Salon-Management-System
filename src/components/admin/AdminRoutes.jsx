// src/components/admin/AdminRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './Dashboard';
import StaffManagement from './StaffManagement';
import ReceptionManagement from './ReceptionManagement';
import AppointmentsManager from './AppointmentsManager'; // Changed from Appointments
import PhotoReview from './PhotoReview';
import Revenue from './Revenue';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/staff" element={<StaffManagement />} />
      <Route path="/reception" element={<ReceptionManagement />} />
      <Route path="/appointments" element={<AppointmentsManager />} /> {/* Updated */}
      <Route path="/photos" element={<PhotoReview />} />
      <Route path="/revenue" element={<Revenue />} />
    </Routes>
  );
};

export default AdminRoutes;