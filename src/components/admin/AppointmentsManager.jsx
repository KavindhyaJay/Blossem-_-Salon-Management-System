// src/components/admin/AppointmentsManager.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import './AppointmentsManager.css';

const AppointmentsManager = ({ userRole = 'admin' }) => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get API base URL from environment
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
  
  // Get auth token - wrapped in useCallback
  const getAuthToken = useCallback(() => {
    let token = localStorage.getItem('adminToken');
    if (!token) token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('authToken');
    if (!token) token = localStorage.getItem('accessToken');
    return token;
  }, []);

  // Format date to YYYY-MM-DD - wrapped in useCallback
  const formatDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Format amount to Indian Rupees - wrapped in useCallback
  const formatRupees = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Fetch appointments - wrapped in useCallback
  const fetchAppointmentsByDate = useCallback(async (date) => {
    if (!date) return;
    
    try {
      setLoading(true);
      
      const dateStr = formatDate(date);
      const token = getAuthToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/date/${dateStr}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        setAppointments([]);
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formattedAppointments = data.map((appt, index) => ({
          id: appt.id || appt._id || `appt-${index}`,
          bookingId: appt.bookingId || appt.bookingNumber || `BK${String(index + 1).padStart(3, '0')}`,
          customerName: appt.customerName || appt.customer?.name || 'Customer',
          service: appt.service || appt.serviceType || 'Service',
          staff: appt.staff || appt.staffName || 'Staff',
          date: appt.date || appt.appointmentDate || dateStr,
          time: appt.time || appt.appointmentTime || '10:00 AM',
          status: (appt.status || 'pending').toLowerCase(),
          amount: parseInt(appt.amount || appt.totalAmount || 0),
          customerPhone: appt.customerPhone || appt.customer?.phone,
          duration: appt.duration || '60 min'
        }));
        
        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
      
    } catch (error) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, formatDate, getAuthToken]);

  // Generate calendar days - wrapped in useMemo
  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - startingDay + i + 1;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount: 0
      });
    }
    
    // Current month days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const isSelected = formatDate(date) === formatDate(selectedDate);
      
      const dateAppointments = appointments.filter(appt => {
        const apptDate = appt.date?.split('T')[0];
        return apptDate === dateStr;
      });
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: formatDate(date) === formatDate(today),
        isSelected,
        appointmentCount: dateAppointments.length
      });
    }
    
    // Next month days
    const totalCells = 42;
    for (let i = days.length; i < totalCells; i++) {
      const day = i - days.length + 1;
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount: 0
      });
    }
    
    return days;
  }, [currentMonth, appointments, formatDate, selectedDate]);

  const handleDateClick = (date) => {
    if (!date.isCurrentMonth) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    fetchAppointmentsByDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Get stats - wrapped in useMemo
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    const revenue = appointments
      .filter(a => a.status === 'completed' || a.status === 'confirmed')
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    return { total, completed, pending, confirmed, cancelled, revenue };
  }, [appointments]);

  // Load appointments on mount and when selectedDate changes
  useEffect(() => {
    fetchAppointmentsByDate(selectedDate);
  }, [selectedDate, fetchAppointmentsByDate]);

  const calendarDays = generateCalendarDays();
  
  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  return (
    <div className="appointments-manager">
      {/* Header */}
      <div className="appointments-header">
        <div>
          <h2>
            <CalendarIcon size={24} style={{ marginRight: '10px' }} />
            {userRole === 'admin' ? 'Appointments Dashboard' : 'My Schedule'}
          </h2>
          <p>Manage and view appointments</p>
        </div>
        
        <div className="header-actions">
          <div className="filter-group">
            <Filter size={18} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            className="action-btn refresh-btn"
            onClick={() => fetchAppointmentsByDate(selectedDate)}
            disabled={loading}
          >
            <RefreshCw size={18} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          
          <button className="action-btn export-btn">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Appointments</h3>
            <div className="stat-icon">📅</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-subtitle">Selected Date</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Completed</h3>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value completed">{stats.completed}</div>
          <div className="stat-subtitle">Finished</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending</h3>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value pending">{stats.pending}</div>
          <div className="stat-subtitle">Awaiting</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Confirmed</h3>
            <div className="stat-icon">✓</div>
          </div>
          <div className="stat-value confirmed">{stats.confirmed}</div>
          <div className="stat-subtitle">Booked</div>
        </div>
        
        {userRole === 'admin' && (
          <div className="stat-card">
            <div className="stat-header">
              <h3>Revenue</h3>
              <div className="stat-icon">₹</div>
            </div>
            <div className="stat-value revenue">
              {formatRupees(stats.revenue)}
            </div>
            <div className="stat-subtitle">Earnings</div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        <div className="calendar-header">
          <div>
            <h2 className="calendar-title">
              <CalendarIcon />
              Appointments Calendar
            </h2>
            <p className="calendar-subtitle">Click on any date to view appointments</p>
          </div>
          
          <div className="calendar-controls">
            <button className="calendar-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <span className="calendar-month-display">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="calendar-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                calendar-day
                ${day.isCurrentMonth ? 'current-month' : 'other-month'}
                ${day.isToday ? 'today' : ''}
                ${day.isSelected ? 'selected' : ''}
              `}
              onClick={() => handleDateClick(day.date)}
              title={`${formatDate(day.date)}: ${day.appointmentCount} appointments`}
            >
              <div className="day-number">{day.date.getDate()}</div>
              
              {day.appointmentCount > 0 && (
                <>
                  <div className={`appointment-dot ${day.isSelected ? 'selected' : ''}`} />
                  {day.appointmentCount > 1 && (
                    <span className="appointment-count-badge">
                      {day.appointmentCount}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="selected-date-info">
          <div className="selected-date-label">Currently Viewing:</div>
          <div className="selected-date-value">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="appointment-count-text">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
            {loading && ' (Loading...)'}
          </div>
        </div>
      </div>

      {/* Appointments Table - REMOVED ACTIONS COLUMN */}
      <div className="appointments-table-container">
        <div className="table-header">
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          <div className="appointment-count-display">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading appointments from database...</p>
          </div>
        ) : (
          <>
            {filteredAppointments.length > 0 ? (
              <div className="table-responsive">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Service</th>
                      {userRole === 'admin' && <th>Staff</th>}
                      <th>Time</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="booking-id">
                          #{appointment.bookingId}
                        </td>
                        <td className="customer-cell">
                          <div className="customer-name">{appointment.customerName}</div>
                          {appointment.customerPhone && (
                            <div className="customer-phone">{appointment.customerPhone}</div>
                          )}
                        </td>
                        <td>{appointment.service}</td>
                        {userRole === 'admin' && (
                          <td className="staff-cell">{appointment.staff}</td>
                        )}
                        <td className="time-cell">
                          <div className="time-slot">{appointment.time}</div>
                          <div className="duration">{appointment.duration}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${appointment.status}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="amount-cell">
                          {formatRupees(appointment.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h4>No Appointments Found</h4>
                <p>
                  No appointments scheduled for {selectedDate.toLocaleDateString()}
                </p>
                <p className="hint">Try selecting a different date</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManager;