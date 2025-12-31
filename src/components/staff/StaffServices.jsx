// src/components/staff/StaffServices.jsx - PLACEHOLDER
import React from 'react';
import { Scissors, Clock, Users, Star } from 'lucide-react';
import './StaffServices.css';

const StaffServices = ({ user }) => {
  const services = [
    { name: 'Haircut', duration: '45 min', price: '$45', rating: 4.8 },
    { name: 'Hair Color', duration: '2 hours', price: '$120', rating: 4.9 },
    { name: 'Hair Styling', duration: '30 min', price: '$35', rating: 4.7 },
    { name: 'Manicure', duration: '1 hour', price: '$30', rating: 4.6 },
    { name: 'Pedicure', duration: '1 hour', price: '$40', rating: 4.7 },
    { name: 'Facial', duration: '1.5 hours', price: '$80', rating: 4.9 }
  ];

  return (
    <div className="staff-services">
      {/* Header */}
      <div className="services-header">
        <h2>My Services</h2>
        <p>Manage your service offerings and availability</p>
      </div>

      <div className="services-content">
        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">
                <Scissors size={24} />
              </div>
              <h3 className="service-name">{service.name}</h3>
              
              <div className="service-details">
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{service.duration}</span>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <span>{service.price}</span>
                </div>
                <div className="detail-item">
                  <Star size={16} />
                  <span>{service.rating}</span>
                </div>
              </div>

              <div className="service-actions">
                <button className="action-btn edit-btn">Edit</button>
                <button className="action-btn toggle-btn">Available</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Service */}
        <div className="add-service-card">
          <h3>Add New Service</h3>
          <p>Expand your service offerings to attract more clients</p>
          <button className="add-service-btn">
            + Add Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffServices;