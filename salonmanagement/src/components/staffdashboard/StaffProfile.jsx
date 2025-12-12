// components/staffdashboard/StaffProfile.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/StaffDashboard.css';

const StaffProfile = () => {
  const [staffData, setStaffData] = useState(null);

  useEffect(() => {
    // Get user from localStorage (set during login)
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    // Mock data - replace with API call in real app
    const mockStaffData = {
      name: user.name || 'John Doe',
      email: user.email || 'staff@salon.com',
      role: user.role || 'staff',
      phone: '+94 77 123 4567',
      specialization: 'Senior Hair Stylist',
      hireDate: '2023-06-15',
      address: '123 Salon Street, Colombo 05',
      salary: 'Rs 85,000/month',
      status: 'Active',
      employeeId: 'STF-2023-045',
      experience: '5 years',
      services: ['Haircut', 'Coloring', 'Styling', 'Treatment'],
      workingHours: '9:00 AM - 6:00 PM',
      daysOff: ['Sundays']
    };
    
    setStaffData(mockStaffData);
  }, []);

  if (!staffData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="staff-profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p className="profile-subtitle">View your professional information</p>
      </div>

      <div className="profile-content">
        {/* Personal Info Card */}
        <div className="profile-card personal-info">
          <div className="card-header">
            <h3>Personal Information</h3>
            <span className="card-badge">Read Only</span>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <div className="info-value">{staffData.name}</div>
            </div>
            <div className="info-item">
              <label>Employee ID</label>
              <div className="info-value">{staffData.employeeId}</div>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <div className="info-value">{staffData.email}</div>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <div className="info-value">{staffData.phone}</div>
            </div>
            <div className="info-item">
              <label>Address</label>
              <div className="info-value">{staffData.address}</div>
            </div>
            <div className="info-item">
              <label>Status</label>
              <div className="info-value">
                <span className="status-badge active">{staffData.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Info Card */}
        <div className="profile-card professional-info">
          <div className="card-header">
            <h3>Professional Information</h3>
          </div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Role</label>
              <div className="info-value">{staffData.role}</div>
            </div>
            <div className="info-item">
              <label>Specialization</label>
              <div className="info-value">{staffData.specialization}</div>
            </div>
            <div className="info-item">
              <label>Experience</label>
              <div className="info-value">{staffData.experience}</div>
            </div>
            <div className="info-item">
              <label>Hire Date</label>
              <div className="info-value">{staffData.hireDate}</div>
            </div>
            <div className="info-item">
              <label>Salary</label>
              <div className="info-value">{staffData.salary}</div>
            </div>
            <div className="info-item">
              <label>Working Hours</label>
              <div className="info-value">{staffData.workingHours}</div>
            </div>
          </div>

          {/* Services Section */}
          <div className="services-section">
            <label>Services Provided</label>
            <div className="services-tags">
              {staffData.services.map((service, index) => (
                <span key={index} className="service-tag">{service}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Note Section */}
        <div className="profile-note">
          <div className="note-icon">ℹ️</div>
          <div className="note-content">
            <h4>Profile Update Information</h4>
            <p>
              Your profile information is managed by the salon administrator. 
              If you need to update any details (phone number, address, etc.), 
              please contact the admin or HR department.
            </p>
            <p className="note-contact">
              📞 Contact Admin: admin@salon.com | Ext: 101
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;