// components/staffdashboard/StaffCalendar.jsx
import React, { useState, useEffect } from 'react';
import '../../styles/StaffDashboard.css';

const StaffCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  // Mock appointments data
  useEffect(() => {
    const mockAppointments = [
      { 
        id: 1, 
        date: '2024-01-10', 
        time: '10:00 AM', 
        service: 'Haircut', 
        customer: 'John Smith', 
        status: 'completed',
        duration: '1 hour',
        price: 'Rs 2,500'
      },
      { 
        id: 2, 
        date: '2024-01-10', 
        time: '02:00 PM', 
        service: 'Coloring', 
        customer: 'Sarah Lee', 
        status: 'upcoming',
        duration: '2 hours',
        price: 'Rs 5,000'
      },
      { 
        id: 3, 
        date: '2024-01-10', 
        time: '04:00 PM', 
        service: 'Manicure', 
        customer: 'Mike Ross', 
        status: 'upcoming',
        duration: '1 hour',
        price: 'Rs 1,800'
      },
      { 
        id: 4, 
        date: '2024-01-11', 
        time: '11:00 AM', 
        service: 'Facial', 
        customer: 'Emma Watson', 
        status: 'upcoming',
        duration: '1.5 hours',
        price: 'Rs 3,500'
      },
    ];
    setAppointments(mockAppointments);
  }, []);

  // Filter appointments for selected date
  const todayAppointments = appointments.filter(apt => 
    apt.date === '2024-01-10' // Hardcoded for demo
  );

  // Calendar days
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthDays = Array.from({length: 31}, (_, i) => i + 1);
  
  // Days with appointments (for demo)
  const daysWithAppointments = [5, 10, 15, 20, 25];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="staff-calendar-page">
      <div className="calendar-header">
        <h2>My Appointments Calendar</h2>
        <p className="subtitle">View and manage your daily schedule</p>
      </div>

      <div className="calendar-content">
        {/* Today's Appointments */}
        <div className="today-appointments card">
          <div className="card-header">
            <h3>Today's Appointments</h3>
            <span className="date-display">{formatDate(selectedDate)}</span>
          </div>
          
          {todayAppointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="appointments-list">
              {todayAppointments.map(appointment => (
                <div key={appointment.id} className={`appointment-item ${appointment.status}`}>
                  <div className="appointment-time">
                    <span className="time">{appointment.time}</span>
                    <span className="duration">{appointment.duration}</span>
                  </div>
                  <div className="appointment-details">
                    <h4>{appointment.service}</h4>
                    <p className="customer">Customer: {appointment.customer}</p>
                    <p className="price">{appointment.price}</p>
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${appointment.status}`}>
                      {appointment.status === 'completed' ? '✓ Completed' : '● Upcoming'}
                    </span>
                    <button className="action-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar View */}
        <div className="calendar-view card">
          <div className="card-header">
            <h3>January 2024</h3>
            <div className="calendar-controls">
              <button className="control-btn">‹</button>
              <span className="current-month">January 2024</span>
              <button className="control-btn">›</button>
            </div>
          </div>

          <div className="calendar-grid">
            {/* Days of week header */}
            <div className="weekdays">
              {daysOfWeek.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="days-grid">
              {monthDays.map(day => (
                <button
                  key={day}
                  className={`day-cell ${day === 10 ? 'selected' : ''} ${daysWithAppointments.includes(day) ? 'has-appointment' : ''}`}
                  onClick={() => setSelectedDate(new Date(2024, 0, day))}
                >
                  <span className="day-number">{day}</span>
                  {daysWithAppointments.includes(day) && (
                    <span className="appointment-dot"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot selected-dot"></span>
              <span>Selected Date</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot appointment-dot"></span>
              <span>Has Appointments</span>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="upcoming-appointments card">
          <div className="card-header">
            <h3>Upcoming This Week</h3>
          </div>
          
          <div className="upcoming-list">
            {appointments
              .filter(apt => apt.status === 'upcoming')
              .slice(0, 3)
              .map(appointment => (
                <div key={appointment.id} className="upcoming-item">
                  <div className="upcoming-date">
                    <span className="date">{appointment.date.split('-')[2]}</span>
                    <span className="month">Jan</span>
                  </div>
                  <div className="upcoming-details">
                    <h4>{appointment.service}</h4>
                    <p>{appointment.time} • {appointment.customer}</p>
                  </div>
                  <button className="remind-btn">Set Reminder</button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffCalendar;