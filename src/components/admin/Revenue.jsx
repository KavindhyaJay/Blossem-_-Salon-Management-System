// src/components/admin/Revenue.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import axios from 'axios';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8081';

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from /api/admin/revenue endpoints
      // For now, using mock data
      setRevenueData({
        today: 5500,
        thisWeek: 38500,
        thisMonth: 155000,
        total: 855000
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  return (
    <div className="main-content">
      <div className="content-header">
        <h2>
          <DollarSign size={24} style={{ marginRight: '10px' }} />
          Revenue Dashboard
        </h2>
        <p>Track your salon's financial performance</p>
      </div>

      {/* Revenue Stats */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <h3>Today's Revenue</h3>
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="stat-value">₹{revenueData.today.toLocaleString()}</div>
          <p className="stat-desc">From today's appointments</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>This Week</h3>
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="stat-value">₹{revenueData.thisWeek.toLocaleString()}</div>
          <p className="stat-desc">+15% from last week</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>This Month</h3>
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="stat-value">₹{revenueData.thisMonth.toLocaleString()}</div>
          <p className="stat-desc">+12% from last month</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="stat-value">₹{revenueData.total.toLocaleString()}</div>
          <p className="stat-desc">All-time earnings</p>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>Recent Transactions</h3>
          <button className="action-btn">
            Export Report
          </button>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Staff</th>
              <th>Amount</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2024-01-15</td>
              <td>Sarah Johnson</td>
              <td>Hair Coloring</td>
              <td>Emma Wilson</td>
              <td>₹3,500</td>
              <td><span className="status-badge status-active">Paid</span></td>
            </tr>
            <tr>
              <td>2024-01-15</td>
              <td>Mike Ross</td>
              <td>Haircut & Styling</td>
              <td>John Davis</td>
              <td>₹1,500</td>
              <td><span className="status-badge status-active">Paid</span></td>
            </tr>
            <tr>
              <td>2024-01-14</td>
              <td>Lisa Wang</td>
              <td>Manicure</td>
              <td>Sophia Lee</td>
              <td>₹800</td>
              <td><span className="status-badge status-active">Paid</span></td>
            </tr>
            <tr>
              <td>2024-01-14</td>
              <td>David Chen</td>
              <td>Facial Treatment</td>
              <td>Maria Garcia</td>
              <td>₹2,200</td>
              <td><span className="status-badge status-pending">Pending</span></td>
            </tr>
            <tr>
              <td>2024-01-13</td>
              <td>Robert Kim</td>
              <td>Massage Therapy</td>
              <td>Alex Turner</td>
              <td>₹3,000</td>
              <td><span className="status-badge status-active">Paid</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Service Performance */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ 
          color: 'white', 
          marginBottom: '20px',
          fontSize: '20px'
        }}>
          Top Performing Services
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {[
            { name: 'Hair Coloring', revenue: 75000, bookings: 25 },
            { name: 'Facial Treatment', revenue: 45000, bookings: 18 },
            { name: 'Haircut & Styling', revenue: 35000, bookings: 35 },
            { name: 'Manicure/Pedicure', revenue: 28000, bookings: 40 }
          ].map((service, index) => (
            <div key={index} style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h4 style={{ color: 'white', marginBottom: '10px' }}>{service.name}</h4>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#db3232',
                marginBottom: '5px'
              }}>
                ₹{service.revenue.toLocaleString()}
              </div>
              <div style={{ color: '#888', fontSize: '14px' }}>
                {service.bookings} bookings
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Revenue;