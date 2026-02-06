// src/components/admin/AppointmentsManager.jsx - WITHOUT REVENUE STAT CARD
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

  // Helper function to format services array - NEW FUNCTION
  const formatServices = useCallback((services) => {
    if (!services) return 'No Service';
    
    // If it's already a string, return it
    if (typeof services === 'string') return services;
    
    // If it's an array, join with comma
    if (Array.isArray(services)) {
      return services.join(', ');
    }
    
    // If it's an object with services property
    if (services.services && Array.isArray(services.services)) {
      return services.services.join(', ');
    }
    
    // If it's an object, try to extract service names
    if (typeof services === 'object') {
      const values = Object.values(services).filter(val => typeof val === 'string');
      if (values.length > 0) return values.join(', ');
    }
    
    return 'No Service';
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
      
      console.log(`Fetching appointments for date: ${dateStr}`);
      
      const response = await fetch(`${API_BASE_URL}/api/appointments/date/${dateStr}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        setAppointments([]);
        return;
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (Array.isArray(data)) {
        const formattedAppointments = data.map((appt, index) => {
          // DEBUG LOGGING
          console.log(`Appointment ${index}:`, {
            id: appt.id,
            services: appt.services,
            service: appt.service,
            staff: appt.staff,
            bookingStatus: appt.bookingStatus
          });
          
          // Map backend bookingStatus to frontend status
          let frontendStatus = 'pending';
          const bookingStatus = appt.bookingStatus?.toLowerCase();
          
          if (bookingStatus === 'confirmed' || bookingStatus === 'active') {
            frontendStatus = 'confirmed';
          } else if (bookingStatus === 'completed' || bookingStatus === 'done') {
            frontendStatus = 'completed';
          } else if (bookingStatus === 'cancelled' || bookingStatus === 'canceled' || bookingStatus === 'cancelled_by_staff') {
            frontendStatus = 'cancelled';
          } else if (bookingStatus === 'pending' || !bookingStatus) {
            frontendStatus = 'pending';
          }
          
          return {
            id: appt.id || appt._id || `appt-${index}`,
            bookingId: appt.bookingId || appt.bookingNumber || `BK${String(index + 1).padStart(3, '0')}`,
            customerName: appt.customerName || appt.customer?.name || 'Customer',
            // Handle services array - THIS IS THE KEY FIX
            services: appt.services, // Keep the raw array for display
            service: formatServices(appt.services || appt.service), // Formatted string for table display
            staff: appt.staff || appt.staffName || 'Staff',
            date: appt.date || appt.appointmentDate || dateStr,
            time: appt.time || appt.appointmentTime || '10:00 AM',
            status: frontendStatus,
            amount: parseInt(appt.amount || appt.totalAmount || 0),
            customerPhone: appt.customerPhone || appt.customer?.phone,
            duration: appt.duration || '60 min',
            // Backend fields for debugging
            rawServices: appt.services,
            rawBookingStatus: appt.bookingStatus
          };
        });
        
        console.log('Formatted appointments:', formattedAppointments);
        setAppointments(formattedAppointments);
      } else {
        console.warn('Data is not an array:', data);
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, formatDate, getAuthToken, formatServices]);

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
    
    return { total, completed, pending, confirmed, cancelled };
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
    <div className="admina-appointments-manager">
      {/* Header */}
      <div className="admina-appointments-header">
        <div>
          <h2>
            <CalendarIcon size={24} style={{ marginRight: '10px' }} />
            {userRole === 'admin' ? 'Appointments Dashboard' : 'My Schedule'}
          </h2>
          <p>Manage and view appointments</p>
        </div>
        
        <div className="admina-header-actions">
          <div className="admina-filter-group">
            <Filter size={18} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="admina-filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <button 
            className="admina-action-btn admina-refresh-btn"
            onClick={() => fetchAppointmentsByDate(selectedDate)}
            disabled={loading}
          >
            <RefreshCw size={18} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          
          <button className="admina-action-btn admina-export-btn">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - REMOVED REVENUE CARD */}
      <div className="admina-stats-grid">
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Total Appointments</h3>
            <div className="admina-stat-icon">📅</div>
          </div>
          <div className="admina-stat-value">{stats.total}</div>
          <div className="admina-stat-subtitle">Selected Date</div>
        </div>
        
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Completed</h3>
            <div className="admina-stat-icon">✅</div>
          </div>
          <div className="admina-stat-value">{stats.completed}</div>
          <div className="admina-stat-subtitle">Finished</div>
        </div>
        
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Pending</h3>
            <div className="admina-stat-icon">⏳</div>
          </div>
          <div className="admina-stat-value">{stats.pending}</div>
          <div className="admina-stat-subtitle">Awaiting</div>
        </div>
        
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Confirmed</h3>
            <div className="admina-stat-icon">✓</div>
          </div>
          <div className="admina-stat-value">{stats.confirmed}</div>
          <div className="admina-stat-subtitle">Booked</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="admina-calendar-container">
        <div className="admina-calendar-header">
          <div>
            <h2 className="admina-calendar-title">
              <CalendarIcon />
              Appointments Calendar
            </h2>
            <p className="admina-calendar-subtitle">Click on any date to view appointments</p>
          </div>
          
          <div className="admina-calendar-controls">
            <button className="admina-calendar-nav-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={20} />
            </button>
            <span className="admina-calendar-month-display">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button className="admina-calendar-nav-btn" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="admina-calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="admina-calendar-day-header">{day}</div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`
                admina-calendar-day
                ${day.isCurrentMonth ? 'current-month' : 'other-month'}
                ${day.isToday ? 'today' : ''}
                ${day.isSelected ? 'selected' : ''}
              `}
              onClick={() => handleDateClick(day.date)}
              title={`${formatDate(day.date)}: ${day.appointmentCount} appointments`}
            >
              <div className="admina-day-number">{day.date.getDate()}</div>
              
              {day.appointmentCount > 0 && (
                <>
                  <div className={`admina-appointment-dot ${day.isSelected ? 'selected' : ''}`} />
                  {day.appointmentCount > 1 && (
                    <span className="admina-appointment-count-badge">
                      {day.appointmentCount}
                    </span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="admina-selected-date-info">
          <div className="admina-selected-date-label">Currently Viewing:</div>
          <div className="admina-selected-date-value">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="admina-appointment-count-text">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
            {loading && ' (Loading...)'}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="admina-appointments-table-container">
        <div className="admina-table-header">
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          <div className="admina-appointment-count-display">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {loading ? (
          <div className="admina-loading-state">
            <div className="admina-loading-spinner"></div>
            <p>Loading appointments from database...</p>
          </div>
        ) : (
          <>
            {filteredAppointments.length > 0 ? (
              <div className="admina-table-responsive">
                <table className="admina-appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Service(s)</th> {/* Updated column header */}
                      {userRole === 'admin' && <th>Staff</th>}
                      <th>Time</th>
                      <th>Status</th>
                      <th>Amount (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="admina-booking-id">
                          #{appointment.bookingId}
                        </td>
                        <td className="admina-customer-cell">
                          <div className="admina-customer-name">{appointment.customerName}</div>
                          {appointment.customerPhone && (
                            <div className="admina-customer-phone">{appointment.customerPhone}</div>
                          )}
                        </td>
                        <td className="admina-service-cell"> {/* Added className for better styling */}
                          <div className="admina-service-list">
                            {appointment.service}
                          </div>
                          {appointment.rawServices && Array.isArray(appointment.rawServices) && (
                            <div className="admina-service-count">
                              <small>{appointment.rawServices.length} service{appointment.rawServices.length !== 1 ? 's' : ''}</small>
                            </div>
                          )}
                        </td>
                        {userRole === 'admin' && (
                          <td className="admina-staff-cell">{appointment.staff}</td>
                        )}
                        <td className="admina-time-cell">
                          <div className="admina-time-slot">{appointment.time}</div>
                          <div className="admina-duration">{appointment.duration}</div>
                        </td>
                        <td>
                          <span className={`admina-status-badge admina-status-${appointment.status}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                          {appointment.rawBookingStatus && appointment.rawBookingStatus !== appointment.status.toUpperCase() && (
                            <div className="admina-original-status">
                              <small>({appointment.rawBookingStatus})</small>
                            </div>
                          )}
                        </td>
                        <td className="admina-amount-cell">
                          Rs. {appointment.amount?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admina-empty-state">
                <div className="admina-empty-icon">📅</div>
                <h4>No Appointments Found</h4>
                <p>
                  No appointments scheduled for {selectedDate.toLocaleDateString()}
                </p>
                <p className="admina-hint">Try selecting a different date</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManager;