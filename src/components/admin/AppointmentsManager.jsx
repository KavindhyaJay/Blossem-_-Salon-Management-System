// src/components/admin/AppointmentsManager.jsx - FIXED
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Calendar as CalendarIcon, Filter, Download, Plus } from 'lucide-react';
import CalendarView from '../common/CalendarView';

const AppointmentsManager = ({ userRole = 'admin' }) => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock data - replace with API call
  const mockAppointments = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      service: 'Hair Coloring',
      staff: 'Emma Wilson',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      time: '10:00 AM',
      status: 'completed',
      amount: 3500
    },
    {
      id: 2,
      customerName: 'Mike Ross',
      service: 'Haircut & Styling',
      staff: 'John Davis',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      time: '11:30 AM',
      status: 'completed',
      amount: 1500
    },
    {
      id: 3,
      customerName: 'Lisa Wang',
      service: 'Manicure',
      staff: 'Sophia Lee',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 12),
      time: '2:00 PM',
      status: 'pending',
      amount: 800
    },
    {
      id: 4,
      customerName: 'David Chen',
      service: 'Facial Treatment',
      staff: 'Maria Garcia',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
      time: '3:30 PM',
      status: 'pending',
      amount: 2200
    },
  ];

  // Create a memoized fetch function
  const fetchAppointments = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      let filteredAppointments = [...mockAppointments];
      
      if (userRole === 'staff') {
        // Filter to show only staff's appointments
        filteredAppointments = filteredAppointments.filter(appt => 
          appt.staff === 'John Davis' // Replace with actual staff name from user data
        );
      }
      
      if (filter !== 'all') {
        filteredAppointments = filteredAppointments.filter(appt => 
          appt.status === filter
        );
      }
      
      // Filter by selected date if one is selected
      if (selectedDate) {
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        filteredAppointments = filteredAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          const apptDateStr = apptDate.toISOString().split('T')[0];
          return apptDateStr === selectedDateStr;
        });
      }
      
      setAppointments(filteredAppointments);
      setLoading(false);
    }, 500);
  }, [filter, userRole, selectedDate]); // Dependencies

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]); // Only depend on fetchAppointments

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const getStats = () => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const revenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    
    return { total, completed, pending, revenue };
  };

  const stats = getStats();

  return (
    <div className="appointments-manager">
      <div className="section-header">
        <div>
          <h2>
            <CalendarIcon size={24} style={{ marginRight: '10px' }} />
            {userRole === 'admin' ? 'All Appointments' : 'My Schedule'}
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
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {userRole === 'admin' && (
            <button className="action-btn">
              <Plus size={18} />
              <span>New Appointment</span>
            </button>
          )}
          
          <button className="action-btn" style={{ background: '#43c03e' }}>
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Appointments</h3>
            <div className="stat-icon">📅</div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Completed</h3>
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-value">{stats.completed}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-header">
            <h3>Pending</h3>
            <div className="stat-icon">⏳</div>
          </div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        
        {userRole === 'admin' && (
          <div className="stat-card">
            <div className="stat-header">
              <h3>Revenue</h3>
              <div className="stat-icon">₹</div>
            </div>
            <div className="stat-value">₹{stats.revenue.toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Calendar View */}
      <CalendarView 
        appointments={appointments} 
        onDateSelect={handleDateSelect}
        userRole={userRole}
      />

      {/* Appointments Table */}
      <div className="table-container">
        <div className="table-header">
          <h3>{userRole === 'admin' ? 'All Appointments' : 'My Upcoming Appointments'}</h3>
          <span className="badge">{appointments.length} appointments</span>
        </div>
        
        {loading ? (
          <div className="loading-container" style={{ minHeight: '200px' }}>
            <div className="loading-spinner"></div>
            <p>Loading appointments...</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                {userRole === 'admin' && <th>Staff</th>}
                <th>Date & Time</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>#{appointment.id}</td>
                  <td>{appointment.customerName}</td>
                  <td>{appointment.service}</td>
                  {userRole === 'admin' && <td>{appointment.staff}</td>}
                  <td>
                    {appointment.date.toLocaleDateString()} 
                    <br />
                    <small>{appointment.time}</small>
                  </td>
                  <td>
                    <span className={`status-badge status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>₹{appointment.amount?.toLocaleString()}</td>
                  <td>
                    <button className="small-btn">View</button>
                    {userRole === 'admin' && (
                      <button className="small-btn" style={{ marginLeft: '5px', background: '#70a6ec' }}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AppointmentsManager;