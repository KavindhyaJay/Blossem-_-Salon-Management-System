import React, { useState, useEffect } from 'react';
import './AppointmentModal.css';

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
  });

  const [servicesInput, setServicesInput] = useState('');

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
        amount: appointment.amount || '',
        customerArrived: appointment.customerArrived || 'No',
        receptionPaymentChecked: appointment.receptionPaymentChecked || 'No',
        receptionNotes: appointment.receptionNotes || '',
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
      });
      setServicesInput('');
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      services: formData.services.filter((s) => s),
    };
    onSave(dataToSave);
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

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="customer@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                name="customerName"
                className="form-input"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Will be fetched from customer collection"
                readOnly
              />
              <small className="form-hint">Auto-filled from customer collection</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Services *</label>
              <input
                type="text"
                className="form-input"
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
                className="form-input"
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
                className="form-input"
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
                className="form-input"
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
                className="form-select"
                value={formData.payment}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="text"
                name="amount"
                className="form-input"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g., 2000"
              />
            </div>
          </div>

          {appointment && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer Arrived</label>
                <select
                  name="customerArrived"
                  className="form-select"
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
                  className="form-select"
                  value={formData.receptionPaymentChecked}
                  onChange={handleChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Reception Notes</label>
            <textarea
              name="receptionNotes"
              className="form-textarea"
              value={formData.receptionNotes}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {appointment ? 'Update Appointment' : 'Create Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

