// src/components/common/Sidebar.jsx
import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Image, 
  Settings,
  DollarSign,
  BarChart3,
  UserCheck,
  User,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role, isOpen, onClose }) => {
  const adminMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: <Users />, label: 'Staff Management', path: '/admin-dashboard/staff' },
    { icon: <UserCheck />, label: 'Reception', path: '/admin-dashboard/reception' },
    { icon: <Calendar />, label: 'Appointments', path: '/admin-dashboard/appointments' },
    { icon: <Image />, label: 'Photo Review', path: '/admin-dashboard/photos' },
    { icon: <DollarSign />, label: 'Revenue', path: '/admin-dashboard/revenue' },
    { icon: <BarChart3 />, label: 'Analytics', path: '/admin-dashboard/analytics' },
    { icon: <Settings />, label: 'Settings', path: '/admin-dashboard/settings' },
  ];

  const staffMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/staff-dashboard' },
    { icon: <Calendar />, label: 'My Schedule', path: '/staff-dashboard/schedule' },
    { icon: <Image />, label: 'Upload Photos', path: '/staff-dashboard/photos' },
    { icon: <User />, label: 'My Profile', path: '/staff-dashboard/profile' },
  ];

  const receptionMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/reception-dashboard' },
    { icon: <Calendar />, label: 'Bookings', path: '/reception-dashboard/bookings' },
    { icon: <Users />, label: 'Customers', path: '/reception-dashboard/customers' },
    { icon: <User />, label: 'Profile', path: '/reception-dashboard/profile' },
  ];

  const getMenuItems = () => {
    switch(role?.toUpperCase()) {
      case 'ADMIN': return adminMenuItems;
      case 'STAFF': return staffMenuItems;
      case 'RECEPTION': return receptionMenuItems;
      default: return adminMenuItems;
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <button className="sidebar-close" onClick={onClose}>
          <X size={20} />
        </button>
      )}
      
      <nav>
        <ul className="sidebar-menu">
          {getMenuItems().map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-item ${isActive ? 'active' : ''}`
                }
                end={item.path.includes('dashboard') && !item.path.includes('/')}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;