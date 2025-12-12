// components/dashboard/ContentManagement.jsx
import React from 'react'; // Remove useState import

const ContentManagement = () => {
  const services = [
    {
      id: 1,
      name: 'Haircut & Styling',
      price: 'Rs 1,500',
      duration: '45 min',
      category: 'Hair',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Hair Coloring',
      price: 'Rs 3,500',
      duration: '2 hours',
      category: 'Hair',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Manicure',
      price: 'Rs 800',
      duration: '30 min',
      category: 'Nails',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Facial Treatment',
      price: 'Rs 2,200',
      duration: '1 hour',
      category: 'Skincare',
      status: 'Inactive'
    }
  ];

  return (
    <div className="content-management">
      <div className="section-header">
        <h2>Service Management</h2>
        <button className="add-btn">
          + Add New Service
        </button>
      </div>

      <div className="services-table">
        <div className="table-header">
          <div className="table-cell">ID</div>
          <div className="table-cell">Service Name</div>
          <div className="table-cell">Category</div>
          <div className="table-cell">Price</div>
          <div className="table-cell">Duration</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>
        {services.map(service => (
          <div key={service.id} className="table-row">
            <div className="table-cell">{service.id}</div>
            <div className="table-cell">{service.name}</div>
            <div className="table-cell">{service.category}</div>
            <div className="table-cell">{service.price}</div>
            <div className="table-cell">{service.duration}</div>
            <div className="table-cell">
              <span className={`status-badge ${service.status.toLowerCase()}`}>
                {service.status}
              </span>
            </div>
            <div className="table-cell actions">
              <button className="action-btn edit">Edit</button>
              <button className="action-btn delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;