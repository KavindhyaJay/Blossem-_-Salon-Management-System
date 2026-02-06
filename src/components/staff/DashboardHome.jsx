// src/components/staff/DashboardHome.jsx - WITH staffd- PREFIX
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Image as ImageIcon, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Users
} from 'lucide-react';
import './DashboardHome.css';

const DashboardHome = ({ user }) => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPhotos: 0,
    approvedPhotos: 0,
    pendingPhotos: 0,
    nextAppointment: null,
    completionRate: 0
  });
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  // Get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || 
           localStorage.getItem('staffToken') || 
           localStorage.getItem('authToken');
  }, []);

  // Fetch today's appointments
  const fetchTodaysAppointments = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/appointments/today`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const appointments = data.appointments || [];
        setTodaysAppointments(appointments);
        
        // Calculate completion rate
        const completedCount = appointments.filter(a => a.status === 'completed').length;
        const totalCount = appointments.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        setStats(prev => ({
          ...prev,
          todayAppointments: totalCount,
          nextAppointment: appointments[0] || null,
          completionRate: completionRate
        }));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch photo stats
  const fetchPhotoStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/staff/photos/my-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalPhotos: data.total || 0,
          approvedPhotos: data.approved || 0,
          pendingPhotos: data.pending || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching photo stats:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTodaysAppointments(),
        fetchPhotoStats()
      ]);
      setLoading(false);
    };

    initializeData();
  }, [fetchTodaysAppointments, fetchPhotoStats]);

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.replace(':00', '').replace(' AM', '').replace(' PM', '');
  };

  // Refresh all data
  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      fetchTodaysAppointments(),
      fetchPhotoStats()
    ]).finally(() => setLoading(false));
  };

  return (
    <div className="staffd-dashboard-home">
      {/* Welcome Header */}
      <div className="staffd-dashboard-header">
        <div className="staffd-welcome-section">
          <h1 className="staffd-welcome-title">Welcome back, {user?.name || 'Staff Member'}! 👋</h1>
          <p className="staffd-welcome-subtitle">Your daily overview and appointments</p>
        </div>
        
        <div className="staffd-header-actions">
          <button 
            className="staffd-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'staffd-spinning' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          <div className="staffd-current-time">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="staffd-stats-grid">
        <div className="staffd-stat-card staffd-blue-gradient">
          <div className="staffd-stat-content">
            <div className="staffd-stat-icon-wrapper">
              <Calendar className="staffd-stat-icon" />
            </div>
            <div className="staffd-stat-details">
              <h3 className="staffd-stat-title">Today's Appointments</h3>
              <div className="staffd-stat-value">{stats.todayAppointments}</div>
              <div className="staffd-stat-subtitle">
                {stats.nextAppointment ? 
                  `Next: ${formatTime(stats.nextAppointment.time)}` : 
                  'No appointments'}
              </div>
            </div>
          </div>
        </div>

        <div className="staffd-stat-card staffd-blue-gradient">
          <div className="staffd-stat-content">
            <div className="staffd-stat-icon-wrapper">
              <ImageIcon className="staffd-stat-icon" />
            </div>
            <div className="staffd-stat-details">
              <h3 className="staffd-stat-title">Photos Uploaded</h3>
              <div className="staffd-stat-value">{stats.totalPhotos}</div>
              <div className="staffd-stat-subtitle">
                {stats.approvedPhotos} approved • {stats.pendingPhotos} pending
              </div>
            </div>
          </div>
        </div>

        <div className="staffd-stat-card staffd-blue-gradient">
          <div className="staffd-stat-content">
            <div className="staffd-stat-icon-wrapper">
              <CheckCircle className="staffd-stat-icon" />
            </div>
            <div className="staffd-stat-details">
              <h3 className="staffd-stat-title">Completion Rate</h3>
              <div className="staffd-stat-value">{stats.completionRate}%</div>
              <div className="staffd-stat-subtitle">Today's performance</div>
            </div>
          </div>
        </div>

        <div className="staffd-stat-card staffd-blue-gradient">
          <div className="staffd-stat-content">
            <div className="staffd-stat-icon-wrapper">
              <TrendingUp className="staffd-stat-icon" />
            </div>
            <div className="staffd-stat-details">
              <h3 className="staffd-stat-title">Services</h3>
              <div className="staffd-stat-value">{todaysAppointments.length}</div>
              <div className="staffd-stat-subtitle">Booked today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="staffd-appointments-card">
        <div className="staffd-card-header">
          <h3 className="staffd-card-title">
            <Calendar size={20} />
            Today's Appointments
            <span className="staffd-count-badge">{todaysAppointments.length}</span>
          </h3>
          {/* Only show View Schedule button if there are appointments */}
          {todaysAppointments.length > 0 && (
            <button 
              className="staffd-view-all-btn"
              onClick={() => navigate('/staff-dashboard/schedule')}
            >
              View Schedule
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        
        {todaysAppointments.length === 0 ? (
          <div className="staffd-empty-state">
            <Calendar size={48} className="staffd-empty-icon" />
            <h4>No Appointments Today</h4>
            <p>You have no appointments scheduled for today.</p>
          </div>
        ) : (
          <div className="staffd-appointments-list">
            {todaysAppointments.slice(0, 6).map((appt, index) => (
              <div key={appt.id || index} className="staffd-appointment-item">
                <div className="staffd-time-slot">
                  {formatTime(appt.time)}
                </div>
                <div className="staffd-appointment-details">
                  <div className="staffd-customer-info">
                    <Users size={16} />
                    <span className="staffd-customer-name">{appt.customerName || 'Customer'}</span>
                  </div>
                  <div className="staffd-service-info">
                    {appt.service || 'Service'}
                  </div>
                </div>
                <div className={`staffd-status-badge staffd-status-${appt.status || 'pending'}`}>
                  {appt.status || 'Pending'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;