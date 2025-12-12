// components/dashboard/ManagementTools.jsx
import React from 'react';

const ManagementTools = ({ activeSection, setActiveSection }) => {
  const tools = [
    {
      title: 'Overview',
      description: 'Dashboard overview',
      icon: '📊',
      section: 'overview'
    },
    {
      title: 'Staff Management',
      description: 'Manage staff members',
      icon: '👥',
      section: 'staff'
    },
    {
      title: 'Appointments',
      description: 'View bookings',
      icon: '📅',
      section: 'appointments'
    },
    {
      title: 'Content Management',
      description: 'Website content',
      icon: '📝',
      section: 'content'
    }
  ];

  return (
    <div className="management-section">
      <h2>Management Tools</h2>
      <div className="management-cards">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            className={`management-card ${activeSection === tool.section ? 'active' : ''}`}
            onClick={() => setActiveSection(tool.section)}
          >
            <div className="tool-icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagementTools;