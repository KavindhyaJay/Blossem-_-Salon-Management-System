// components/dashboard/StatsCards.jsx
import React from 'react';

const StatsCards = () => {
  const statsData = [
    {
      title: 'Total Income',
      value: 'Rs 85,500',
      description: 'Overall revenue',
      color: '#4caf50',
      icon: '💰'
    },
    {
      title: 'Today\'s Income',
      value: 'Rs 5,500',
      description: 'From confirmed bookings',
      color: '#4caf50',
      icon: '📈'
    },
    {
      title: 'Active Staff',
      value: '8',
      description: 'Currently working',
      color: '#2196f3',
      icon: '👥'
    },
    {
      title: 'Appointments',
      value: '23',
      description: 'Scheduled this week',
      color: '#ff9800',
      icon: '📅'
    }
  ];

  return (
    <div className="stats-section">
      {statsData.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <h3>{stat.title}</h3>
          </div>
          <div className="stat-value" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <p>{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;