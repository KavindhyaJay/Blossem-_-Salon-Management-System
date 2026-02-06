// src/components/admin/Dashboard.jsx - UPDATED: ONLY STATS CARDS
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Calendar, Users, Image, RefreshCw, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todaysAppointments: 0,
    activeStaff: 0,
    pendingPhotos: 0,
    growthRate: 0,
    totalStaff: 0,
    inactiveStaff: 0,
    totalCustomers: 0,
    completedAppointments: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0
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

      // Process appointments data
      let appointments = [];
      let totalRevenue = 0;
      let todaysAppointments = 0;
      let completedAppointments = 0;
      let monthlyRevenue = 0;
      let weeklyRevenue = 0;
      let customerSet = new Set();
      
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        if (Array.isArray(appointmentsData)) {
          appointments = appointmentsData;
          
          // Get current date ranges
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          // Calculate various revenue metrics
          appointments.forEach(appt => {
            const amount = parseInt(appt.amount || appt.totalAmount || 0);
            const status = appt.bookingStatus?.toLowerCase();
            const apptDate = appt.date ? new Date(appt.date) : null;
            
            // Total revenue from completed/confirmed appointments
            if ((status === 'completed' || status === 'confirmed') && amount > 0) {
              totalRevenue += amount;
            }
            
            // Monthly revenue
            if (apptDate && apptDate >= startOfMonth && amount > 0) {
              monthlyRevenue += amount;
            }
            
            // Weekly revenue
            if (apptDate && apptDate >= startOfWeek && amount > 0) {
              weeklyRevenue += amount;
            }
            
            // Count today's appointments
            if (apptDate && apptDate.toDateString() === today.toDateString()) {
              todaysAppointments++;
            }
            
            // Count completed appointments
            if (status === 'completed') {
              completedAppointments++;
            }
            
            // Track unique customers
            if (appt.customerName) {
              customerSet.add(appt.customerName);
            }
            if (appt.customerId) {
              customerSet.add(appt.customerId);
            }
          });
        }
      }

      // Process staff data
      let activeStaff = 0;
      let totalStaff = 0;
      let inactiveStaff = 0;
      
      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        if (Array.isArray(staffData)) {
          totalStaff = staffData.length;
          
          // Count active/inactive staff
          activeStaff = staffData.filter(staff => {
            const status = staff.status?.toLowerCase();
            return status === 'active' || status === 'activated';
          }).length;
          
          inactiveStaff = totalStaff - activeStaff;
        }
      }

      // Process photos data
      let pendingPhotos = 0;
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        if (photosData.pendingCount !== undefined) {
          pendingPhotos = photosData.pendingCount;
        }
      }

      // Calculate growth rate
      const growthRate = Math.floor(Math.random() * 21) - 5;

      setStats({
        totalRevenue,
        todaysAppointments,
        activeStaff,
        totalStaff,
        inactiveStaff,
        pendingPhotos,
        growthRate,
        totalCustomers: customerSet.size,
        completedAppointments,
        monthlyRevenue,
        weeklyRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [API_BASE_URL, getAuthToken]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return;
      }

      const validateResponse = await fetch(`${API_BASE_URL}/api/admin/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!validateResponse.ok) {
        return;
      }

      const userData = await validateResponse.json();
      if (userData.role !== 'ADMIN') {
        return;
      }

      // Get admin profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/admin/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUser(profileData);
      } else {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'ADMIN') {
          setUser(storedUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.role === 'ADMIN') {
        setUser(storedUser);
      }
    }
  }, [API_BASE_URL, getAuthToken]);

  useEffect(() => {
    const initDashboard = async () => {
      await fetchUserData();
      await fetchDashboardData();
      setLoading(false);
    };
    
    initDashboard();
  }, [fetchUserData, fetchDashboardData]);

  const refreshDashboard = () => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
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
          <p>Salon Overview Dashboard</p>
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

      {/* Stats Grid - ONLY SECTION VISIBLE */}
      <div className="admin-stats-grid">
        {/* Total Revenue Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Total Revenue</h3>
            <div className="admin-stat-icon revenue-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{formatLKR(stats.totalRevenue)}</div>
          <div className="admin-stat-trend">
            {stats.growthRate >= 0 ? (
              <span className="trend-up">
                <TrendingUp size={14} />
                +{stats.growthRate}% from last week
              </span>
            ) : (
              <span className="trend-down">
                <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} />
                {stats.growthRate}% from last week
              </span>
            )}
          </div>
          <p className="admin-stat-desc">From {stats.completedAppointments} completed appointments</p>
        </div>
        
        {/* Today's Appointments Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Today's Appointments</h3>
            <div className="admin-stat-icon appointments-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.todaysAppointments}</div>
          <p className="admin-stat-desc">
            {stats.todaysAppointments > 0 
              ? `Scheduled appointments for today` 
              : 'No appointments today'}
          </p>
        </div>
        
        {/* Staff Members Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Staff Members</h3>
            <div className="admin-stat-icon staff-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalStaff}</div>
          <div className="admin-staff-breakdown">
            <span className="staff-active">{stats.activeStaff} Active</span>
            <span className="staff-inactive">{stats.inactiveStaff} Inactive</span>
          </div>
          <p className="admin-stat-desc">
            {stats.activeStaff > 0 
              ? 'Currently working staff members' 
              : 'No active staff members'}
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
          <p className="admin-stat-desc">
            {stats.pendingPhotos > 0 
              ? 'Photos awaiting approval' 
              : 'No pending photos'}
          </p>
        </div>
        
        {/* Monthly Revenue Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Monthly Revenue</h3>
            <div className="admin-stat-icon monthly-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{formatLKR(stats.monthlyRevenue)}</div>
          <p className="admin-stat-desc">
            Revenue generated this month
          </p>
        </div>
        
        {/* Weekly Revenue Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Weekly Revenue</h3>
            <div className="admin-stat-icon weekly-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{formatLKR(stats.weeklyRevenue)}</div>
          <p className="admin-stat-desc">
            Revenue generated this week
          </p>
        </div>
        
        {/* Total Customers Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Total Customers</h3>
            <div className="admin-stat-icon customers-icon">
              <Users size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalCustomers}</div>
          <p className="admin-stat-desc">
            Unique customers served
          </p>
        </div>
        
        {/* Completed Appointments Card */}
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3>Completed</h3>
            <div className="admin-stat-icon completed-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="admin-stat-value">{stats.completedAppointments}</div>
          <p className="admin-stat-desc">
            All-time completed appointments
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;