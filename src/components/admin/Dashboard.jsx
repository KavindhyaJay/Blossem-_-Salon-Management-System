// src/components/admin/Dashboard.jsx - CLEANED UP
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Calendar, Users, Image, RefreshCw, ShoppingBag } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysAppointments: 0,
    totalRevenue: 0,
    activeStaff: 0,
    pendingPhotos: 0,
    totalServices: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    todaysRevenue: 0
  });
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const getAuthToken = useCallback(() => {
    let token = localStorage.getItem('adminToken');
    if (!token) token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('authToken');
    if (!token) token = localStorage.getItem('accessToken');
    return token;
  }, []);

  // Format amount to Sri Lankan Rupees (LKR)
  const formatLKR = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch all data in parallel
      const [
        appointmentsResponse,
        staffResponse,
        photosResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/appointments`, { headers }),
        fetch(`${API_BASE_URL}/api/staff`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/photos/pending-count`, { headers })
      ]);

      // Initialize stats
      let todaysAppointments = 0;
      let totalRevenue = 0;
      let activeStaff = 0;
      let pendingPhotos = 0;
      let totalServices = 0;
      let pendingBookings = 0;
      let confirmedBookings = 0;
      let todaysRevenue = 0;
      
      // Service frequency tracking
      const serviceFrequency = {};

      // Process appointments data
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        if (Array.isArray(appointmentsData)) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          appointmentsData.forEach(appt => {
            const amount = parseInt(appt.totalPayment || appt.amount || 0);
            const status = appt.bookingStatus?.toLowerCase();
            const apptDate = appt.date ? appt.date.split('T')[0] : null;
            
            // Calculate revenue
            if ((status === 'completed' || status === 'confirmed' || !status) && amount > 0) {
              totalRevenue += amount;
            }
            
            // Today's appointments
            if (apptDate === todayStr) {
              todaysAppointments++;
              if (amount > 0) {
                todaysRevenue += amount;
              }
            }
            
            // Booking status counts
            if (status === 'pending') {
              pendingBookings++;
            } else if (status === 'confirmed') {
              confirmedBookings++;
            }
            
            // Service frequency tracking
            const services = appt.services || [];
            if (Array.isArray(services)) {
              services.forEach(service => {
                if (typeof service === 'string') {
                  serviceFrequency[service] = (serviceFrequency[service] || 0) + 1;
                }
              });
            }
          });
          
          // Total unique services
          totalServices = Object.keys(serviceFrequency).length;
        }
      }

      // Process staff data
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        if (Array.isArray(staffData)) {
          activeStaff = staffData.filter(staff => {
            const status = staff.status?.toLowerCase();
            return status === 'active' || status === 'activated' || !status;
          }).length;
        }
      }

      // Process photos data
      if (photosResponse.ok) {
        try {
          const photosData = await photosResponse.json();
          if (photosData.pendingCount !== undefined) {
            pendingPhotos = photosData.pendingCount;
          }
        } catch (err) {
          console.log('No pending photos data or different format');
        }
      }

      setStats({
        todaysAppointments,
        totalRevenue,
        activeStaff,
        pendingPhotos,
        totalServices,
        pendingBookings,
        confirmedBookings,
        todaysRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        todaysAppointments: 0,
        totalRevenue: 0,
        activeStaff: 0,
        pendingPhotos: 0,
        totalServices: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        todaysRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Try general user endpoint
      try {
        const userResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: headers
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        console.log('User endpoint not available');
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [API_BASE_URL, getAuthToken]);

  useEffect(() => {
    const initDashboard = async () => {
      await fetchUserData();
      await fetchDashboardData();
    };
    
    initDashboard();
  }, [fetchUserData, fetchDashboardData]);

  const refreshDashboard = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="admin-content-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Loading your salon information...</p>
          </div>
        </div>
        <div className="admin-loading-container">
          <div className="admin-loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-content-header">
        <div>
          <h2>
            <Users size={24} />
            Welcome back, {user?.name || 'Admin'}!
          </h2>
          <p>Salon Overview Dashboard • All data is live from your database</p>
        </div>
        <div className="admin-dashboard-controls">
          <button 
            className="admin-refresh-btn"
            onClick={refreshDashboard}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid - ONLY SECTION */}
      <div className="admin-stats-grid">
        {/* Today's Appointments Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Today's Appointments</h3>
            <div className="admin-stat-icon appointments-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.todaysAppointments}</div>
          <div className="admin-stat-subtext">
            {stats.todaysAppointments > 0 
              ? `${stats.confirmedBookings} confirmed • ${stats.pendingBookings} pending`
              : 'No appointments scheduled'
            }
          </div>
          <p className="admin-stat-desc">
            Appointments scheduled for today
          </p>
        </div>
        
        {/* Today's Revenue Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Today's Revenue</h3>
            <div className="admin-stat-icon revenue-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{formatLKR(stats.todaysRevenue)}</div>
          <div className="admin-stat-subtext">
            From {stats.todaysAppointments} appointments
          </div>
          <p className="admin-stat-desc">
            Estimated revenue from today's appointments
          </p>
        </div>
        
        {/* Active Staff Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Active Staff</h3>
            <div className="admin-stat-icon staff-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.activeStaff}</div>
          <div className="admin-stat-subtext">
            Ready to serve customers
          </div>
          <p className="admin-stat-desc">
            Staff members currently active
          </p>
        </div>
        
        {/* Total Revenue Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Total Revenue</h3>
            <div className="admin-stat-icon total-icon">
              <DollarSign size={24} color="#FF9800" />
            </div>
          </div>
          <div className="admin-stat-value">{formatLKR(stats.totalRevenue)}</div>
          <div className="admin-stat-subtext">
            All-time recorded revenue
          </div>
          <p className="admin-stat-desc">
            From all completed appointments
          </p>
        </div>
        
        {/* Pending Photos Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Pending Photos</h3>
            <div className="admin-stat-icon photos-icon">
              <Image size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.pendingPhotos}</div>
          <div className="admin-stat-subtext">
            Awaiting approval
          </div>
          <p className="admin-stat-desc">
            Photos waiting for your review
          </p>
        </div>
        
        {/* Available Services Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Available Services</h3>
            <div className="admin-stat-icon services-icon">
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalServices}</div>
          <div className="admin-stat-subtext">
            Unique service types
          </div>
          <p className="admin-stat-desc">
            Services offered by your salon
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;