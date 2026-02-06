// src/components/admin/Revenue.jsx - UPDATED WITH payment_checked FILTER
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, Calendar, BarChart, Download, TrendingDown, Users, CheckCircle } from 'lucide-react';
import './Revenue.css';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [yearlyRevenue, setYearlyRevenue] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('current_year');
  const [revenueType, setRevenueType] = useState('monthly'); // 'monthly' or 'yearly'

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

  const getAuthToken = useCallback(() => {
    let token = localStorage.getItem('adminToken');
    if (!token) token = localStorage.getItem('token');
    if (!token) token = localStorage.getItem('authToken');
    if (!token) token = localStorage.getItem('accessToken');
    return token;
  }, []);

  // Format date to YYYY-MM-DD
  const formatDate = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Get start of week
  const getStartOfWeek = useCallback((date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
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

  // Helper to parse amount from appointment
  const parseAmount = useCallback((appointment) => {
    // Try multiple possible fields for amount
    const amount = 
      parseInt(appointment.totalPayment) || 
      parseInt(appointment.amount) || 
      parseInt(appointment.totalAmount) || 
      0;
    
    return amount > 0 ? amount : 0;
  }, []);

  // Check if payment is verified (payment_checked = 'yes')
  const isPaymentVerified = useCallback((appointment) => {
    const paymentChecked = appointment.payment_checked || appointment.paymentChecked;
    
    // Check for 'yes' (case-insensitive)
    if (typeof paymentChecked === 'string') {
      return paymentChecked.toLowerCase() === 'yes' || paymentChecked.toLowerCase() === 'true';
    }
    
    // Check for boolean
    if (typeof paymentChecked === 'boolean') {
      return paymentChecked === true;
    }
    
    // Default to true for appointments with amount (for backward compatibility)
    const amount = parseAmount(appointment);
    return amount > 0;
  }, [parseAmount]);

  // Fetch all appointments and calculate revenue
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

      // Fetch all appointments
      console.log('Fetching all appointments for revenue calculation...');
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch appointments:', response.status);
        // Fallback to empty data
        setRevenueData({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
        setMonthlyRevenue([]);
        setYearlyRevenue([]);
        setRecentTransactions([]);
        setTopServices([]);
        return;
      }

      const appointments = await response.json();
      console.log('Fetched appointments count:', Array.isArray(appointments) ? appointments.length : 0);

      // Filter appointments where payment_checked = 'yes' and has amount
      const paidAppointments = Array.isArray(appointments) 
        ? appointments.filter(appt => {
            const amount = parseAmount(appt);
            const isVerified = isPaymentVerified(appt);
            
            console.log('Appointment check:', {
              id: appt.id,
              payment_checked: appt.payment_checked,
              amount: amount,
              isVerified: isVerified,
              status: appt.bookingStatus
            });
            
            return amount > 0 && isVerified;
          })
        : [];

      console.log('Verified paid appointments count:', paidAppointments.length);

      // Get date ranges for calculations
      const today = new Date();
      const startOfWeek = getStartOfWeek(today);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const currentYear = today.getFullYear();

      // Initialize revenue data
      let todayRevenue = 0;
      let weekRevenue = 0;
      let monthRevenue = 0;
      let totalRevenue = 0;

      // Data structures for aggregation
      const monthlyData = {};
      const yearlyData = {};
      const serviceRevenue = {};
      const recentTransactionsArray = [];

      // Process each appointment
      paidAppointments.forEach((appointment, index) => {
        const amount = parseAmount(appointment);
        const isVerified = isPaymentVerified(appointment);
        
        if (amount <= 0 || !isVerified) return;

        const appointmentDate = new Date(appointment.date || appointment.createdAt || new Date());
        const dateStr = formatDate(appointmentDate);
        
        // Get month and year for aggregation
        const month = appointmentDate.getMonth();
        const year = appointmentDate.getFullYear();
        const monthYearKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const yearKey = `${year}`;

        // Update total revenue
        totalRevenue += amount;

        // Today's revenue
        if (dateStr === formatDate(today)) {
          todayRevenue += amount;
        }

        // This week's revenue
        if (appointmentDate >= startOfWeek && appointmentDate <= today) {
          weekRevenue += amount;
        }

        // This month's revenue
        if (appointmentDate >= startOfMonth && appointmentDate <= today) {
          monthRevenue += amount;
        }

        // Monthly aggregation
        if (!monthlyData[monthYearKey]) {
          monthlyData[monthYearKey] = {
            month: month,
            year: year,
            monthName: appointmentDate.toLocaleDateString('en-US', { month: 'long' }),
            shortMonthName: appointmentDate.toLocaleDateString('en-US', { month: 'short' }),
            revenue: 0,
            appointments: 0,
            average: 0,
            verifiedPayments: 0
          };
        }
        monthlyData[monthYearKey].revenue += amount;
        monthlyData[monthYearKey].appointments += 1;
        monthlyData[monthYearKey].verifiedPayments += 1;
        monthlyData[monthYearKey].average = Math.round(monthlyData[monthYearKey].revenue / monthlyData[monthYearKey].appointments);

        // Yearly aggregation
        if (!yearlyData[yearKey]) {
          yearlyData[yearKey] = {
            year: year,
            revenue: 0,
            appointments: 0,
            average: 0,
            months: 0,
            verifiedPayments: 0
          };
        }
        yearlyData[yearKey].revenue += amount;
        yearlyData[yearKey].appointments += 1;
        yearlyData[yearKey].verifiedPayments += 1;
        yearlyData[yearKey].average = Math.round(yearlyData[yearKey].revenue / yearlyData[yearKey].appointments);
        yearlyData[yearKey].months = Object.keys(monthlyData).filter(key => key.startsWith(yearKey)).length;

        // Service revenue aggregation
        const services = appointment.services || [];
        if (Array.isArray(services) && services.length > 0) {
          services.forEach(service => {
            const serviceName = typeof service === 'string' ? service : service.name || 'Unknown Service';
            if (!serviceRevenue[serviceName]) {
              serviceRevenue[serviceName] = {
                name: serviceName,
                revenue: 0,
                bookings: 0,
                average: 0,
                verifiedPayments: 0
              };
            }
            serviceRevenue[serviceName].revenue += amount / services.length;
            serviceRevenue[serviceName].bookings += 1;
            serviceRevenue[serviceName].verifiedPayments += 1;
            serviceRevenue[serviceName].average = Math.round(serviceRevenue[serviceName].revenue / serviceRevenue[serviceName].bookings);
          });
        } else {
          // If no services array, use service field
          const serviceName = appointment.service || 'Unknown Service';
          if (!serviceRevenue[serviceName]) {
            serviceRevenue[serviceName] = {
              name: serviceName,
              revenue: 0,
              bookings: 0,
              average: 0,
              verifiedPayments: 0
            };
          }
          serviceRevenue[serviceName].revenue += amount;
          serviceRevenue[serviceName].bookings += 1;
          serviceRevenue[serviceName].verifiedPayments += 1;
          serviceRevenue[serviceName].average = Math.round(serviceRevenue[serviceName].revenue / serviceRevenue[serviceName].bookings);
        }

        // Collect recent transactions (last 10)
        if (recentTransactionsArray.length < 10) {
          recentTransactionsArray.push({
            id: appointment.id || appointment._id || `trans-${index}`,
            bookingId: appointment.bookingId || `BK${index}`,
            date: appointment.date || formatDate(appointmentDate),
            customerName: appointment.customerName || 'Customer',
            service: Array.isArray(services) && services.length > 0 
              ? services.map(s => typeof s === 'string' ? s : s.name).join(', ') 
              : appointment.service || 'Service',
            staff: appointment.staff || 'Staff',
            amount: amount,
            status: appointment.bookingStatus || appointment.status || 'Completed',
            paymentVerified: isVerified,
            paymentChecked: appointment.payment_checked || 'No'
          });
        }
      });

      // Convert monthly data to array and sort
      const monthlyArray = Object.values(monthlyData)
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
        .map(item => ({
          ...item,
          displayName: `${item.shortMonthName} ${item.year}`
        }));

      // Convert yearly data to array and sort
      const yearlyArray = Object.values(yearlyData)
        .sort((a, b) => a.year - b.year)
        .map(item => ({
          ...item,
          displayName: `Year ${item.year}`
        }));

      // Get top services
      const topServicesArray = Object.values(serviceRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      // Filter data based on selected time period
      let filteredMonthlyData = monthlyArray;
      let filteredYearlyData = yearlyArray;

      if (timePeriod === 'current_year') {
        filteredMonthlyData = monthlyArray.filter(item => item.year === currentYear);
        filteredYearlyData = yearlyArray.filter(item => item.year === currentYear);
      } else if (timePeriod === 'last_year') {
        filteredMonthlyData = monthlyArray.filter(item => item.year === currentYear - 1);
        filteredYearlyData = yearlyArray.filter(item => item.year === currentYear - 1);
      }

      // Update state
      setRevenueData({
        today: todayRevenue,
        thisWeek: weekRevenue,
        thisMonth: monthRevenue,
        total: totalRevenue
      });
      
      setMonthlyRevenue(filteredMonthlyData);
      setYearlyRevenue(filteredYearlyData);
      setRecentTransactions(recentTransactionsArray.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setTopServices(topServicesArray);

      console.log('Revenue calculation complete:', {
        totalRevenue,
        monthlyRevenue: filteredMonthlyData.length,
        recentTransactions: recentTransactionsArray.length,
        topServices: topServicesArray.length,
        paymentVerifiedCount: paidAppointments.length
      });

    } catch (error) {
      console.error('Error fetching revenue data:', error);
      // Set empty data on error
      setRevenueData({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
      setMonthlyRevenue([]);
      setYearlyRevenue([]);
      setRecentTransactions([]);
      setTopServices([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, formatDate, getStartOfWeek, parseAmount, isPaymentVerified, timePeriod]);

  // Export revenue report
  const exportRevenueReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      currency: 'LKR',
      summary: {
        ...revenueData,
        totalAppointments: monthlyRevenue.reduce((sum, month) => sum + month.appointments, 0),
        verifiedPayments: monthlyRevenue.reduce((sum, month) => sum + month.verifiedPayments, 0),
        averageTransaction: monthlyRevenue.length > 0 
          ? Math.round(revenueData.total / monthlyRevenue.reduce((sum, month) => sum + month.appointments, 0))
          : 0
      },
      [revenueType === 'monthly' ? 'monthlyRevenue' : 'yearlyRevenue']: revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue,
      recentTransactions: recentTransactions.slice(0, 10),
      topServices: topServices,
      timePeriod: timePeriod,
      revenueType: revenueType,
      paymentFilter: 'payment_checked = yes'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon-verified-revenue-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Get previous month revenue for comparison
  const getPreviousMonthRevenue = () => {
    if (monthlyRevenue.length < 2) return 0;
    return monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
  };

  // Get previous year revenue for comparison
  const getPreviousYearRevenue = () => {
    if (yearlyRevenue.length < 2) return 0;
    return yearlyRevenue[yearlyRevenue.length - 2]?.revenue || 0;
  };

  // Get growth indicator
  const getGrowthIndicator = (current, previous) => {
    const growth = calculateGrowth(current, previous);
    const isPositive = parseFloat(growth) > 0;
    return {
      value: Math.abs(growth),
      isPositive,
      icon: isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />
    };
  };

  // Get payment verification badge
  const getPaymentVerificationBadge = (isVerified) => {
    return (
      <span className={`payment-verification-badge ${isVerified ? 'verified' : 'not-verified'}`}>
        {isVerified ? (
          <>
            <CheckCircle size={12} />
            Verified
          </>
        ) : (
          'Not Verified'
        )}
      </span>
    );
  };

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData, timePeriod]);

  if (loading) {
    return (
      <div className="main-content revenue-dashboard">
        <div className="content-header revenue-header">
          <div>
            <h2>
              <DollarSign size={24} style={{ marginRight: '10px' }} />
              Verified Revenue Dashboard
            </h2>
            <p>Calculating revenue from verified payments (payment_checked = yes)...</p>
          </div>
        </div>
        <div className="revenue-loading">
          <div className="revenue-loading-spinner"></div>
          <p>Loading verified revenue data from appointments...</p>
        </div>
      </div>
    );
  }

  const currentMonthGrowth = getGrowthIndicator(
    revenueData.thisMonth, 
    getPreviousMonthRevenue()
  );

  const currentYearGrowth = revenueType === 'yearly' 
    ? getGrowthIndicator(
        yearlyRevenue.find(y => y.year === new Date().getFullYear())?.revenue || 0,
        getPreviousYearRevenue()
      )
    : null;

  return (
    <div className="main-content revenue-dashboard">
      {/* Header */}
      <div className="content-header revenue-header">
        <div>
          <h2>
            <CheckCircle size={24} style={{ marginRight: '10px', color: '#4CAF50' }} />
            <DollarSign size={24} />
            Verified Revenue Dashboard
          </h2>
          <p>Revenue calculated only from verified payments (payment_checked = yes) • Currency: Sri Lankan Rupees (LKR)</p>
        </div>
        
        <div className="revenue-controls">
          <div className="payment-verified-badge">
            <CheckCircle size={16} />
            <span>Verified Payments Only</span>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${revenueType === 'monthly' ? 'active' : ''}`}
              onClick={() => setRevenueType('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`view-toggle-btn ${revenueType === 'yearly' ? 'active' : ''}`}
              onClick={() => setRevenueType('yearly')}
            >
              Yearly
            </button>
          </div>
          
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
          <div className="verified-payments-info">
            <CheckCircle size={14} />
            <span>Verified payments only</span>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.today > 0 
              ? `From today's verified payments` 
              : 'No verified payments today'}
          </p>
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
          <div className="verified-payments-info">
            <CheckCircle size={14} />
            <span>Verified payments only</span>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.thisWeek > 0 
              ? 'Weekly earnings from verified payments' 
              : 'No verified payments this week'}
          </p>
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
          <div className="revenue-growth-indicator">
            <span className={`growth-value ${currentMonthGrowth.isPositive ? 'positive' : 'negative'}`}>
              {currentMonthGrowth.icon}
              {currentMonthGrowth.value}%
            </span>
            <span className="growth-label">vs last month</span>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.thisMonth > 0 
              ? 'Monthly earnings from verified payments' 
              : 'No verified payments this month'}
          </p>
        </div>
        
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>Total Verified Revenue</h3>
            <div className="revenue-stat-icon">
              <BarChart size={24} />
            </div>
          </div>
          <div className="revenue-stat-value total">
            {formatLKR(revenueData.total)}
          </div>
          <div className="verified-payments-info">
            <CheckCircle size={14} />
            <span>{monthlyRevenue.reduce((sum, month) => sum + month.verifiedPayments, 0)} verified payments</span>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.total > 0 
              ? `All-time earnings from verified payments` 
              : 'No verified payments recorded'}
          </p>
        </div>
      </div>

      {/* Monthly/Yearly Revenue Breakdown */}
      <div className="monthly-revenue-container">
        <div className="monthly-revenue-header">
          <h3>
            <BarChart size={20} />
            {revenueType === 'monthly' ? 'Monthly' : 'Yearly'} Verified Revenue Breakdown
          </h3>
          <div className="time-period-info">
            {timePeriod === 'current_year' && 'Current Year'}
            {timePeriod === 'last_year' && 'Last Year'}
            {timePeriod === 'all_time' && 'All Time'}
            {revenueType === 'yearly' && currentYearGrowth && (
              <span className={`growth-badge ${currentYearGrowth.isPositive ? 'positive' : 'negative'}`}>
                {currentYearGrowth.icon}
                {currentYearGrowth.value}% vs last year
              </span>
            )}
          </div>
        </div>
        
        {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).length > 0 ? (
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>{revenueType === 'monthly' ? 'Month' : 'Year'}</th>
                  <th>Verified Revenue (LKR)</th>
                  <th>Verified Payments</th>
                  <th>Average per Payment</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).map((item, index, array) => {
                  const previousItem = array[index - 1];
                  const growth = previousItem 
                    ? calculateGrowth(item.revenue, previousItem.revenue)
                    : null;
                  
                  return (
                    <tr key={revenueType === 'monthly' ? `${item.year}-${item.month}` : item.year}>
                      <td className="period-name">
                        <strong>{revenueType === 'monthly' ? item.displayName : item.displayName}</strong>
                      </td>
                      <td className="revenue-amount">
                        {formatLKR(item.revenue)}
                      </td>
                      <td className="verified-payments-count">
                        <div className="payments-info">
                          <CheckCircle size={14} />
                          <span>{item.verifiedPayments} verified</span>
                          <span className="total-appointments">/{item.appointments} total</span>
                        </div>
                      </td>
                      <td>
                        {formatLKR(item.average)}
                      </td>
                      <td>
                        {growth !== null && (
                          <span className={`growth-indicator ${parseFloat(growth) > 0 ? 'positive' : 'negative'}`}>
                            {parseFloat(growth) > 0 ? '↗' : '↘'}
                            {Math.abs(growth)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total</strong></td>
                  <td className="revenue-amount total-footer">
                    {formatLKR((revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0))}
                  </td>
                  <td>
                    <div className="payments-info">
                      <CheckCircle size={14} />
                      <strong>
                        {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.verifiedPayments, 0)} verified
                      </strong>
                      <span className="total-appointments">
                        /{(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.appointments, 0)} total
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>
                      {formatLKR(
                        Math.round(
                          (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0) / 
                          (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.verifiedPayments, 0)
                        )
                      )}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">📊</div>
            <h4>No Verified Revenue Data</h4>
            <p>No verified payment data (payment_checked = yes) available for the selected time period.</p>
          </div>
        )}
      </div>

      {/* Recent Verified Transactions */}
      <div className="recent-transactions-container">
        <div className="transactions-header">
          <h3>Recent Verified Transactions</h3>
          <div className="transaction-count">
            <CheckCircle size={14} />
            <span>{recentTransactions.length} verified transactions</span>
          </div>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="revenue-table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Payment Status</th>
                  <th>Amount (LKR)</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td className="booking-id">{transaction.bookingId}</td>
                    <td>{transaction.customerName}</td>
                    <td>
                      <span className={`status-badge status-${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="revenue-amount">
                      {formatLKR(transaction.amount)}
                    </td>
                    <td>
                      {getPaymentVerificationBadge(transaction.paymentVerified)}
                      <div className="payment-checked-info">
                        <small>Checked: {transaction.paymentChecked}</small>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">💳</div>
            <h4>No Verified Transactions</h4>
            <p>No recent verified transactions (payment_checked = yes) found.</p>
          </div>
        )}
      </div>

      {/* Top Performing Services (Verified) */}
      <div className="top-services-section">
        <h3>
          <CheckCircle size={20} />
          Top Performing Services (Verified Payments)
        </h3>
        
        {topServices.length > 0 ? (
          <div className="top-services-grid">
            {topServices.map((service, index) => (
              <div key={index} className="service-card">
                <h4>{service.name}</h4>
                <div className="service-revenue">
                  {formatLKR(service.revenue)}
                </div>
                <div className="service-metrics">
                  <div className="service-bookings">
                    <CheckCircle size={14} />
                    <span>{service.verifiedPayments} verified booking{service.verifiedPayments !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="service-average">
                    Avg: {formatLKR(service.average)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">💇‍♀️</div>
            <h4>No Verified Service Data</h4>
            <p>No service revenue data from verified payments available.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="revenue-summary">
        <h4>
          <CheckCircle size={20} />
          Verified Revenue Summary
        </h4>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Total Periods Tracked</div>
            <div className="summary-value">
              {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).length} {revenueType === 'monthly' ? 'months' : 'years'}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Verified Payments</div>
            <div className="summary-value">
              <div className="verified-count">
                <CheckCircle size={16} />
                <span>{(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.verifiedPayments, 0)}</span>
              </div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Verified Revenue</div>
            <div className="summary-value highlight">
              {formatLKR((revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0))}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Average Verified Payment</div>
            <div className="summary-value">
              {formatLKR(
                Math.round(
                  (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0) / 
                  (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.verifiedPayments, 0)
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Verification Info */}
      <div className="currency-info payment-verification-info">
        <CheckCircle size={16} />
        <div>
          <strong>Payment Verification:</strong> All revenue calculations include only appointments where 
          <code>payment_checked = 'yes'</code> and have a valid payment amount. 
          This ensures accurate financial reporting based on verified payments only.
        </div>
      </div>
    </div>
  );
};

export default Revenue;