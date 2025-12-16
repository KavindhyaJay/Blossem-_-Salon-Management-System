import React from 'react';
import './AppointmentTable.css';

const AppointmentTable = ({ appointments, onEdit, onDelete, onMarkArrived, onUpdatePaymentCheck }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatServices = (services) => {
        if (!services || services.length === 0) return '-';
        return services.join(', ');
    };

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Email</th>
                        <th>Services</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Staff</th>
                        <th>Payment</th>
                        <th>Arrived</th>
                        <th>Payment Checked</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="10" className="empty-state">
                                <div className="empty-message">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 11L12 14L22 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p>No appointments found</p>
                                    <span>Click "Add Appointment" to create a new one</span>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        appointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>
                                    <div className="customer-name">
                                        <strong>{appointment.customerName || '-'}</strong>
                                    </div>
                                </td>
                                <td>{appointment.email || '-'}</td>
                                <td>
                                    <div className="services-list">
                                        {formatServices(appointment.services)}
                                    </div>
                                </td>
                                <td>{formatDate(appointment.date)}</td>
                                <td>{appointment.time || '-'}</td>
                                <td>{appointment.staff || '-'}</td>
                                <td>
                                    <span className={`badge ${appointment.payment === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                                        {appointment.payment || 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        className="status-select"
                                        value={appointment.customerArrived || 'No'}
                                        onChange={(e) => onMarkArrived(appointment.id, e.target.value)}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="status-select"
                                        value={appointment.receptionPaymentChecked || 'No'}
                                        onChange={(e) => onUpdatePaymentCheck(appointment.id, e.target.value)}
                                    >
                                        <option value="No">No</option>
                                        <option value="Yes">Yes</option>
                                    </select>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-edit"
                                            onClick={() => onEdit(appointment)}
                                            title="Edit"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => onDelete(appointment.id)}
                                            title="Delete"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AppointmentTable;

