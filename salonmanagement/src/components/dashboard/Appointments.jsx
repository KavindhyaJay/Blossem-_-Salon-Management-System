// components/dashboard/Appointments.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateAppointments, setDateAppointments] = useState([]);

  // API base URL
  const API_BASE_URL = 'http://localhost:8081/api';

  // Fetch appointments for a specific date
  const fetchAppointmentsByDate = async (date) => {
    if (!date) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const response = await axios.get(`${API_BASE_URL}/appointments/date/${dateString}`);
      
      // Transform data to match frontend format
      const transformedAppointments = response.data.map(appointment => ({
        id: appointment.id,
        bookingId: appointment.bookingId,
        customerName: appointment.customerName,
        service: appointment.services ? appointment.services.join(', ') : 'No services',
        services: appointment.services || [],
        time: appointment.time,
        staff: appointment.staff,
        date: appointment.date,
        amount: appointment.amount,
        bookingStatus: appointment.bookingStatus,
        paymentStatus: appointment.paymentStatus,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }));
      
      setDateAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to fetch appointments');
      setDateAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all appointments (optional - for calendar indicators)
  const fetchAllAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`);
      
      const transformedAppointments = response.data.map(appointment => ({
        id: appointment.id,
        customerName: appointment.customerName,
        service: appointment.services ? appointment.services.join(', ') : 'No services',
        time: appointment.time,
        staff: appointment.staff,
        date: appointment.date,
        amount: appointment.amount,
        bookingStatus: appointment.bookingStatus,
        paymentStatus: appointment.paymentStatus
      }));
      
      setAppointments(transformedAppointments);
    } catch (err) {
      console.error('Error fetching all appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Get appointments for a specific date from local state
  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(appt => appt.date === dateString);
  };

  // Handle date click
  const handleDateClick = async (date) => {
    if (date) {
      setSelectedDate(date);
      await fetchAppointmentsByDate(date);
    }
  };

  // Format date to YYYY-MM-DD
  const formatDateToAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Get calendar data
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
    setSelectedDate(null);
    setDateAppointments([]);
  };

  const calendarWeeks = getCalendarData();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return '#4caf50';
      case 'PENDING':
      case 'CUSTOMER_NOT_ARRIVED':
        return '#ff9800';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'PAID':
        return '#4caf50';
      case 'PENDING':
        return '#ff9800';
      case 'PARTIAL':
        return '#ffc107';
      default:
        return '#666';
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    
    // If time is already in AM/PM format, return as is
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return `Rs. ${parseInt(amount).toLocaleString()}`;
  };

  // Fetch appointments when component mounts
  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="appointments-section">
      <div className="section-header">
        <h2>Appointments Calendar</h2>
        <button 
          className="nav-btn refresh-btn"
          onClick={() => {
            fetchAllAppointments();
            if (selectedDate) {
              fetchAppointmentsByDate(selectedDate);
            }
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="calendar-full-container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(-1)}
            disabled={loading}
          >
            ‹ Prev Month
          </button>
          <h3 className="calendar-title">
            {currentMonth.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
          <button 
            className="nav-btn" 
            onClick={() => navigateMonth(1)}
            disabled={loading}
          >
            Next Month ›
          </button>
        </div>

        {/* Calendar Table */}
        <table className="calendar-full-table">
          <thead>
            <tr>
              {weekdays.map(day => (
                <th key={day} className="weekday-header">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendarWeeks.map((week, weekIndex) => (
              <tr key={weekIndex} className="calendar-week">
                {week.map((date, dayIndex) => {
                  const dayAppointments = date ? getAppointmentsForDate(date) : [];
                  const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();
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
                          {isToday && (
                            <div className="today-label">Today</div>
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
      </div>

      {/* Selected Date Appointments */}
      {selectedDate && (
        <div className="appointments-list">
          <div className="selected-date-header">
            <div>
              <h3>Appointments for {formatDate(selectedDate)}</h3>
              <p className="date-api-format">{formatDateToAPI(selectedDate)}</p>
            </div>
            <div className="header-right">
              <span className="appointment-count-badge">
                {loading ? '...' : dateAppointments.length} appointment(s)
              </span>
              <button 
                className="refresh-small-btn"
                onClick={() => fetchAppointmentsByDate(selectedDate)}
                disabled={loading}
              >
                {loading ? '↻' : '↻'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : dateAppointments.length > 0 ? (
            <div className="appointments-container">
              {dateAppointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-time">
                    <div className="time-main">{formatTime(appointment.time)}</div>
                    <div className="time-duration">1h</div>
                  </div>
                  <div className="appointment-details">
                    <div className="customer-info">
                      <h4>{appointment.customerName}</h4>
                      <p className="booking-id">Booking ID: {appointment.bookingId}</p>
                    </div>
                    <div className="service-info">
                      <p className="service-name">
                        {appointment.services && appointment.services.length > 0 
                          ? appointment.services.map((s, i) => (
                              <span key={i} className="service-tag">{s}</span>
                            ))
                          : 'No services specified'
                        }
                      </p>
                      <p className="staff-info">
                        👤 Staff: <strong>{appointment.staff}</strong>
                      </p>
                    </div>
                    <div className="amount-info">
                      <span className="amount-badge">{formatAmount(appointment.amount)}</span>
                    </div>
                  </div>
                  <div className="status-container">
                    <div 
                      className="appointment-status booking-status"
                      style={{ backgroundColor: getStatusColor(appointment.bookingStatus) }}
                    >
                      {appointment.bookingStatus || 'Unknown'}
                    </div>
                    <div 
                      className="appointment-status payment-status"
                      style={{ backgroundColor: getPaymentStatusColor(appointment.paymentStatus) }}
                    >
                      {appointment.paymentStatus || 'Unknown'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-appointments">
              <p>📅 No appointments scheduled for this date</p>
              <p className="sub-text">Select another date or check back later</p>
            </div>
          )}
        </div>
      )}

      {/* Initial State Message */}
      {!selectedDate && !loading && (
        <div className="no-date-selected">
          <p>👆 Click on any date in the calendar to view appointments</p>
        </div>
      )}
    </div>
  );
};

export default Appointments;