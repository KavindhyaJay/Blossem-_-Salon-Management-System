import React, { useState, useEffect } from 'react';
import './AppointmentModal.css';
import { createBooking as createBookingApi, updateBooking as updateBookingApi } from '../services/bookingService';
import { receptionService } from '../services/receptionService';

const AppointmentModal = ({ isOpen, onClose, onSave, appointment = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    customerName: '',
    services: [],
    date: '',
    time: '',
    staff: '',
    payment: 'Pending',
    amount: '',
    customerArrived: 'No',
    receptionPaymentChecked: 'No',
    receptionNotes: '',
    bookingId: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingSyncing, setIsBookingSyncing] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const isLoading = isSubmitting || isBookingSyncing;

  const [servicesInput, setServicesInput] = useState('');

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
  const getTextareaClasses = (value) => `form-textarea${isValueFilled(value) ? ' filled' : ''}`;
  const getSelectClasses = (value, defaultValue = '') => {
    const filled = isValueFilled(value) && value !== defaultValue;
    return `form-select${filled ? ' filled' : ''}`;
  };

  useEffect(() => {
    if (appointment) {
      setFormData({
        email: appointment.email || '',
        customerName: appointment.customerName || '',
        services: appointment.services || [],
        date: appointment.date || '',
        time: appointment.time || '',
        staff: appointment.staff || '',
        payment: appointment.payment || 'Pending',
        amount: appointment.totalPayment ?? appointment.amount ?? '',
        customerArrived: appointment.customerArrived || 'No',
        receptionPaymentChecked: appointment.paymentChecked || appointment.receptionPaymentChecked || 'No',
        receptionNotes: appointment.receptionNotes || '',
        bookingId: appointment.bookingId || '',
      });
      setServicesInput((appointment.services || []).join(', '));
    } else {
      setFormData({
        email: '',
        customerName: '',
        services: [],
        date: '',
        time: '',
        staff: '',
        payment: 'Pending',
        amount: '',
        customerArrived: 'No',
        receptionPaymentChecked: 'No',
        receptionNotes: '',
        bookingId: '',
      });
      setServicesInput('');
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

  const handleServicesChange = (e) => {
    const value = e.target.value;
    setServicesInput(value);
    const services = value.split(',').map((s) => s.trim()).filter((s) => s);
    setFormData((prev) => ({
      ...prev,
      services,
    }));
  };

  const parseAmountValue = (value) => {
    if (value === null || value === undefined) {
      return null;
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
    const normalizedServices = formData.services.filter((s) => s);
    const dataToSave = {
      ...formData,
      services: normalizedServices,
    };

    const bookingPayload = {
      customerName: formData.customerName,
      email: formData.email,
      services: normalizedServices,
      date: formData.date,
      time: formData.time,
      staff: formData.staff,
      payment: formData.payment,
      totalPayment: parseAmountValue(formData.amount),
      createReceptionAppointment: false,
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

      setFormData((prev) => ({ ...prev, bookingId }));

      const payload = {
        ...dataToSave,
        bookingId,
      };

      if (appointment) {
        await receptionService.updateAppointment(appointment.id || appointment._id, payload);
      } else {
        await receptionService.createAppointment(payload);
      }

      onSave(payload);
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
          <h2 className="modal-title">
            {appointment ? 'Edit Appointment' : 'Add New Appointment'}
          </h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {bookingError && (
          <div className="error-message">
            ❌ Error: {bookingError}
          </div>
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
            <div className="form-group">
              <label className="form-label">Services *</label>
              <input
                type="text"
                className={getInputClasses(servicesInput)}
                value={servicesInput}
                onChange={handleServicesChange}
                placeholder="Hair cut, Hair Color, Treatment (comma separated)"
                required
              />
              <small className="form-hint">Separate multiple services with commas</small>
            </div>

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
          </div>

          <div className="form-row">
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
          </div>

          <div className="form-row">
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

            <div className="form-group">
              <label className="form-label">Total Payment</label>
              <input
                type="text"
                name="amount"
                className={getInputClasses(formData.amount)}
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 16000"
              />
              <small className="form-hint">This value is saved into the booking collection.</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer Arrived</label>
              <select
                name="customerArrived"
                className={getSelectClasses(formData.customerArrived, 'No')}
                value={formData.customerArrived}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Checked</label>
              <select
                name="receptionPaymentChecked"
                className={getSelectClasses(formData.receptionPaymentChecked, 'No')}
                value={formData.receptionPaymentChecked}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reception Notes</label>
            <textarea
              name="receptionNotes"
              className={getTextareaClasses(formData.receptionNotes)}
              value={formData.receptionNotes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
            />
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
              ) : (
                appointment ? 'Update Appointment' : 'Create Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

