// src/components/staff/StaffAppointments.jsx - FIXED WITH DEBUGGING
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
  DollarSign,
  AlertCircle
} from 'lucide-react';
import './StaffAppointments.css';

const StaffAppointments = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

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

  // Mock data for testing - REMOVE IN PRODUCTION
  const generateMockAppointments = (dateStr) => {
    const mockAppointments = [
      {
        id: 'appt-1',
        bookingId: 'BK001',
        customerName: 'John Smith',
        service: 'Haircut',
        time: '10:00 AM',
        date: dateStr,
        status: 'pending',
        amount: 500,
        customerPhone: '+91 98765 43210',
        duration: '45 min'
      },
      {
        id: 'appt-2',
        bookingId: 'BK002',
        customerName: 'Sarah Johnson',
        service: 'Hair Coloring',
        time: '2:30 PM',
        date: dateStr,
        status: 'confirmed',
        amount: 1500,
        customerPhone: '+91 98765 43211',
        duration: '2 hours'
      },
      {
        id: 'appt-3',
        bookingId: 'BK003',
        customerName: 'Mike Wilson',
        service: 'Beard Trim',
        time: '4:00 PM',
        date: dateStr,
        status: 'completed',
        amount: 300,
        customerPhone: '+91 98765 43212',
        duration: '30 min'
      }
    ];
    
    // Randomize for different dates
    const dayNum = parseInt(dateStr.split('-')[2]);
    return mockAppointments.slice(0, dayNum % 3 + 1);
  };

  const fetchStaffAppointments = useCallback(async (date) => {
    if (!date) return;
    
    setLoading(true);
    setDebugInfo(`Fetching for date: ${formatDate(date)}`);
    
    try {
      const token = getAuthToken();
      const dateStr = formatDate(date);
      
      console.log('🔍 Fetching appointments for:', dateStr);
      console.log('🔑 Token exists:', !!token);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      // Primary endpoint - staff-specific appointments
      const primaryEndpoint = `${API_BASE_URL}/api/staff/appointments`;
      
      let response = null;
      let data = null;
      
      try {
        // Try with query parameter
        response = await fetch(`${primaryEndpoint}?date=${dateStr}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          data = await response.json();
          console.log('✅ Success from staff endpoint:', data);
          setDebugInfo('✅ Fetched from /api/staff/appointments');
        } else {
          // Try alternative endpoint format
          const altResponse = await fetch(`${API_BASE_URL}/api/appointments?staffId=${user?.id || 'current'}&date=${dateStr}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (altResponse.ok) {
            data = await altResponse.json();
            console.log('✅ Success from alternative endpoint:', data);
            setDebugInfo('✅ Fetched from /api/appointments with staffId');
          } else {
            throw new Error(`API responded with ${altResponse.status}: ${altResponse.statusText}`);
          }
        }
      } catch (apiError) {
        console.error('❌ API Error:', apiError.message);
        setDebugInfo(`❌ API Error: ${apiError.message}`);
        
        // Fallback to mock data for development
        console.log('🔄 Using mock data for development');
        const mockData = generateMockAppointments(dateStr);
        data = { appointments: mockData };
        setDebugInfo('🔄 Using mock data (development mode)');
      }
      
      // Process the data
      let staffAppointments = [];
      
      if (data) {
        if (Array.isArray(data)) {
          staffAppointments = data;
        } else if (data.appointments && Array.isArray(data.appointments)) {
          staffAppointments = data.appointments;
        } else if (data.data && Array.isArray(data.data)) {
          staffAppointments = data.data;
        }
        
        // Filter to ensure only current date appointments
        staffAppointments = staffAppointments.filter(appt => {
          const apptDate = appt.date ? appt.date.split('T')[0] : null;
          return apptDate === dateStr;
        });
        
        // Sort by time
        const sortedAppointments = staffAppointments.sort((a, b) => {
          const timeA = a.time?.replace(' AM', '').replace(' PM', '').replace(':', '') || '0000';
          const timeB = b.time?.replace(' AM', '').replace(' PM', '').replace(':', '') || '0000';
          return parseInt(timeA) - parseInt(timeB);
        });
        
        console.log('📊 Processed appointments:', sortedAppointments);
        setAppointments(sortedAppointments);
        setDebugInfo(prev => `${prev} | Found ${sortedAppointments.length} appointments`);
      }
      
    } catch (error) {
      console.error('💥 Fetch error:', error);
      setDebugInfo(`💥 Error: ${error.message}`);
      
      // Fallback to mock data
      const mockData = generateMockAppointments(formatDate(date));
      setAppointments(mockData);
      setDebugInfo(`🔄 Using mock data due to error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, user?.id]);

  useEffect(() => {
    fetchStaffAppointments(selectedDate);
  }, [selectedDate, fetchStaffAppointments]);

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
    console.log('📅 Date clicked:', formatDate(date));
    setSelectedDate(date);
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter !== 'all' && appt.status !== filter) return false;
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      return (
        (appt.customerName && appt.customerName.toLowerCase().includes(searchLower)) ||
        (appt.service && appt.service.toLowerCase().includes(searchLower)) ||
        (appt.customerPhone && appt.customerPhone.includes(searchTerm))
      );
    }
    
    return true;
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    
    // If time is already in 12-hour format
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
      const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          updatedBy: user?.id || 'staff'
        })
      });

      if (response.ok) {
        fetchStaffAppointments(selectedDate);
        alert(`Appointment marked as ${newStatus}!`);
      } else {
        // For development, just update locally
        setAppointments(prev => 
          prev.map(appt => 
            appt.id === appointmentId 
              ? { ...appt, status: newStatus }
              : appt
          )
        );
        alert(`Appointment marked as ${newStatus}! (Local update for development)`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      // For development, update locally anyway
      setAppointments(prev => 
        prev.map(appt => 
          appt.id === appointmentId 
            ? { ...appt, status: newStatus }
            : appt
        )
      );
      alert(`Appointment marked as ${newStatus}! (Local update due to error)`);
    }
  };

  // Generate calendar with proper layout
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
        appointmentCount: 0
      });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      
      // Count appointments for this date
      const dateAppointments = appointments.filter(appt => {
        const apptDate = appt.date ? appt.date.split('T')[0] : null;
        return apptDate === dateStr;
      });
      
      calendar.push({
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
        appointmentCount: dateAppointments.length,
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
        appointmentCount: 0
      });
    }
    
    return calendar;
  };

  const calendarDays = generateCalendar();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get appointment statistics
  const appointmentStats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="staff-appointments-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <CalendarIcon size={28} />
            My Appointments
          </h1>
          <p className="subtitle">Manage your daily schedule and appointments</p>
        </div>
        
        {/* Debug info - remove in production */}
        {debugInfo && (
          <div className="debug-info">
            <AlertCircle size={14} />
            <span>{debugInfo}</span>
          </div>
        )}
      </div>

      {/* Search Bars */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by customer name, phone, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filters-container">
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
              className="refresh-button"
              onClick={() => fetchStaffAppointments(selectedDate)}
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'spinning' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-container">
          <div className="calendar-header">
            <div className="month-navigation">
              <button className="nav-button" onClick={goToPreviousMonth}>
                <ChevronLeft size={20} />
              </button>
              <h2>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <button className="nav-button" onClick={goToNextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="calendar-controls">
              <button className="today-button" onClick={goToToday}>
                <CalendarDays size={18} />
                Today
              </button>
            </div>
          </div>

          <div className="calendar-wrapper">
            {/* Weekdays Header */}
            <div className="weekdays-header">
              {weekdays.map((day, index) => (
                <div key={index} className="weekday-cell">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`calendar-day ${day.date ? 'has-date' : 'empty'} ${day.isCurrentMonth ? 'current-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                  onClick={() => day.date && handleDateClick(day.date)}
                  title={day.date ? `${formatDate(day.date)}: ${day.appointmentCount} appointments` : ''}
                >
                  {day.date && (
                    <>
                      <span className="day-number">{day.dayNumber || day.date.getDate()}</span>
                      {day.appointmentCount > 0 && (
                        <div className="appointment-indicator" title={`${day.appointmentCount} appointment${day.appointmentCount !== 1 ? 's' : ''}`}>
                          {day.appointmentCount > 1 ? day.appointmentCount : ''}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="selected-date-info">
            <div className="selected-date">
              <span className="label">Selected Date:</span>
              <span className="date">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="appointments-count">
              <span className="count">{appointmentStats.total}</span>
              <span className="label">appointments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments View */}
      <div className="appointments-section">
        <div className="appointments-header">
          <h3>Appointments for {selectedDate.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</h3>
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">Pending:</span>
              <span className="stat-value pending">{appointmentStats.pending}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Confirmed:</span>
              <span className="stat-value confirmed">{appointmentStats.confirmed}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value completed">{appointmentStats.completed}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading appointments from server...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            <CalendarIcon size={48} />
            <h4>No Appointments Found</h4>
            <p>You don't have any appointments scheduled for this date.</p>
            {searchTerm ? (
              <p className="hint">Try clearing your search or selecting a different date.</p>
            ) : (
              <p className="hint">Try selecting a different date from the calendar.</p>
            )}
          </div>
        ) : (
          <div className="appointments-grid">
            {filteredAppointments.map((appt, index) => (
              <div key={appt.id || `appt-${index}`} className="appointment-card">
                <div className="appointment-header">
                  <div className="time-slot">
                    <Clock size={16} />
                    <span className="time">{formatTime(appt.time)}</span>
                    <span className="duration">{appt.duration || '60 min'}</span>
                  </div>
                  <div className={`status-badge status-${appt.status || 'pending'}`}>
                    {(appt.status || 'pending').charAt(0).toUpperCase() + (appt.status || 'pending').slice(1)}
                  </div>
                </div>
                
                <div className="appointment-body">
                  <div className="customer-info">
                    <div className="customer-details">
                      <User size={16} />
                      <div>
                        <h4>{appt.customerName || appt.customer?.name || 'Customer'}</h4>
                        {appt.customerPhone && (
                          <div className="customer-phone">
                            <Phone size={14} />
                            <span>{appt.customerPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="service-details">
                      <Scissors size={16} />
                      <div>
                        <span className="service-name">{appt.service || appt.serviceType || 'Service'}</span>
                        <div className="service-price">
                          <DollarSign size={14} />
                          <span>₹{appt.amount || appt.price || appt.totalAmount || '0'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="appointment-actions">
                  {appt.status === 'pending' && (
                    <div className="action-buttons">
                      <button 
                        className="action-button confirm"
                        onClick={() => updateAppointmentStatus(appt.id, 'confirmed')}
                      >
                        <CheckCircle size={16} />
                        Confirm
                      </button>
                      <button 
                        className="action-button cancel"
                        onClick={() => updateAppointmentStatus(appt.id, 'cancelled')}
                      >
                        <XCircle size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {appt.status === 'confirmed' && (
                    <button 
                      className="action-button complete"
                      onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                    >
                      <CheckCircle size={16} />
                      Mark as Complete
                    </button>
                  )}
                  
                  {(appt.status === 'completed' || appt.status === 'cancelled') && (
                    <div className="final-status">
                      <span className={`status-text ${appt.status}`}>
                        {appt.status === 'completed' ? '✓ Completed' : '✗ Cancelled'}
                      </span>
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