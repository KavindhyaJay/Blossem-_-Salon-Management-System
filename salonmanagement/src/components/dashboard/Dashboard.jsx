// components/dashboard/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer'; 
import StatsCards from './StatsCards';
import ManagementTools from './ManagementTools';
import StaffTable from './StaffTable';
import ContentManagement from './ContentManagement';
import Appointments from './Appointments';

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'staff':
        return <StaffTable />;
      case 'appointments':
        return <Appointments />;
      case 'content':
        return <ContentManagement />;
      case 'overview':
      default:
        return (
          <>
          
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <Header user={user} onLogout={onLogout} />
      
      <div className="dashboard-content">
        {/* Stats Cards always visible at the top */}
        <StatsCards />
        
        {/* Management Tools navigation always visible */}
        <ManagementTools 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        {/* Dynamic content below based on active section */}
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
      
      {/* FOOTER MOVED OUTSIDE dashboard-content */}
      <Footer />
    </div>
  );
};

export default Dashboard;