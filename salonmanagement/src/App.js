// App.js - Make sure routes are correct
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import StaffMain from './components/staffdashboard/StaffMain';
import './styles/App.css';
import './styles/Login.css';
import './styles/StaffDashboard.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {/* Public route - Login page */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Admin route */}
          <Route path="/admin-dashboard/*" element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Protected Staff route */}
          <Route path="/staff-dashboard/*" element={
            <ProtectedRoute allowedRole="staff">
              <StaffMain />
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;