import React from 'react';
import './Header.css';

const Header = ({ onAdd }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="brand">
          <h1>🌿 Salon Reception System</h1>
          <p className="tag">Manage Appointments & Customer Arrivals</p>
        </div>
      </div>
      <div className="header-right">
        <button className="btn-add" onClick={onAdd}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Appointment
        </button>
      </div>
    </header>
  );
};

export default Header;
