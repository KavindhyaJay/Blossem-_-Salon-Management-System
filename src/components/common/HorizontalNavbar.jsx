// Alternative simpler version
import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Image,
  UserCheck,
  User,
  DollarSign,
  Scissors
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const HorizontalNavbar = ({ role }) => {
  const adminMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/admin-dashboard' },
    { icon: <Users />, label: 'Staff', path: '/admin-dashboard/staff' },
    { icon: <UserCheck />, label: 'Reception', path: '/admin-dashboard/reception' },
    { icon: <Calendar />, label: 'Appointments', path: '/admin-dashboard/appointments' },
    { icon: <Image />, label: 'Photos', path: '/admin-dashboard/photos' },
    { icon: <Scissors />, label: 'Services', path: '/admin-dashboard/services' },
    { icon: <DollarSign />, label: 'Revenue', path: '/admin-dashboard/revenue' },
  ];

  const staffMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/staff-dashboard' },
    { icon: <Calendar />, label: 'Schedule', path: '/staff-dashboard/schedule' },
    { icon: <Image />, label: 'Photos', path: '/staff-dashboard/photos' },
    { icon: <Scissors />, label: 'Services', path: '/staff-dashboard/services' },
    { icon: <User />, label: 'Profile', path: '/staff-dashboard/profile' },
  ];

  const receptionMenuItems = [
    { icon: <Home />, label: 'Dashboard', path: '/reception-dashboard' },
    { icon: <Calendar />, label: 'Bookings', path: '/reception-dashboard/bookings' },
    { icon: <Users />, label: 'Customers', path: '/reception-dashboard/customers' },
    { icon: <Scissors />, label: 'Services', path: '/reception-dashboard/services' },
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

  const menuItems = getMenuItems();

  return (
    <nav className="horizontal-navbar">
      <ul className="navbar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink 
              to={item.path}
              className={({ isActive }) => 
                `navbar-item ${isActive ? 'active' : ''}`
              }
              end={item.path.includes('dashboard') && !item.path.includes('/')}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default HorizontalNavbar;