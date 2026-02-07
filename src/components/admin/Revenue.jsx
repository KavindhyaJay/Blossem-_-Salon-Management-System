// src/components/admin/Revenue.jsx - UPDATED WITH REAL totalPayment VALUES
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
  const [revenueType, setRevenueType] = useState('monthly');
  const [actualPaymentCount, setActualPaymentCount] = useState(0);
  const [estimatedPaymentCount, setEstimatedPaymentCount] = useState(0);

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

  // UPDATED: Extract REAL amount from totalPayment field (same as AppointmentsManager)
  const extractAmount = useCallback((appointment) => {
    // Use totalPayment first (main field from database)
    if (appointment.totalPayment !== undefined && appointment.totalPayment !== null) {
      if (typeof appointment.totalPayment === 'number') {
        return appointment.totalPayment;
      }
      if (typeof appointment.totalPayment === 'string' && appointment.totalPayment.trim() !== '') {
        const value = parseFloat(appointment.totalPayment);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    
    // Fallback to amount field (for backward compatibility)
    if (appointment.amount !== undefined && appointment.amount !== null) {
      if (typeof appointment.amount === 'number') {
        return appointment.amount;
      }
      if (typeof appointment.amount === 'string' && appointment.amount.trim() !== '') {
        const value = parseFloat(appointment.amount);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    
    return 0; // Return 0 if no payment data
  }, []);

  // Helper function to get service-based estimated amount (for appointments without totalPayment)
  const getEstimatedAmount = useCallback((appointment) => {
    const services = appointment.services || [];
    
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
    
    if (services.length === 0) {
      return servicePrices['Default'];
    }

    // If services is an array, calculate total
    if (Array.isArray(services)) {
      let total = 0;
      services.forEach(service => {
        if (servicePrices[service]) {
          total += servicePrices[service];
        } else {
          total += servicePrices['Default'];
        }
      });
      return total;
    }

    // If services is a string
    if (typeof services === 'string') {
      if (servicePrices[services]) {
        return servicePrices[services];
      }
      
      // Try to split by comma if multiple services
      const serviceList = services.split(',').map(s => s.trim());
      let total = 0;
      serviceList.forEach(service => {
        if (servicePrices[service]) {
          total += servicePrices[service];
        } else {
          total += servicePrices['Default'];
        }
      });
      return total;
    }

    return servicePrices['Default'];
  }, []);

  // Check if appointment should be counted as revenue
  const shouldCountAsRevenue = useCallback((appointment) => {
    const status = appointment.bookingStatus?.toLowerCase();
    const payment = appointment.payment?.toLowerCase();
    
    // Count completed and confirmed appointments as revenue
    // Also check if payment status is 'paid' or similar
    return (status === 'completed' || status === 'confirmed' || !status) &&
           (payment === 'paid' || !payment);
  }, []);

  // Fetch all appointments and calculate ACTUAL revenue
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
      console.log('Fetching appointments for revenue calculation...');
      const response = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch appointments:', response.status);
        setRevenueData({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
        setMonthlyRevenue([]);
        setYearlyRevenue([]);
        setRecentTransactions([]);
        setTopServices([]);
        return;
      }

      const appointments = await response.json();
      console.log('Fetched appointments:', Array.isArray(appointments) ? appointments.length : 0);

      // Filter appointments that should count as revenue
      const revenueAppointments = Array.isArray(appointments) 
        ? appointments.filter(appt => shouldCountAsRevenue(appt))
        : [];

      console.log('Revenue appointments count:', revenueAppointments.length);

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
      let actualPayments = 0;
      let estimatedPayments = 0;

      // Data structures for aggregation
      const monthlyData = {};
      const yearlyData = {};
      const serviceRevenue = {};
      const recentTransactionsArray = [];

      // Process each appointment
      revenueAppointments.forEach((appointment, index) => {
        // Extract ACTUAL amount from totalPayment field
        const actualAmount = extractAmount(appointment);
        const hasActualPayment = actualAmount > 0;
        
        let amount = actualAmount;
        if (!hasActualPayment) {
          // If no actual payment, estimate based on services
          amount = getEstimatedAmount(appointment);
          estimatedPayments++;
        } else {
          actualPayments++;
        }
        
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
            actualRevenue: 0,
            estimatedRevenue: 0,
            appointments: 0,
            actualPayments: 0,
            estimatedPayments: 0,
            average: 0
          };
        }
        monthlyData[monthYearKey].revenue += amount;
        monthlyData[monthYearKey].actualRevenue += hasActualPayment ? amount : 0;
        monthlyData[monthYearKey].estimatedRevenue += !hasActualPayment ? amount : 0;
        monthlyData[monthYearKey].appointments += 1;
        monthlyData[monthYearKey].actualPayments += hasActualPayment ? 1 : 0;
        monthlyData[monthYearKey].estimatedPayments += !hasActualPayment ? 1 : 0;
        monthlyData[monthYearKey].average = Math.round(monthlyData[monthYearKey].revenue / monthlyData[monthYearKey].appointments);

        // Yearly aggregation
        if (!yearlyData[yearKey]) {
          yearlyData[yearKey] = {
            year: year,
            revenue: 0,
            actualRevenue: 0,
            estimatedRevenue: 0,
            appointments: 0,
            actualPayments: 0,
            estimatedPayments: 0,
            average: 0,
            months: 0
          };
        }
        yearlyData[yearKey].revenue += amount;
        yearlyData[yearKey].actualRevenue += hasActualPayment ? amount : 0;
        yearlyData[yearKey].estimatedRevenue += !hasActualPayment ? amount : 0;
        yearlyData[yearKey].appointments += 1;
        yearlyData[yearKey].actualPayments += hasActualPayment ? 1 : 0;
        yearlyData[yearKey].estimatedPayments += !hasActualPayment ? 1 : 0;
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
                actualRevenue: 0,
                estimatedRevenue: 0,
                bookings: 0,
                actualBookings: 0,
                estimatedBookings: 0,
                average: 0
              };
            }
            serviceRevenue[serviceName].revenue += amount / services.length;
            serviceRevenue[serviceName].actualRevenue += hasActualPayment ? (amount / services.length) : 0;
            serviceRevenue[serviceName].estimatedRevenue += !hasActualPayment ? (amount / services.length) : 0;
            serviceRevenue[serviceName].bookings += 1;
            serviceRevenue[serviceName].actualBookings += hasActualPayment ? 1 : 0;
            serviceRevenue[serviceName].estimatedBookings += !hasActualPayment ? 1 : 0;
            serviceRevenue[serviceName].average = Math.round(serviceRevenue[serviceName].revenue / serviceRevenue[serviceName].bookings);
          });
        } else {
          // If no services array, use service field
          const serviceName = appointment.service || 'Unknown Service';
          if (!serviceRevenue[serviceName]) {
            serviceRevenue[serviceName] = {
              name: serviceName,
              revenue: 0,
              actualRevenue: 0,
              estimatedRevenue: 0,
              bookings: 0,
              actualBookings: 0,
              estimatedBookings: 0,
              average: 0
            };
          }
          serviceRevenue[serviceName].revenue += amount;
          serviceRevenue[serviceName].actualRevenue += hasActualPayment ? amount : 0;
          serviceRevenue[serviceName].estimatedRevenue += !hasActualPayment ? amount : 0;
          serviceRevenue[serviceName].bookings += 1;
          serviceRevenue[serviceName].actualBookings += hasActualPayment ? 1 : 0;
          serviceRevenue[serviceName].estimatedBookings += !hasActualPayment ? 1 : 0;
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
            actualAmount: hasActualPayment ? amount : null,
            estimatedAmount: !hasActualPayment ? amount : null,
            totalPayment: appointment.totalPayment,
            rawAmount: appointment.amount,
            paymentStatus: appointment.payment || 'Unknown',
            paymentChecked: appointment.paymentChecked,
            status: appointment.bookingStatus || 'Completed',
            hasActualPayment: hasActualPayment,
            estimated: !hasActualPayment
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
      setActualPaymentCount(actualPayments);
      setEstimatedPaymentCount(estimatedPayments);

      console.log('Revenue calculation complete:', {
        totalRevenue,
        todayRevenue,
        monthRevenue,
        actualPayments,
        estimatedPayments,
        monthlyRevenue: filteredMonthlyData.length,
        recentTransactions: recentTransactionsArray.length
      });

    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setRevenueData({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });
      setMonthlyRevenue([]);
      setYearlyRevenue([]);
      setRecentTransactions([]);
      setTopServices([]);
      setActualPaymentCount(0);
      setEstimatedPaymentCount(0);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, getAuthToken, formatDate, getStartOfWeek, extractAmount, getEstimatedAmount, shouldCountAsRevenue, timePeriod]);

  // Export revenue report
  const exportRevenueReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      currency: 'LKR',
      note: 'Revenue includes both actual payments (from totalPayment field) and estimated amounts for appointments without payment data.',
      summary: {
        ...revenueData,
        actualPayments: actualPaymentCount,
        estimatedPayments: estimatedPaymentCount,
        totalAppointments: monthlyRevenue.reduce((sum, month) => sum + month.appointments, 0),
        averageTransaction: monthlyRevenue.length > 0 
          ? Math.round(revenueData.total / monthlyRevenue.reduce((sum, month) => sum + month.appointments, 0))
          : 0
      },
      [revenueType === 'monthly' ? 'monthlyRevenue' : 'yearlyRevenue']: revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue,
      recentTransactions: recentTransactions.slice(0, 10),
      topServices: topServices,
      timePeriod: timePeriod,
      revenueType: revenueType,
      paymentBreakdown: {
        actualPayments: actualPaymentCount,
        estimatedPayments: estimatedPaymentCount,
        actualRevenue: monthlyRevenue.reduce((sum, month) => sum + month.actualRevenue, 0),
        estimatedRevenue: monthlyRevenue.reduce((sum, month) => sum + month.estimatedRevenue, 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon-revenue-report-${new Date().toISOString().split('T')[0]}.json`;
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
              Revenue Dashboard
            </h2>
            <p>Calculating revenue from actual payments...</p>
          </div>
        </div>
        <div className="revenue-loading">
          <div className="revenue-loading-spinner"></div>
          <p>Loading and calculating revenue from appointments...</p>
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

  const totalAppointments = monthlyRevenue.reduce((sum, month) => sum + month.appointments, 0);
  const actualRevenuePercentage = totalAppointments > 0 
    ? Math.round((actualPaymentCount / totalAppointments) * 100) 
    : 0;

  return (
    <div className="main-content revenue-dashboard">
      {/* Header */}
      <div className="content-header revenue-header">
        <div>
          <h2>
            <DollarSign size={24} />
            Revenue Dashboard
          </h2>
          <p>
            {actualPaymentCount > 0 ? 
              `Using ${actualPaymentCount} actual payments • ${estimatedPaymentCount} estimated • Currency: Sri Lankan Rupees (LKR)` :
              'Currency: Sri Lankan Rupees (LKR)'
            }
          </p>
        </div>
        
        <div className="revenue-controls">
          <div className="payment-breakdown-badge">
            <span className="actual-payments">{actualPaymentCount} Actual</span>
            <span className="estimated-payments">{estimatedPaymentCount} Estimated</span>
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
          <div className="payment-breakdown">
            <div className="payment-breakdown-bar">
              <div 
                className="actual-bar" 
                style={{ width: `${actualRevenuePercentage}%` }}
                title={`${actualRevenuePercentage}% actual payments`}
              ></div>
            </div>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.today > 0 
              ? `From today's appointments` 
              : 'No appointments today'}
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
          <div className="payment-breakdown-stats">
            <div className="actual-stat">
              <CheckCircle size={12} />
              <span>{actualPaymentCount} actual</span>
            </div>
            <div className="estimated-stat">
              <span>⚠️ {estimatedPaymentCount} estimated</span>
            </div>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.thisWeek > 0 
              ? 'Weekly earnings' 
              : 'No appointments this week'}
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
              ? 'Monthly earnings' 
              : 'No appointments this month'}
          </p>
        </div>
        
        <div className="revenue-stat-card">
          <div className="revenue-stat-header">
            <h3>Total Revenue</h3>
            <div className="revenue-stat-icon">
              <BarChart size={24} />
            </div>
          </div>
          <div className="revenue-stat-value total">
            {formatLKR(revenueData.total)}
          </div>
          <div className="payment-composition">
            <div className="actual-composition">
              <span className="composition-dot actual"></span>
              <span className="composition-label">
                Actual: {formatLKR(monthlyRevenue.reduce((sum, month) => sum + month.actualRevenue, 0))}
              </span>
            </div>
            <div className="estimated-composition">
              <span className="composition-dot estimated"></span>
              <span className="composition-label">
                Estimated: {formatLKR(monthlyRevenue.reduce((sum, month) => sum + month.estimatedRevenue, 0))}
              </span>
            </div>
          </div>
          <p className="revenue-stat-desc">
            {revenueData.total > 0 
              ? `All-time earnings` 
              : 'No appointments recorded'}
          </p>
        </div>
      </div>

      {/* Monthly/Yearly Revenue Breakdown */}
      <div className="monthly-revenue-container">
        <div className="monthly-revenue-header">
          <h3>
            <BarChart size={20} />
            {revenueType === 'monthly' ? 'Monthly' : 'Yearly'} Revenue Breakdown
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
                  <th>Total Revenue (LKR)</th>
                  <th>Actual</th>
                  <th>Estimated</th>
                  <th>Appointments</th>
                  <th>Average</th>
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
                      <td className="actual-amount">
                        {formatLKR(item.actualRevenue)}
                        <div className="payment-count">
                          ({item.actualPayments})
                        </div>
                      </td>
                      <td className="estimated-amount">
                        {formatLKR(item.estimatedRevenue)}
                        <div className="payment-count">
                          ({item.estimatedPayments})
                        </div>
                      </td>
                      <td>
                        {item.appointments}
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
                  <td className="actual-total">
                    {formatLKR((revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.actualRevenue, 0))}
                    <div className="total-count">
                      ({(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.actualPayments, 0)})
                    </div>
                  </td>
                  <td className="estimated-total">
                    {formatLKR((revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.estimatedRevenue, 0))}
                    <div className="total-count">
                      ({(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.estimatedPayments, 0)})
                    </div>
                  </td>
                  <td>
                    <strong>
                      {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.appointments, 0)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {formatLKR(
                        Math.round(
                          (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0) / 
                          (revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.appointments, 0)
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
            <h4>No Revenue Data</h4>
            <p>No appointment data available for the selected time period.</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions-container">
        <div className="transactions-header">
          <h3>Recent Appointments (Revenue Details)</h3>
          <div className="transaction-count">
            <span>{recentTransactions.length} appointments</span>
            <span className="payment-types">
              • {recentTransactions.filter(t => t.hasActualPayment).length} actual payments
              • {recentTransactions.filter(t => t.estimated).length} estimated
            </span>
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
                  <th>Service</th>
                  <th>Amount (LKR)</th>
                  <th>Payment Type</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className={transaction.hasActualPayment ? 'actual-payment' : 'estimated-payment'}>
                    <td>{transaction.date}</td>
                    <td className="booking-id">{transaction.bookingId}</td>
                    <td>{transaction.customerName}</td>
                    <td className="service-cell">{transaction.service}</td>
                    <td className="revenue-amount">
                      {formatLKR(transaction.amount)}
                      {transaction.hasActualPayment ? (
                        <div className="actual-note">
                          <CheckCircle size={12} />
                          <small>Actual</small>
                        </div>
                      ) : (
                        <div className="estimation-note">
                          <small>Estimated</small>
                        </div>
                      )}
                    </td>
                    <td className="payment-type-cell">
                      <div className={`payment-type-badge ${transaction.hasActualPayment ? 'actual' : 'estimated'}`}>
                        {transaction.hasActualPayment ? 'Actual Payment' : 'Estimated'}
                      </div>
                      {transaction.totalPayment !== null && transaction.totalPayment !== undefined && (
                        <div className="payment-source">
                          <small>totalPayment: {transaction.totalPayment}</small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="revenue-empty-state">
            <div className="revenue-empty-icon">💳</div>
            <h4>No Recent Appointments</h4>
            <p>No recent appointments found.</p>
          </div>
        )}
      </div>

      {/* Top Performing Services */}
      <div className="top-services-section">
        <h3>
          <BarChart size={20} />
          Top Performing Services (Revenue)
        </h3>
        
        {topServices.length > 0 ? (
          <div className="top-services-grid">
            {topServices.map((service, index) => (
              <div key={index} className="service-card">
                <h4>{service.name}</h4>
                <div className="service-revenue">
                  {formatLKR(service.revenue)}
                </div>
                <div className="service-payment-breakdown">
                  <div className="service-actual">
                    <CheckCircle size={12} />
                    <span>Actual: {formatLKR(service.actualRevenue)}</span>
                  </div>
                  {service.estimatedRevenue > 0 && (
                    <div className="service-estimated">
                      <span>Estimated: {formatLKR(service.estimatedRevenue)}</span>
                    </div>
                  )}
                </div>
                <div className="service-metrics">
                  <div className="service-bookings">
                    <span>{service.bookings} booking{service.bookings !== 1 ? 's' : ''}</span>
                    <span className="service-actual-count">({service.actualBookings} actual)</span>
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
            <h4>No Service Data</h4>
            <p>No service revenue data available.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="revenue-summary">
        <h4>
          <DollarSign size={20} />
          Revenue Summary
        </h4>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Total Periods Tracked</div>
            <div className="summary-value">
              {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).length} {revenueType === 'monthly' ? 'months' : 'years'}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Appointments</div>
            <div className="summary-value">
              {(revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.appointments, 0)}
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Actual Payments</div>
            <div className="summary-value highlight actual">
              {actualPaymentCount} ({actualRevenuePercentage}%)
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Revenue</div>
            <div className="summary-value highlight total">
              {formatLKR((revenueType === 'monthly' ? monthlyRevenue : yearlyRevenue).reduce((sum, item) => sum + item.revenue, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="currency-info payment-info">
        <div className="payment-info-header">
          <CheckCircle size={20} color="#4CAF50" />
          <strong>Payment Data Sources</strong>
        </div>
        <div className="payment-info-content">
          <p>
            <strong>Actual Payments:</strong> Extracted from <code>totalPayment</code> field in database • 
            <strong> Estimated Payments:</strong> Calculated based on standard service prices for appointments without <code>totalPayment</code>
          </p>
          <p>
            Standard Service Prices: Facial: LKR 3,500 • Professional Makeup: LKR 4,000 • 
            Hair Color: LKR 3,500 • Spa Treatment: LKR 5,000 • Haircut: LKR 1,500
          </p>
        </div>
      </div>
    </div>
  );
};

export default Revenue;