import React, { useState, useEffect } from 'react';
import { receptionService } from '../services/receptionService';
import './AllDataDisplay.css';

const AllDataDisplay = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewType, setViewType] = useState('table'); // 'table' or 'cards'
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch all data
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await receptionService.getAllAppointments();
                console.log('📊 All Database Data:', data);
                setAppointments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('❌ Error fetching data:', err);
                setError('Failed to load data from database');
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Filter appointments based on filter and search
    const getFilteredAppointments = () => {
        let filtered = appointments;

        // Filter by status
        if (filter === 'arrived') {
            filtered = filtered.filter(a => a.customerArrived === 'Yes');
        } else if (filter === 'pending') {
            filtered = filtered.filter(a => a.customerArrived === 'No');
        } else if (filter === 'unpaid') {
            filtered = filtered.filter(a => a.receptionPaymentChecked === 'No');
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.phone?.includes(searchTerm)
            );
        }

        return filtered;
    };

    const filteredAppointments = getFilteredAppointments();

    // Statistics
    const stats = {
        total: appointments.length,
        arrived: appointments.filter(a => a.customerArrived === 'Yes').length,
        pending: appointments.filter(a => a.customerArrived === 'No').length,
        unpaid: appointments.filter(a => a.receptionPaymentChecked === 'No').length,
        paidCount: appointments.filter(a => a.payment === 'Paid').length,
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatServices = (services) => {
        if (!services || services.length === 0) return '-';
        if (Array.isArray(services)) return services.join(', ');
        return services;
    };

    return (
        <div className="all-data-display">
            <div className="display-header">
                <h2>📊 All Database Appointments</h2>
                <div className="display-controls">
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
                            onClick={() => setViewType('table')}
                        >
                            📋 Table
                        </button>
                        <button
                            className={`view-btn ${viewType === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewType('cards')}
                        >
                            🎴 Cards
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="stats-section">
                <div className="stat-box total">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                        <span className="stat-label">Total Records</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-box arrived">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                        <span className="stat-label">Arrived</span>
                        <span className="stat-value">{stats.arrived}</span>
                    </div>
                </div>
                <div className="stat-box pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Arrival</span>
                        <span className="stat-value">{stats.pending}</span>
                    </div>
                </div>
                <div className="stat-box unpaid">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                        <span className="stat-label">Unpaid</span>
                        <span className="stat-value">{stats.unpaid}</span>
                    </div>
                </div>
                <div className="stat-box paid">
                    <div className="stat-icon">💵</div>
                    <div className="stat-info">
                        <span className="stat-label">Paid</span>
                        <span className="stat-value">{stats.paidCount}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-section">
                <label>Filter by Status:</label>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'arrived' ? 'active' : ''}`}
                        onClick={() => setFilter('arrived')}
                    >
                        Arrived ({stats.arrived})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </button>
                    <button
                        className={`filter-btn ${filter === 'unpaid' ? 'active' : ''}`}
                        onClick={() => setFilter('unpaid')}
                    >
                        Unpaid ({stats.unpaid})
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading data from database...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>❌ {error}</p>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="empty-container">
                    <p>No appointments found</p>
                </div>
            ) : viewType === 'table' ? (
                <div className="table-view">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Services</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Staff</th>
                                <th>Payment</th>
                                <th>Arrived</th>
                                <th>Payment Checked</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((apt, index) => (
                                <tr key={apt._id || apt.id} className={apt.customerArrived === 'Yes' ? 'arrived' : ''}>
                                    <td className="row-number">{index + 1}</td>
                                    <td className="customer-name">
                                        <strong>{apt.customerName || '-'}</strong>
                                    </td>
                                    <td className="email">{apt.email || '-'}</td>
                                    <td className="phone">{apt.phone || '-'}</td>
                                    <td className="services">{formatServices(apt.services)}</td>
                                    <td className="date">{formatDate(apt.date)}</td>
                                    <td className="time">{apt.time || '-'}</td>
                                    <td className="staff">{apt.staff || '-'}</td>
                                    <td className="payment">
                                        <span className={`badge ${apt.payment === 'Paid' ? 'paid' : 'pending'}`}>
                                            {apt.payment || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="arrived">
                                        <span className={`status ${apt.customerArrived === 'Yes' ? 'yes' : 'no'}`}>
                                            {apt.customerArrived === 'Yes' ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </td>
                                    <td className="payment-checked">
                                        <span className={`status ${apt.receptionPaymentChecked === 'Yes' ? 'yes' : 'no'}`}>
                                            {apt.receptionPaymentChecked === 'Yes' ? '✓ Yes' : '✗ No'}
                                        </span>
                                    </td>
                                    <td className="notes">{apt.notes || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">
                        <p>Showing {filteredAppointments.length} of {appointments.length} records</p>
                    </div>
                </div>
            ) : (
                <div className="cards-view">
                    {filteredAppointments.map((apt) => (
                        <div key={apt._id || apt.id} className="data-card">
                            <div className="card-header">
                                <h3>{apt.customerName || 'Unknown'}</h3>
                                <span className={`card-status ${apt.customerArrived === 'Yes' ? 'arrived' : 'pending'}`}>
                                    {apt.customerArrived === 'Yes' ? '✓ Arrived' : '⏳ Pending'}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="card-field">
                                    <span className="label">📧 Email:</span>
                                    <span className="value">{apt.email || '-'}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">📱 Phone:</span>
                                    <span className="value">{apt.phone || '-'}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">💇 Services:</span>
                                    <span className="value">{formatServices(apt.services)}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">📅 Date:</span>
                                    <span className="value">{formatDate(apt.date)}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">⏰ Time:</span>
                                    <span className="value">{apt.time || '-'}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">👤 Staff:</span>
                                    <span className="value">{apt.staff || '-'}</span>
                                </div>
                                <div className="card-field">
                                    <span className="label">💰 Payment:</span>
                                    <span className={`value badge ${apt.payment === 'Paid' ? 'paid' : 'pending'}`}>
                                        {apt.payment || 'Pending'}
                                    </span>
                                </div>
                                <div className="card-field">
                                    <span className="label">✔️ Payment Checked:</span>
                                    <span className={`value ${apt.receptionPaymentChecked === 'Yes' ? 'yes' : 'no'}`}>
                                        {apt.receptionPaymentChecked === 'Yes' ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                {apt.notes && (
                                    <div className="card-field">
                                        <span className="label">📝 Notes:</span>
                                        <span className="value">{apt.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllDataDisplay;
