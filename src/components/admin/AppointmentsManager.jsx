// src/components/admin/AppointmentsManager.jsx - UPDATED WITH totalPayment
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon, Filter, Download, ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './AppointmentsManager.css';

const AppointmentsManager = ({ userRole = 'admin' }) => {
  const [appointments, setAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';
  
  const getAuthToken = useCallback(() => {
    let token = localStorage.getItem('adminToken');
    if (!token) token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('authToken');
    if (!token) token = localStorage.getItem('accessToken');
    return token;
  }, []);

  const formatDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const formatServices = useCallback((services) => {
    if (!services) return 'No Service';
    
    if (typeof services === 'string') return services;
    
    if (Array.isArray(services)) {
      return services.join(', ');
    }
    
    return 'No Service';
  }, []);

  // UPDATED: Now uses totalPayment from backend
  const extractAmount = useCallback((appt) => {
    // Use totalPayment first (main field from database)
    if (appt.totalPayment !== undefined && appt.totalPayment !== null) {
      if (typeof appt.totalPayment === 'number') {
        return appt.totalPayment;
      }
      if (typeof appt.totalPayment === 'string' && appt.totalPayment.trim() !== '') {
        const value = parseFloat(appt.totalPayment);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    
    // Fallback to amount field (for backward compatibility)
    if (appt.amount !== undefined && appt.amount !== null) {
      if (typeof appt.amount === 'number') {
        return appt.amount;
      }
      if (typeof appt.amount === 'string' && appt.amount.trim() !== '') {
        const value = parseFloat(appt.amount);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    
    return 0;
  }, []);

  // Helper function to get service-based default amount
  const getServiceAmount = useCallback((services) => {
    if (!services || !Array.isArray(services)) return 0;
    
    const servicePrices = {
      'Facial': 3500,
      'Professional Makeup': 4000,
      'Hair Color': 3500,
      'Spa Treatment': 5000,
      'Spa Treatment, Facial': 8000,
      'Haircut': 1500,
      'Manicure': 2000,
      'Pedicure': 2500,
      'Massage': 3000,
      'Waxing': 1500,
      'Default': 3500
    };
    
    let total = 0;
    services.forEach(service => {
      if (servicePrices[service]) {
        total += servicePrices[service];
      } else {
        total += servicePrices['Default'];
      }
    });
    
    return total;
  }, []);

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
        const formattedAppointments = data.map((appt, index) => {
          let appointmentId;
          if (appt.id) {
            appointmentId = appt.id;
          } else if (appt._id && appt._id.$oid) {
            appointmentId = appt._id.$oid;
          } else if (appt._id) {
            appointmentId = appt._id;
          } else {
            appointmentId = `appt-${index}`;
          }
          
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
          
          // Extract amount using totalPayment from backend
          const amountValue = extractAmount(appt);
          
          return {
            id: appointmentId,
            bookingId: appt.bookingId || `BK${String(index + 1).padStart(3, '0')}`,
            customerName: appt.customerName || 'Customer',
            email: appt.email,
            services: appt.services,
            service: formatServices(appt.services),
            staff: appt.staff || 'Staff',
            date: appt.date || dateStr,
            time: appt.time || '10:00 AM',
            status: frontendStatus,
            amount: amountValue,
            customerPhone: appt.customerPhone,
            duration: '60 min',
            // Payment details from backend
            payment: appt.payment,
            paymentChecked: appt.paymentChecked,
            customerArrived: appt.customer_arrived,
            rawTotalPayment: appt.totalPayment,
            rawAmount: appt.amount,
            rawBookingStatus: appt.bookingStatus,
            rawPaymentStatus: appt.paymentStatus
          };
        });
        
        setAppointments(formattedAppointments);
      } else {
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, formatDate, getAuthToken, formatServices, extractAmount]);

  const fetchAllAppointmentsForCalendar = useCallback(async (year, month) => {
    try {
      setCalendarLoading(true);
      const token = getAuthToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        setAllAppointments([]);
        return;
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const monthAppointments = data.filter(appt => {
          if (!appt.date) return false;
          const appointmentDate = new Date(appt.date);
          return appointmentDate.getFullYear() === year && 
                 appointmentDate.getMonth() === month;
        });
        
        setAllAppointments(monthAppointments);
      } else {
        setAllAppointments([]);
      }
      
    } catch (error) {
      console.error('Error fetching appointments for calendar:', error);
      setAllAppointments([]);
    } finally {
      setCalendarLoading(false);
    }
  }, [API_BASE_URL, getAuthToken]);

  const generateCalendarDays = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = 0; i < startingDay; i++) {
      const day = prevMonthLastDay - startingDay + i + 1;
      const date = new Date(year, month - 1, day);
      const dateStr = formatDate(date);
      
      const appointmentCount = allAppointments.filter(appt => {
        const apptDate = appt.date?.split('T')[0];
        return apptDate === dateStr;
      }).length;
      
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount
      });
    }
    
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const isSelected = formatDate(date) === formatDate(selectedDate);
      const isToday = formatDate(date) === formatDate(today);
      
      const appointmentCount = allAppointments.filter(appt => {
        const apptDate = appt.date?.split('T')[0];
        return apptDate === dateStr;
      }).length;
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        appointmentCount
      });
    }
    
    const totalCells = 42;
    for (let i = days.length; i < totalCells; i++) {
      const day = i - days.length + 1;
      const date = new Date(year, month + 1, day);
      const dateStr = formatDate(date);
      
      const appointmentCount = allAppointments.filter(appt => {
        const apptDate = appt.date?.split('T')[0];
        return apptDate === dateStr;
      }).length;
      
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount
      });
    }
    
    return days;
  }, [currentMonth, allAppointments, formatDate, selectedDate]);

  const handleDateClick = (date) => {
    if (!date.isCurrentMonth) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    fetchAppointmentsByDate(date);
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    fetchAllAppointmentsForCalendar(newMonth.getFullYear(), newMonth.getMonth());
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    fetchAllAppointmentsForCalendar(newMonth.getFullYear(), newMonth.getMonth());
  };

  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    return { total, completed, pending, confirmed, cancelled };
  }, [appointments]);

  // Calculate total revenue for selected date
  const totalRevenue = useMemo(() => {
    return appointments.reduce((sum, appt) => sum + (appt.amount || 0), 0);
  }, [appointments]);

  useEffect(() => {
    fetchAppointmentsByDate(selectedDate);
    fetchAllAppointmentsForCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
  }, [selectedDate, currentMonth, fetchAppointmentsByDate, fetchAllAppointmentsForCalendar]);

  const calendarDays = generateCalendarDays();
  
  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'all') return true;
    return appt.status === filter;
  });

  // Get payment verification icon
  const getPaymentIcon = (paymentChecked) => {
    if (paymentChecked?.toLowerCase() === 'yes') {
      return <CheckCircle size={14} color="#4CAF50" />;
    }
    return <XCircle size={14} color="#f44336" />;
  };

  // Get arrival status icon
  const getArrivalIcon = (arrived) => {
    if (arrived?.toLowerCase() === 'yes') {
      return <CheckCircle size={14} color="#4CAF50" />;
    }
    return <AlertCircle size={14} color="#FF9800" />;
  };

  return (
    <div className="admina-appointments-manager">
      <div className="admina-appointments-header">
        <div>
          <h2>
            <CalendarIcon size={24} style={{ marginRight: '10px' }} />
            {userRole === 'admin' ? 'Appointments Dashboard' : 'My Schedule'}
          </h2>
          <p>Manage and view appointments with payment details</p>
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
            onClick={() => {
              fetchAppointmentsByDate(selectedDate);
              fetchAllAppointmentsForCalendar(currentMonth.getFullYear(), currentMonth.getMonth());
            }}
            disabled={loading || calendarLoading}
          >
            <RefreshCw size={18} />
            <span>{(loading || calendarLoading) ? 'Loading...' : 'Refresh'}</span>
          </button>
          
          <button className="admina-action-btn admina-export-btn">
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

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
            <h3>Total Revenue</h3>
            <div className="admina-stat-icon">💰</div>
          </div>
          <div className="admina-stat-value revenue">
            Rs. {totalRevenue.toLocaleString()}
          </div>
          <div className="admina-stat-subtitle">From {stats.total} appointments</div>
        </div>
        
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Paid Appointments</h3>
            <div className="admina-stat-icon">✅</div>
          </div>
          <div className="admina-stat-value">
            {appointments.filter(a => a.payment === 'Paid').length}
          </div>
          <div className="admina-stat-subtitle">Payment verified</div>
        </div>
        
        <div className="admina-stat-card">
          <div className="admina-stat-header">
            <h3>Average Per Appointment</h3>
            <div className="admina-stat-icon">📊</div>
          </div>
          <div className="admina-stat-value">
            Rs. {stats.total > 0 ? Math.round(totalRevenue / stats.total).toLocaleString() : '0'}
          </div>
          <div className="admina-stat-subtitle">Based on actual payments</div>
        </div>
      </div>

      <div className="admina-calendar-container">
        <div className="admina-calendar-header">
          <div>
            <h2 className="admina-calendar-title">
              <CalendarIcon />
              Appointments Calendar
            </h2>
            <p className="admina-calendar-subtitle">
              {calendarLoading ? 'Loading appointment counts...' : 'Appointment counts shown on each date'}
            </p>
          </div>
          
          <div className="admina-calendar-controls">
            <button 
              className="admina-calendar-nav-btn" 
              onClick={handlePrevMonth}
              disabled={calendarLoading}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="admina-calendar-month-display">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {calendarLoading && ' (Loading...)'}
            </span>
            <button 
              className="admina-calendar-nav-btn" 
              onClick={handleNextMonth}
              disabled={calendarLoading}
            >
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
                ${day.appointmentCount > 0 ? 'has-appointments' : ''}
              `}
              onClick={() => handleDateClick(day.date)}
              title={`${formatDate(day.date)}: ${day.appointmentCount} appointment${day.appointmentCount !== 1 ? 's' : ''}`}
            >
              <div className="admina-day-number">{day.date.getDate()}</div>
              
              {day.appointmentCount > 0 && (
                <div className="admina-appointment-count-display">
                  <span className={`admina-appointment-count-badge ${day.appointmentCount > 9 ? 'double-digit' : ''}`}>
                    {day.appointmentCount > 9 ? '9+' : day.appointmentCount}
                  </span>
                  {day.appointmentCount === 1 && <div className="admina-appointment-dot" />}
                </div>
              )}
              
              {day.isToday && day.appointmentCount === 0 && (
                <div className="admina-today-indicator">Today</div>
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
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} • 
            Total Revenue: <strong>Rs. {totalRevenue.toLocaleString()}</strong>
            {loading && ' (Loading...)'}
          </div>
          <div className="admina-calendar-summary">
            <span className="admina-calendar-appointments-total">
              {allAppointments.length} appointments in {currentMonth.toLocaleDateString('en-US', { month: 'long' })}
            </span>
            <span className="admina-calendar-days-with-appointments">
              {Array.from(new Set(allAppointments.map(a => a.date?.split('T')[0]))).length} days with appointments
            </span>
          </div>
        </div>
      </div>

      <div className="admina-appointments-table-container">
        <div className="admina-table-header">
          <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
          <div className="admina-appointment-count-display">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            {totalRevenue > 0 && (
              <span className="admina-total-amount">
                • Total: Rs. {totalRevenue.toLocaleString()}
              </span>
            )}
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
                      <th>Service(s)</th>
                      {userRole === 'admin' && <th>Staff</th>}
                      <th>Time</th>
                      <th>Payment Status</th>
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
                          {appointment.email && (
                            <div className="admina-customer-email">{appointment.email}</div>
                          )}
                        </td>
                        <td className="admina-service-cell">
                          <div className="admina-service-list">
                            {appointment.service}
                          </div>
                        </td>
                        {userRole === 'admin' && (
                          <td className="admina-staff-cell">{appointment.staff}</td>
                        )}
                        <td className="admina-time-cell">
                          <div className="admina-time-slot">{appointment.time}</div>
                        </td>
                        <td className="admina-payment-cell">
                          <div className="admina-payment-info">
                            <div className="admina-payment-status-row">
                              {getPaymentIcon(appointment.paymentChecked)}
                              <span className={`admina-payment-status-badge ${appointment.payment === 'Paid' ? 'paid' : 'pending'}`}>
                                {appointment.payment || 'Pending'}
                              </span>
                            </div>
                            <div className="admina-payment-details">
                              {appointment.paymentChecked && (
                                <span className="admina-payment-checked">
                                  Checked: {appointment.paymentChecked}
                                </span>
                              )}
                              {appointment.customerArrived && (
                                <span className="admina-customer-arrived">
                                  {getArrivalIcon(appointment.customerArrived)}
                                  Arrived: {appointment.customerArrived}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="admina-amount-cell">
                          <div className="admina-amount-value">
                            Rs. {appointment.amount?.toLocaleString() || '0'}
                          </div>
                          {appointment.rawTotalPayment && (
                            <div className="admina-amount-source">
                              <small>from totalPayment</small>
                            </div>
                          )}
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