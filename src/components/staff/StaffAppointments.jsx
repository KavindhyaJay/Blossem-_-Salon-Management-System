// src/components/staff/StaffAppointments.jsx - UPDATED WITH MONTHLY APPOINTMENT COUNTS
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Scissors, 
  CheckCircle, 
  XCircle,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarDays,
  Phone,
  DollarSign
} from 'lucide-react';
import './StaffAppointments.css';

const StaffAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [monthAppointments, setMonthAppointments] = useState({}); // Stores appointments for the entire month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [staffName, setStaffName] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('staffToken') || 
           localStorage.getItem('authToken');
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format amount to Sri Lankan Rupees (LKR)
  const formatLKR = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Helper function to extract amount from totalPayment field
  const extractAmount = (appt) => {
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
  };

  // Fetch staff profile to get staff name
  const fetchStaffProfile = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Staff profile:', data);
        if (data.name) {
          setStaffName(data.name);
        }
      }
    } catch (error) {
      console.error('Error fetching staff profile:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch appointments for the ENTIRE MONTH (for calendar display)
  const fetchMonthAppointments = useCallback(async () => {
    if (!currentMonth) return;
    
    setLoadingMonth(true);
    
    try {
      const token = getAuthToken();
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Get first and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = formatDate(firstDay);
      const endDate = formatDate(lastDay);
      
      console.log(`Fetching appointments for month range: ${startDate} to ${endDate}`);
      
      // Use the new monthly range endpoint
      const endpoint = `${API_BASE_URL}/api/staff/appointments/range?start=${startDate}&end=${endDate}`;
      
      console.log(`Calling endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Month range response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Monthly appointments data:', data);
        
        let appointmentsByDate = {};
        
        // Handle different response formats
        if (data && data.appointmentsByDate) {
          // Use the grouped data if available
          appointmentsByDate = data.appointmentsByDate;
        } else if (data && data.appointments && Array.isArray(data.appointments)) {
          // Group appointments by date manually
          data.appointments.forEach(appt => {
            if (appt.date) {
              const dateKey = appt.date.split('T')[0]; // Remove time part if exists
              if (!appointmentsByDate[dateKey]) {
                appointmentsByDate[dateKey] = [];
              }
              appointmentsByDate[dateKey].push(appt);
            }
          });
        }
        
        console.log(`Found appointments for ${Object.keys(appointmentsByDate).length} dates`);
        setMonthAppointments(appointmentsByDate);
        
        // Update selected date appointments from the month data
        const selectedDateStr = formatDate(selectedDate);
        if (appointmentsByDate[selectedDateStr]) {
          // Map and sort appointments for selected date
          const mappedAppointments = mapAppointmentsData(appointmentsByDate[selectedDateStr], selectedDateStr);
          setAppointments(mappedAppointments);
        } else {
          setAppointments([]);
        }
        
      } else {
        const errorText = await response.text();
        console.error('Month range API Error:', errorText);
        setMonthAppointments({});
        setAppointments([]);
      }
      
    } catch (error) {
      console.error('Error fetching month appointments:', error);
      setMonthAppointments({});
      setAppointments([]);
    } finally {
      setLoadingMonth(false);
    }
  }, [API_BASE_URL, getAuthToken, currentMonth, selectedDate]);

  // Helper function to map appointment data
  const mapAppointmentsData = (appointmentsData, dateStr) => {
    if (!appointmentsData || !Array.isArray(appointmentsData)) return [];
    
    const mappedAppointments = appointmentsData.map(appt => {
      // Map backend bookingStatus to frontend status
      let status = 'pending';
      const bookingStatus = appt.bookingStatus?.toLowerCase();
      
      if (bookingStatus === 'confirmed' || bookingStatus === 'active') {
        status = 'confirmed';
      } else if (bookingStatus === 'completed' || bookingStatus === 'done') {
        status = 'completed';
      } else if (bookingStatus === 'cancelled' || bookingStatus === 'canceled') {
        status = 'cancelled';
      } else if (bookingStatus === 'pending' || !bookingStatus) {
        status = 'pending';
      }
      
      // Extract amount using totalPayment
      const amount = extractAmount(appt);
      
      return {
        id: appt.id,
        bookingId: appt.bookingId || `BK${appt.id?.substring(0, 4) || '0001'}`,
        customerName: appt.customerName || 'Customer',
        service: Array.isArray(appt.services) ? appt.services.join(', ') : appt.services || 'Service',
        time: appt.time || '10:00 AM',
        date: appt.date || dateStr,
        status: status,
        amount: amount,
        totalPayment: appt.totalPayment,
        rawAmount: appt.amount,
        customerPhone: appt.customerPhone || appt.phone || '+94 77 XXX XXXX',
        duration: '60 min',
        staff: appt.staff || staffName
      };
    });
    
    // Sort appointments by time
    return mappedAppointments.sort((a, b) => {
      const timeA = a.time?.toUpperCase() || '';
      const timeB = b.time?.toUpperCase() || '';
      
      // Helper to convert time to 24-hour format for sorting
      const timeTo24Hour = (timeStr) => {
        if (!timeStr) return 0;
        
        let time = timeStr.toUpperCase();
        const isPM = time.includes('PM');
        const isAM = time.includes('AM');
        
        // Extract hours and minutes
        time = time.replace(/[AP]M/i, '').trim();
        const parts = time.split(':');
        let hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        
        // Convert 12-hour to 24-hour
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        return hours * 100 + minutes;
      };
      
      return timeTo24Hour(timeA) - timeTo24Hour(timeB);
    });
  };

  // Fetch appointments for specific date (for when month data is already loaded)
  const fetchAppointmentsForDate = useCallback((date) => {
    const dateStr = formatDate(date);
    
    if (monthAppointments[dateStr]) {
      const mappedAppointments = mapAppointmentsData(monthAppointments[dateStr], dateStr);
      setAppointments(mappedAppointments);
    } else {
      setAppointments([]);
    }
  }, [monthAppointments]);

  useEffect(() => {
    fetchStaffProfile();
  }, [fetchStaffProfile]);

  useEffect(() => {
    // Fetch appointments for the entire month when month changes
    if (staffName || user?.name) {
      fetchMonthAppointments();
    }
  }, [currentMonth, staffName, user?.name]);

  useEffect(() => {
    // When selected date changes, update appointments from month data
    if (Object.keys(monthAppointments).length > 0) {
      fetchAppointmentsForDate(selectedDate);
    }
  }, [selectedDate, monthAppointments, fetchAppointmentsForDate]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter !== 'all' && appt.status !== filter) return false;
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        (appt.customerName && appt.customerName.toLowerCase().includes(searchLower)) ||
        (appt.service && appt.service.toLowerCase().includes(searchLower)) ||
        (appt.bookingId && appt.bookingId.toLowerCase().includes(searchLower)) ||
        (appt.customerPhone && appt.customerPhone.includes(searchTerm))
      );
    }
    
    return true;
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    
    // If time is already in 12-hour format with AM/PM
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    
    // Convert 24h to 12h format
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const suffix = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes.padStart(2, '0')} ${suffix}`;
    }
    
    return timeStr;
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = getAuthToken();
      
      // Convert frontend status to backend bookingStatus
      let backendStatus = newStatus.toUpperCase();
      if (newStatus === 'confirmed') backendStatus = 'CONFIRMED';
      if (newStatus === 'completed') backendStatus = 'COMPLETED';
      if (newStatus === 'cancelled') backendStatus = 'CANCELLED';
      if (newStatus === 'pending') backendStatus = 'PENDING';
      
      console.log(`Updating appointment ${appointmentId} to status: ${backendStatus}`);
      
      const response = await fetch(`${API_BASE_URL}/api/staff/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          status: backendStatus
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        
        // Refresh the month appointments to update counts
        fetchMonthAppointments();
        alert(`Appointment marked as ${newStatus}!`);
      } else {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        
        // Update local state
        const updatedAppointments = appointments.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: newStatus }
            : appt
        );
        setAppointments(updatedAppointments);
        
        // Update month appointments cache
        const dateStr = formatDate(selectedDate);
        const updatedMonthAppts = { ...monthAppointments };
        if (updatedMonthAppts[dateStr]) {
          updatedMonthAppts[dateStr] = updatedMonthAppts[dateStr].map(appt => {
            if (appt.id === appointmentId) {
              const updatedAppt = { ...appt };
              updatedAppt.bookingStatus = backendStatus;
              return updatedAppt;
            }
            return appt;
          });
          setMonthAppointments(updatedMonthAppts);
        }
        
        alert(`Appointment marked as ${newStatus}! (Local update)`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      
      // Update local state
      const updatedAppointments = appointments.map(appt => 
        appt.id === appointmentId 
          ? { ...appt, status: newStatus }
          : appt
      );
      setAppointments(updatedAppointments);
      
      // Update month appointments cache
      const dateStr = formatDate(selectedDate);
      const updatedMonthAppts = { ...monthAppointments };
      if (updatedMonthAppts[dateStr]) {
        updatedMonthAppts[dateStr] = updatedMonthAppts[dateStr].map(appt => {
          if (appt.id === appointmentId) {
            const updatedAppt = { ...appt };
            updatedAppt.bookingStatus = newStatus.toUpperCase();
            return updatedAppt;
          }
          return appt;
        });
        setMonthAppointments(updatedMonthAppts);
      }
      
      alert(`Appointment marked as ${newStatus}! (Local update due to error)`);
    }
  };

  // Generate calendar with appointment counts from month data
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const today = new Date();
    const todayStr = formatDate(today);
    const selectedDateStr = formatDate(selectedDate);
    
    const calendar = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      calendar.push({
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount: 0,
        dayNumber: null
      });
    }
    
    // Add days of the month with appointment counts from monthAppointments
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      
      // Get appointment count from month data
      const dateAppointments = monthAppointments[dateStr] || [];
      const appointmentCount = dateAppointments.length;
      
      calendar.push({
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
        appointmentCount: appointmentCount,
        dayNumber: day
      });
    }
    
    // Add empty cells to complete the grid (6 rows x 7 columns = 42 cells)
    while (calendar.length < 42) {
      calendar.push({
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        appointmentCount: 0,
        dayNumber: null
      });
    }
    
    return calendar;
  };

  const calendarDays = generateCalendar();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get appointment statistics for selected date
  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  // Get total appointments for the month
  const getTotalMonthAppointments = () => {
    return Object.values(monthAppointments).reduce((total, apps) => total + apps.length, 0);
  };

  // Get days with appointments in current month
  const getDaysWithAppointments = () => {
    return Object.keys(monthAppointments).length;
  };

  return (
    <div className="staff-appointments-container">
      {/* Header */}
      <div className="staff-page-header">
        <div className="staff-header-content">
          <h1>
            <CalendarIcon size={28} />
            My Appointments
          </h1>
          <p className="staff-subtitle">Manage your daily schedule and appointments</p>
          {staffName && (
            <div className="staff-name-badge">
              Staff: <strong>{staffName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Search Section */}
      <div className="staff-search-section">
        <div className="staff-search-container">
          <div className="staff-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by customer name, phone, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="staff-filters-container">
            <div className="staff-filter-group">
              <Filter size={18} />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="staff-filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <button 
              className="staff-refresh-button"
              onClick={fetchMonthAppointments}
              disabled={loadingMonth}
            >
              <RefreshCw size={18} className={loadingMonth ? 'staff-spinning' : ''} />
              Refresh Month
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="staff-calendar-section">
        <div className="staff-calendar-container">
          <div className="staff-calendar-header">
            <div className="staff-month-navigation">
              <button className="staff-nav-button" onClick={goToPreviousMonth}>
                <ChevronLeft size={20} />
              </button>
              <h2>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button className="staff-nav-button" onClick={goToNextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="staff-calendar-controls">
              <button className="staff-today-button" onClick={goToToday}>
                <CalendarDays size={18} />
                Today
              </button>
              {loadingMonth && (
                <div className="staff-loading-month">
                  <div className="staff-mini-spinner"></div>
                  <span>Loading month...</span>
                </div>
              )}
            </div>
          </div>

          <div className="staff-calendar-wrapper">
            {/* Weekdays Header */}
            <div className="staff-weekdays-header">
              {weekdays.map((day, index) => (
                <div key={index} className="staff-weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid with Appointment Counts */}
            <div className="staff-calendar-grid">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`staff-calendar-day ${day.date ? 'has-date' : 'empty'} ${day.isCurrentMonth ? 'current-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                  onClick={() => day.date && handleDateClick(day.date)}
                  title={day.date ? `${day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}: ${day.appointmentCount} appointment${day.appointmentCount !== 1 ? 's' : ''}` : ''}
                >
                  {day.date && (
                    <>
                      <span className="staff-day-number">{day.dayNumber}</span>
                      {day.appointmentCount > 0 && (
                        <div className={`staff-appointment-indicator ${day.appointmentCount > 3 ? 'many' : day.appointmentCount > 1 ? 'some' : 'few'}`}>
                          <span className="staff-appointment-count">
                            {day.appointmentCount}
                          </span>
                          <span className="staff-appointment-label">
                            appt{day.appointmentCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="staff-selected-date-info">
            <div className="staff-selected-date">
              <span className="staff-label">Selected Date:</span>
              <span className="staff-date">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="staff-appointments-count">
              <span className="staff-count">{appointmentStats.total}</span>
              <span className="staff-label">appointments today</span>
              <span className="staff-month-total">
                ({getTotalMonthAppointments()} total this month)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="staff-appointments-section">
        <div className="staff-appointments-header">
          <h3>Appointments for {selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</h3>
          <div className="staff-stats">
            <div className="staff-stat-item">
              <span className="staff-stat-label">Pending:</span>
              <span className="staff-stat-value pending">{appointmentStats.pending}</span>
            </div>
            <div className="staff-stat-item">
              <span className="staff-stat-label">Confirmed:</span>
              <span className="staff-stat-value confirmed">{appointmentStats.confirmed}</span>
            </div>
            <div className="staff-stat-item">
              <span className="staff-stat-label">Completed:</span>
              <span className="staff-stat-value completed">{appointmentStats.completed}</span>
            </div>
            <div className="staff-stat-item">
              <span className="staff-stat-label">Total:</span>
              <span className="staff-stat-value total">{appointmentStats.total}</span>
            </div>
          </div>
        </div>

        {loadingMonth ? (
          <div className="staff-loading-state">
            <div className="staff-spinner"></div>
            <p>Loading month appointments...</p>
          </div>
        ) : loading ? (
          <div className="staff-loading-state">
            <div className="staff-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="staff-empty-state">
            <CalendarIcon size={48} />
            <h4>No Appointments Found</h4>
            <p>{staffName ? `${staffName} doesn't have any appointments scheduled for this date.` : "You don't have any appointments scheduled for this date."}</p>
            {searchTerm ? (
              <p className="staff-hint">Try clearing your search or selecting a different date.</p>
            ) : (
              <p className="staff-hint">Try selecting a different date from the calendar.</p>
            )}
          </div>
        ) : (
          <div className="staff-appointments-grid">
            {filteredAppointments.map((appt, index) => (
              <div key={appt.id || `appt-${index}`} className="staff-appointment-card">
                <div className="staff-appointment-header">
                  <div className="staff-time-slot">
                    <Clock size={16} />
                    <span className="staff-time">{formatTime(appt.time)}</span>
                    <span className="staff-duration">{appt.duration || '60 min'}</span>
                  </div>
                  <div className={`staff-status-badge staff-status-${appt.status || 'pending'}`}>
                    {(appt.status || 'pending').charAt(0).toUpperCase() + (appt.status || 'pending').slice(1)}
                  </div>
                </div>
                
                <div className="staff-appointment-body">
                  <div className="staff-appointment-id">
                    <span className="staff-id-label">Booking ID:</span>
                    <span className="staff-id-value">{appt.bookingId}</span>
                  </div>
                  
                  <div className="staff-customer-info">
                    <div className="staff-customer-details">
                      <User size={16} />
                      <div>
                        <h4>{appt.customerName || 'Customer'}</h4>
                        {appt.customerPhone && (
                          <div className="staff-customer-phone">
                            <Phone size={14} />
                            <span>{appt.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="staff-service-details">
                      <Scissors size={16} />
                      <div>
                        <span className="staff-service-name">{appt.service || 'Service'}</span>
                        <div className="staff-service-price">
                          <DollarSign size={14} />
                          <span>{formatLKR(appt.amount)}</span>
                          {appt.totalPayment !== null && appt.totalPayment !== undefined && (
                            <div className="staff-payment-source">
                              <small>(from totalPayment)</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="staff-appointment-actions">
                  {appt.status === 'pending' && (
                    <div className="staff-action-buttons">
                      <button 
                        className="staff-action-button confirm"
                        onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                      >
                        <CheckCircle size={16} />
                        Confirm
                      </button>
                      <button 
                        className="staff-action-button cancel"
                        onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {appt.status === 'confirmed' && (
                    <button 
                      className="staff-action-button complete"
                      onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                    >
                      <CheckCircle size={16} />
                      Mark as Complete
                    </button>
                  )}
                  
                  {(appt.status === 'completed' || appt.status === 'cancelled') && (
                    <div className="staff-final-status">
                      <span className={`staff-status-text ${appt.status}`}>
                        {appt.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                      </span>
                    </div>
                  )}
                  
                  {appt.staff && (
                    <div className="staff-assigned-to">
                      <small>Assigned to: <strong>{appt.staff}</strong></small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAppointments;