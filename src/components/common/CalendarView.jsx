// src/components/common/CalendarView.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CalendarView = ({ userRole, userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8081';

  // Fetch appointments based on user role
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (userRole === 'ADMIN') {
        // Admin sees all appointments
        const dateString = selectedDate.toISOString().split('T')[0];
        response = await axios.get(`${API_BASE_URL}/api/appointments/date/${dateString}`);
      } else if (userRole === 'STAFF') {
        // Staff sees their appointments
        response = await axios.get(`${API_BASE_URL}/api/staff/appointments/today`);
      }
      
      setAppointments(response?.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  // Calendar generation logic
  const getCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const weeks = [];
    let currentWeek = Array(7).fill(null);
    let dayCounter = 1;
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        if (week === 0 && day < startingDayOfWeek) {
          currentWeek[day] = null;
        } else if (dayCounter <= daysInMonth) {
          currentWeek[day] = new Date(year, month, dayCounter);
          dayCounter++;
        } else {
          currentWeek[day] = null;
        }
      }
      weeks.push([...currentWeek]);
      currentWeek = Array(7).fill(null);
    }
    
    return weeks;
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appt => appt.date === dateString);
  };

  const calendarWeeks = getCalendarData();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h3>
          <CalendarIcon size={20} />
          <span>Appointments Calendar</span>
        </h3>
        
        <div className="calendar-controls">
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(-1)}
            disabled={loading}
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="current-month">
            {currentMonth.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </span>
          
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(1)}
            disabled={loading}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <table className="calendar-table">
        <thead>
          <tr>
            {weekdays.map(day => (
              <th key={day} className="weekday-header">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map((week, weekIndex) => (
            <tr key={weekIndex} className="calendar-week">
              {week.map((date, dayIndex) => {
                const dayAppointments = date ? getAppointmentsForDate(date) : [];
                const isSelected = selectedDate && date && 
                  date.toDateString() === selectedDate.toDateString();
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <td
                    key={dayIndex}
                    className={`calendar-day ${!date ? 'empty' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => !loading && handleDateClick(date)}
                  >
                    {date && (
                      <>
                        <div className="day-number">{date.getDate()}</div>
                        {dayAppointments.length > 0 && (
                          <div className="appointment-indicator">
                            <span className="appointment-dot"></span>
                            <span className="appointment-count">{dayAppointments.length}</span>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDate && (
        <div className="appointments-list">
          <div className="selected-date-header">
            <h4>Appointments for {formatDate(selectedDate)}</h4>
            {loading && <span className="loading-text">Loading...</span>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {!loading && appointments.length === 0 ? (
            <div className="no-appointments">
              <p>No appointments scheduled for this date</p>
            </div>
          ) : (
            <div className="appointments-container">
              {appointments.map((appointment, index) => (
                <div key={index} className="appointment-card">
                  <div className="appointment-time">
                    <span className="time">{appointment.time || 'All Day'}</span>
                  </div>
                  <div className="appointment-details">
                    <h5>{appointment.customerName || 'Customer'}</h5>
                    <p className="service">{appointment.service || 'Service'}</p>
                    {userRole === 'ADMIN' && appointment.staff && (
                      <p className="staff">Staff: {appointment.staff}</p>
                    )}
                  </div>
                  <div className="appointment-status">
                    <span className={`status-badge ${appointment.status?.toLowerCase() || 'pending'}`}>
                      {appointment.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;