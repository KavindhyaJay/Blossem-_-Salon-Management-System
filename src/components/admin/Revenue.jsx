// src/components/admin/Revenue.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart, Download } from 'lucide-react';
import './Revenue.css';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('current_year');

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

  const getStartOfWeek = useCallback((date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, []);

  const getDateRanges = useCallback(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      today: formatDate(today),
      startOfWeek: formatDate(startOfWeek),
      startOfMonth: formatDate(startOfMonth),
      currentYear: today.getFullYear()
    };
  }, [formatDate, getStartOfWeek]);

  // Format amount to Sri Lankan Rupees (LKR)
  const formatLKR = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Format amount to LKR without symbol (just number with commas)
  const formatLKRNumber = useCallback((amount) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const fetchRevenueData = useCallback(async () => {
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

      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch appointments');
        return;
      }

      const appointments = await response.json();
      
      if (!Array.isArray(appointments)) {
        console.error('Invalid appointments data');
        return;
      }

      const paidAppointments = appointments.filter(appt => 
        appt.payment === 'Paid' && appt.totalPayment
      );

      const { today, startOfWeek, startOfMonth, currentYear } = getDateRanges();
      
      let todayRevenue = 0;
      let weekRevenue = 0;
      let monthRevenue = 0;
      let totalRevenue = 0;

      const monthlyData = {};
      const serviceRevenue = {};

      paidAppointments.forEach(appointment => {
        const amount = parseInt(appointment.totalPayment) || 0;
        const date = new Date(appointment.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        totalRevenue += amount;
        
        if (appointment.date === today) {
          todayRevenue += amount;
        }
        
        const appointmentDate = new Date(appointment.date);
        const weekStart = new Date(startOfWeek);
        if (appointmentDate >= weekStart && appointmentDate <= new Date()) {
          weekRevenue += amount;
        }
        
        const monthStart = new Date(startOfMonth);
        if (appointmentDate >= monthStart && appointmentDate <= new Date()) {
          monthRevenue += amount;
        }
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            month: date.getMonth(),
            year: date.getFullYear(),
            revenue: 0,
            appointments: 0
          };
        }
        monthlyData[monthYear].revenue += amount;
        monthlyData[monthYear].appointments += 1;
        
        if (appointment.services && Array.isArray(appointment.services)) {
          appointment.services.forEach(service => {
            const serviceName = service.name || service;
            if (!serviceRevenue[serviceName]) {
              serviceRevenue[serviceName] = {
                name: serviceName,
                revenue: 0,
                bookings: 0
              };
            }
            serviceRevenue[serviceName].revenue += amount / appointment.services.length;
            serviceRevenue[serviceName].bookings += 1;
          });
        }
      });

      const monthlyArray = Object.values(monthlyData)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
        .map(item => ({
          ...item,
          monthName: new Date(item.year, item.month, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        }));

      const topServicesArray = Object.values(serviceRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      const recentTransactionsArray = paidAppointments
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(appt => ({
          id: appt._id,
          date: appt.date,
          customerName: appt.customerName,
          service: appt.services && appt.services.length > 0 
            ? (appt.services[0].name || appt.services[0] || 'Service')
            : 'Service',
          staff: appt.staff || 'Staff',
          amount: parseInt(appt.totalPayment) || 0,
          status: appt.payment === 'Paid' ? 'Paid' : 'Pending'
        }));

      let filteredMonthlyData = monthlyArray;
      if (timePeriod === 'current_year') {
        filteredMonthlyData = monthlyArray.filter(item => item.year === currentYear);
      } else if (timePeriod === 'last_year') {
        filteredMonthlyData = monthlyArray.filter(item => item.year === currentYear - 1);
      }

      setRevenueData({
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue,
        total: totalRevenue
      });
      
      setMonthlyRevenue(filteredMonthlyData);
      setRecentTransactions(recentTransactionsArray);
      setTopServices(topServicesArray);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, getDateRanges, timePeriod]);

  const exportRevenueReport = () => {
    const data = {
      revenueData,
      monthlyRevenue,
      recentTransactions,
      topServices,
      generatedAt: new Date().toISOString(),
      currency: 'LKR'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-lkr-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData, timePeriod]);

  if (loading) {
    return (
      <div className="main-content">
        <div className="content-header revenue-header">
          <div>
            <h2>
              <DollarSign size={24} style={{ marginRight: '10px' }} />
              Revenue Dashboard
            </h2>
            <p>Track your salon's financial performance in Sri Lankan Rupees (LKR)</p>
          </div>
        </div>
        <div className="revenue-loading">
          <div className="revenue-loading-spinner"></div>
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content revenue-dashboard">
      {/* Header */}
      <div className="content-header revenue-header">
        <div>
          <h2>
            <DollarSign size={24} />
            Revenue Dashboard
          </h2>
          <p>Track your salon's financial performance in Sri Lankan Rupees (LKR)</p>
        </div>
        
        <div className="revenue-controls">
          <select 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
            className="time-period-select"
          >
            <option value="current_year">Current Year</option>
            <option value="last_year">Last Year</option>
            <option value="all_time">All Time</option>
          </select>
          
          <button 
            className="export-revenue-btn"
            onClick={exportRevenueReport}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="revenue-stats-grid">
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>Today's Revenue</h3>
            <div className="revenue-stat-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="revenue-stat-value today">
            {formatLKR(revenueData.today)}
          </div>
          <p className="revenue-stat-desc">From today's appointments</p>
        </div>
        
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>This Week</h3>
            <div className="revenue-stat-icon">
              <Calendar size={24} />
            </div>
          </div>
          <div className="revenue-stat-value week">
            {formatLKR(revenueData.thisWeek)}
          </div>
          <p className="revenue-stat-desc">Weekly earnings</p>
        </div>
        
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>This Month</h3>
            <div className="revenue-stat-icon">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="revenue-stat-value month">
            {formatLKR(revenueData.thisMonth)}
          </div>
          <p className="revenue-stat-desc">Monthly earnings</p>
        </div>
        
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>Total Revenue</h3>
            <div className="revenue-stat-icon">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="revenue-stat-value total">
            {formatLKR(revenueData.total)}
          </div>
          <p className="revenue-stat-desc">All-time earnings</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="monthly-revenue-container">
        <div className="monthly-revenue-header">
          <h3>
            <BarChart size={20} />
            Monthly Revenue Breakdown
          </h3>
          <div className="time-period-info">
            {timePeriod === 'current_year' && 'Current Year'}
            {timePeriod === 'last_year' && 'Last Year'}
            {timePeriod === 'all_time' && 'All Time'}
          </div>
        </div>
        
        {monthlyRevenue.length > 0 ? (
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue (LKR)</th>
                  <th>Appointments</th>
                  <th>Average per Appointment</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.map((month) => (
                  <tr key={`${month.year}-${month.month}`}>
                    <td className="month-name">
                      <strong>{month.monthName}</strong>
                    </td>
                    <td className="revenue-amount">
                      {formatLKR(month.revenue)}
                    </td>
                    <td className="appointment-count">{month.appointments}</td>
                    <td>
                      {formatLKR(Math.round(month.revenue / month.appointments))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">📊</div>
            <h4>No Revenue Data</h4>
            <p>No revenue data available for the selected time period.</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions-container">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>
          <div className="transaction-count">
            {recentTransactions.length} transactions
          </div>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Amount (LKR)</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.customerName}</td>
                    <td>{transaction.service}</td>
                    <td>{transaction.staff}</td>
                    <td className="revenue-amount">
                      {formatLKR(transaction.amount)}
                    </td>
                    <td>
                      <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">💳</div>
            <h4>No Transactions</h4>
            <p>No recent transactions found.</p>
          </div>
        )}
      </div>

      {/* Top Performing Services */}
      <div className="top-services-section">
        <h3>Top Performing Services</h3>
        
        {topServices.length > 0 ? (
          <div className="top-services-grid">
            {topServices.map((service, index) => (
              <div key={index} className="service-card">
                <h4>{service.name}</h4>
                <div className="service-revenue">
                  {formatLKR(Math.round(service.revenue))}
                </div>
                <div className="service-bookings">
                  <span>{service.bookings}</span>
                  <span>booking{service.bookings !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">💇‍♀️</div>
            <h4>No Service Data</h4>
            <p>No service revenue data available.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {monthlyRevenue.length > 0 && (
        <div className="revenue-summary">
          <h4>Revenue Summary</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Total Months Tracked</div>
              <div className="summary-value">{monthlyRevenue.length}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Highest Revenue Month</div>
              <div className="summary-value">
                {monthlyRevenue.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlyRevenue[0])?.monthName}
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Average Monthly Revenue</div>
              <div className="summary-value highlight">
                {formatLKR(Math.round(monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / monthlyRevenue.length))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currency Info */}
      <div className="currency-info" style={{
        marginTop: '20px',
        padding: '10px',
        background: 'rgba(219, 50, 50, 0.05)',
        border: '1px solid rgba(219, 50, 50, 0.2)',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#888',
        fontSize: '12px'
      }}>
        All amounts are displayed in Sri Lankan Rupees (LKR) • Currency symbol: Rs.
      </div>
    </div>
  );
};

export default Revenue;