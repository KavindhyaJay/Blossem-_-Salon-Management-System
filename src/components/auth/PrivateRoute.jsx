// src/components/auth/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Check if user has role
    if (!user.role) {
      console.log('❌ User has no role property');
      return <Navigate to="/login" replace />;
    }
    
    // Convert to uppercase for comparison
    const userRole = user.role.toUpperCase();
    const allowedRolesUpper = allowedRoles.map(role => role.toUpperCase());
    
    // Check if user role is allowed
    if (!allowedRolesUpper.includes(userRole)) {
      console.log(`❌ Role ${userRole} not allowed for this route`);
      return <Navigate to="/login" replace />;
    }
    
    console.log(`✅ Access granted for ${userRole}`);
    return children;
    
  } catch (error) {
    console.error('Error parsing user:', error);
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;