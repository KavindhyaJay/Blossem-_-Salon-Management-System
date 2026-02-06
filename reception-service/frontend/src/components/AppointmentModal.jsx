import React, { useEffect, useMemo, useState } from 'react';
import './AppointmentModal.css';
import { createBooking as createBookingApi, updateBooking as updateBookingApi } from '../services/bookingService';
import { receptionService } from '../services/receptionService';

const SERVICE_OPTIONS = [
    { id: 'haircut', label: 'Haircut', price: 6000 },
    { id: 'hair-color', label: 'Hair Color', price: 9000 },
    { id: 'facial', label: 'Facial', price: 3500 },
    { id: 'nail-art', label: 'Nail Art', price: 3000 },
    { id: 'hair-styling', label: 'Hair Styling', price: 2500 },
    { id: 'spa-treatment', label: 'Spa Treatment', price: 5000 },
    { id: 'professional-makeup', label: 'Professional Makeup', price: 4000 },
];

const formatCurrency = (value) => {
    const numeric = Number(value) || 0;
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        maximumFractionDigits: 0,
    }).format(numeric);
};

const INITIAL_FORM_STATE = {
    email: '',
    customerName: '',
    services: [],
    date: '',
    time: '',
    staff: '',
    payment: 'Pending',
    amount: 0,
    bookingId: '',
};

const AppointmentModal = ({ isOpen, onClose, onSave, appointment = null }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingSyncing, setIsBookingSyncing] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    const priceMap = useMemo(
        () =>
            SERVICE_OPTIONS.reduce((acc, option) => {
                acc[option.label] = option.price;
                return acc;
            }, {}),
        []
    );

    const calculateTotalFromServices = (services = []) =>
        services.reduce((sum, item) => sum + (priceMap[item] || 0), 0);

    const isLoading = isSubmitting || isBookingSyncing;

    const isValueFilled = (value) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return Boolean(value);
    };

    const getInputClasses = (value) => `form-input${isValueFilled(value) ? ' filled' : ''}`;
    const getSelectClasses = (value, defaultValue = '') => {
        const filled = isValueFilled(value) && value !== defaultValue;
        return `form-select${filled ? ' filled' : ''}`;
    };

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (appointment) {
            const services = appointment.services || [];
            const resolvedAmount =
                appointment.totalPayment ?? appointment.amount ?? calculateTotalFromServices(services);

            setFormData({
                email: appointment.email || '',
                customerName: appointment.customerName || '',
                services,
                date: appointment.date || '',
                time: appointment.time || '',
                staff: appointment.staff || '',
                payment: appointment.payment || 'Pending',
                amount: Number(resolvedAmount) || 0,
                bookingId: appointment.bookingId || '',
            });
        } else {
            setFormData({ ...INITIAL_FORM_STATE });
        }

        setBookingError(null);
    }, [appointment, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleServiceToggle = (serviceLabel) => {
        setFormData((prev) => {
            const exists = prev.services.includes(serviceLabel);
            const services = exists
                ? prev.services.filter((item) => item !== serviceLabel)
                : [...prev.services, serviceLabel];

            return {
                ...prev,
                services,
                amount: calculateTotalFromServices(services),
            };
        });
    };

    const parseAmountValue = (value) => {
        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }

        const cleaned = value.toString().replace(/[^0-9.]/g, '');
        if (!cleaned) {
            return null;
        }
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const normalizedServices = formData.services.filter(Boolean);
        if (!normalizedServices.length) {
            setBookingError('Select at least one service.');
            return;
        }

        const totalPayment = parseAmountValue(formData.amount) ?? 0;

        const bookingPayload = {
            customerName: formData.customerName,
            email: formData.email,
            services: normalizedServices,
            date: formData.date,
            time: formData.time,
            staff: formData.staff,
            payment: formData.payment,
            totalPayment,
        };

        const receptionPayload = {
            ...formData,
            services: normalizedServices,
            amount: totalPayment,
            totalPayment,
        };

        try {
            setBookingError(null);
            setIsBookingSyncing(true);
            setIsSubmitting(true);

            let bookingId = formData.bookingId || appointment?.bookingId || null;

            if (bookingId) {
                await updateBookingApi(bookingId, bookingPayload);
            } else {
                const bookingResponse = await createBookingApi(bookingPayload);
                const bookingData = bookingResponse?.data ?? bookingResponse;
                bookingId = bookingData?.id || bookingData?._id;
            }

            if (!bookingId) {
                throw new Error('Booking ID missing after syncing booking collection');
            }

            const payloadToPersist = {
                ...receptionPayload,
                bookingId,
            };

            setFormData((prev) => ({ ...prev, bookingId }));

            if (appointment) {
                await receptionService.updateAppointment(appointment.id || appointment._id, payloadToPersist);
            } else {
                await receptionService.createAppointment(payloadToPersist);
            }

            onSave(payloadToPersist);
            onClose();
        } catch (error) {
            console.error('❌ Error saving appointment:', error);
            const message = error?.response?.data?.message || error?.message || 'Unknown error';
            setBookingError(message);
            alert('Failed to save appointment: ' + message);
        } finally {
            setIsBookingSyncing(false);
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{appointment ? 'Edit Appointment' : 'Add New Appointment'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        &times;
                    </button>
                </div>

                {bookingError && (
                    <div className="error-message">❌ Error: {bookingError}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className={getInputClasses(formData.email)}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="customer@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Customer Name *</label>
                            <input
                                type="text"
                                name="customerName"
                                className={getInputClasses(formData.customerName)}
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter customer full name"
                                required
                            />
                            <small className="form-hint">Enter the exact name provided by the customer</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label className="form-label">Services *</label>
                            <div className="service-grid">
                                {SERVICE_OPTIONS.map((option) => {
                                    const isSelected = formData.services.includes(option.label);
                                    return (
                                        <button
                                            type="button"
                                            key={option.id}
                                            className={`service-option${isSelected ? ' selected' : ''}`}
                                            onClick={() => handleServiceToggle(option.label)}
                                        >
                                            <span>{option.label}</span>
                                            <strong>{formatCurrency(option.price)}</strong>
                                        </button>
                                    );
                                })}
                            </div>
                            <small className="form-hint">Select one or more services to auto-calculate the total.</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Staff</label>
                            <input
                                type="text"
                                name="staff"
                                className={getInputClasses(formData.staff)}
                                value={formData.staff}
                                onChange={handleChange}
                                placeholder="Staff name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                name="date"
                                className={getInputClasses(formData.date)}
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Time *</label>
                            <input
                                type="text"
                                name="time"
                                className={getInputClasses(formData.time)}
                                value={formData.time}
                                onChange={handleChange}
                                placeholder="e.g., 4:00 PM"
                                required
                            />
                            <small className="form-hint">Format: HH:MM AM/PM (e.g., 4:00 PM)</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Status</label>
                            <select
                                name="payment"
                                className={getSelectClasses(formData.payment, 'Pending')}
                                value={formData.payment}
                                onChange={handleChange}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Total Payment</label>
                            <div className="total-display">
                                <span>{formatCurrency(formData.amount)}</span>
                            </div>
                            <small className="form-hint">Automatically calculated from selected services.</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Selected Services</label>
                            <div className="selected-services">
                                {formData.services.length === 0 && <span className="service-pill muted">None</span>}
                                {formData.services.map((service) => (
                                    <span key={service} className="service-pill">
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="spinner"></span>
                                    {appointment ? 'Updating...' : 'Creating...'}
                                </>
                            ) : appointment ? (
                                'Update Appointment'
                            ) : (
                                'Create Appointment'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;
