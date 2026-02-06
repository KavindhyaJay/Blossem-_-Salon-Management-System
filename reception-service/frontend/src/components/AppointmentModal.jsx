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

const STAFF_OPTIONS = [
    { id: 'raisin-cooper', name: 'Raisin Cooper', services: 'Facial, Professional Makeup' },
    { id: 'risty-murphy', name: 'Risty Murphy', services: 'Spa treatment, Facial, Professional Makeup' },
    { id: 'katherine-lopez', name: 'Katherine Lopez', services: 'Hair cut, Hair color' },
    { id: 'tanya-dias', name: 'Tanya Dias', services: 'Nail art' },
    { id: 'sydney-swean', name: 'Sydney Swean', services: 'Hair styling, Hair color' },
    { id: 'jessica-grey', name: 'Jessica Grey', services: 'Hair styling, Hair cut' },
    { id: 'john-smith', name: 'John Smith', services: 'Spa treatment' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_PATTERN = /^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;

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
    paymentStatus: 'Pending',
    amount: 0,
    bookingId: '',
};

const AppointmentModal = ({ isOpen, onClose, onSave, appointment = null }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isBookingSyncing, setIsBookingSyncing] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [errors, setErrors] = useState({});

    const priceMap = useMemo(
        () =>
            SERVICE_OPTIONS.reduce((acc, option) => {
                acc[option.label] = option.price;
                return acc;
            }, {}),
        []
    );

    const staffOptions = useMemo(() => {
        if (!formData.staff) {
            return STAFF_OPTIONS;
        }
        const exists = STAFF_OPTIONS.some((option) => option.name === formData.staff);
        if (exists) {
            return STAFF_OPTIONS;
        }
        return [...STAFF_OPTIONS, { id: 'existing-staff', name: formData.staff, services: '(current selection)' }];
    }, [formData.staff]);

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

    const clearFieldError = (field) => {
        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const isDateInPast = (value) => {
        if (!value) {
            return true;
        }
        const selected = new Date(value);
        const today = new Date();
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return selected < today;
    };

    const validateForm = () => {
        const validationErrors = {};
        const emailValue = formData.email.trim();
        const nameValue = formData.customerName.trim();
        const timeValue = formData.time.trim();
        const chosenServices = formData.services.filter(Boolean);

        if (!emailValue) {
            validationErrors.email = 'Email is required.';
        } else if (!EMAIL_PATTERN.test(emailValue)) {
            validationErrors.email = 'Enter a valid email address.';
        }

        if (!nameValue) {
            validationErrors.customerName = 'Customer name is required.';
        } else if (nameValue.length < 2) {
            validationErrors.customerName = 'Name must be at least 2 characters.';
        }

        if (!formData.date) {
            validationErrors.date = 'Select an appointment date.';
        } else if (isDateInPast(formData.date)) {
            validationErrors.date = 'Date cannot be in the past.';
        }

        if (!timeValue) {
            validationErrors.time = 'Enter an appointment time.';
        } else if (!TIME_PATTERN.test(timeValue)) {
            validationErrors.time = 'Use the HH:MM AM/PM format (e.g., 04:30 PM).';
        }

        if (!chosenServices.length) {
            validationErrors.services = 'Select at least one service to continue.';
        }

        return validationErrors;
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
                paymentStatus: appointment.paymentStatus || appointment.payment || 'Pending',
                amount: Number(resolvedAmount) || 0,
                bookingId: appointment.bookingId || '',
            });
        } else {
            setFormData({ ...INITIAL_FORM_STATE });
        }

        setBookingError(null);
        setErrors({});
    }, [appointment, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        clearFieldError(name);
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
        if (errors.services) {
            clearFieldError('services');
        }
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

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            setBookingError('Please fix the highlighted fields.');
            return;
        }
        setErrors({});
        setBookingError(null);

        const normalizedServices = formData.services.filter(Boolean);

        const totalPayment = parseAmountValue(formData.amount) ?? 0;

        const bookingPayload = {
            customerName: formData.customerName,
            email: formData.email,
            services: normalizedServices,
            date: formData.date,
            time: formData.time,
            staff: formData.staff,
            paymentStatus: formData.paymentStatus,
            totalPayment,
            createReceptionAppointment: false,
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
                        <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className={`${getInputClasses(formData.email)}${errors.email ? ' has-error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="customer@example.com"
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        <div className={`form-group${errors.customerName ? ' has-error' : ''}`}>
                            <label className="form-label">Customer Name *</label>
                            <input
                                type="text"
                                name="customerName"
                                className={`${getInputClasses(formData.customerName)}${errors.customerName ? ' has-error' : ''}`}
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Enter customer full name"
                                required
                            />
                            <small className="form-hint">Enter the exact name provided by the customer</small>
                            {errors.customerName && <span className="form-error">{errors.customerName}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group full-width${errors.services ? ' has-error' : ''}`}>
                            <label className="form-label">Services *</label>
                            <div className={`service-grid${errors.services ? ' has-error' : ''}`}>
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
                            {errors.services && <span className="form-error">{errors.services}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Staff</label>
                            <select
                                name="staff"
                                className={getSelectClasses(formData.staff)}
                                value={formData.staff}
                                onChange={handleChange}
                            >
                                <option value="">Select a staff member</option>
                                {staffOptions.map((option) => (
                                    <option key={option.id} value={option.name}>
                                        {`${option.name} – ${option.services}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={`form-group${errors.date ? ' has-error' : ''}`}>
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                name="date"
                                className={`${getInputClasses(formData.date)}${errors.date ? ' has-error' : ''}`}
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group${errors.time ? ' has-error' : ''}`}>
                            <label className="form-label">Time *</label>
                            <input
                                type="text"
                                name="time"
                                className={`${getInputClasses(formData.time)}${errors.time ? ' has-error' : ''}`}
                                value={formData.time}
                                onChange={handleChange}
                                placeholder="e.g., 4:00 PM"
                                required
                            />
                            <small className="form-hint">Format: HH:MM AM/PM (e.g., 4:00 PM)</small>
                            {errors.time && <span className="form-error">{errors.time}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Payment Status</label>
                            <select
                                name="paymentStatus"
                                className={getSelectClasses(formData.paymentStatus, 'Pending')}
                                value={formData.paymentStatus}
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
