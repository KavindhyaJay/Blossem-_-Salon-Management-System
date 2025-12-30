// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoutes from './components/admin/AdminRoutes';
import StaffDashboard from './components/staff/Dashboard';
import ReceptionDashboard from './components/reception/Dashboard';
import './styles/Common.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin routes */}
          <Route path="/admin-dashboard/*" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminRoutes />
            </PrivateRoute>
          } />
          
          {/* Protected Staff routes */}
          <Route path="/staff-dashboard/*" element={
            <PrivateRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </PrivateRoute>
          } />
          
          {/* Protected Reception routes */}
          <Route path="/reception-dashboard/*" element={
            <PrivateRoute allowedRoles={['RECEPTION']}>
              <ReceptionDashboard />
            </PrivateRoute>
          } />
          
          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;