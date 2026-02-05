import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentModal from "../components/AppointmentModal";
import AllDataDisplay from "../components/AllDataDisplay";
import BookingCalendar from "../components/BookingCalendar";
import { receptionService } from "../services/receptionService";
import "../styles/main.css";

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [syncStatus, setSyncStatus] = useState({ running: false, summary: null, error: null, timestamp: null });

  const normalizeDateKey = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  };

  const appointmentsForSelectedDate = useMemo(() => {
    const key = normalizeDateKey(selectedDate);
    if (!key) return [];
    return appointments.filter((appointment) => normalizeDateKey(appointment.date) === key);
  }, [appointments, selectedDate]);

  // Load all appointments
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await receptionService.getAllAppointments();
      console.log("📊 Loaded appointments:", data); // Debug log
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error loading appointments:", err);
      setError("Failed to load appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const performSync = async ({ reload = true } = {}) => {
    if (syncStatus.running) {
      return;
    }
    try {
      setSyncStatus((prev) => ({ ...prev, running: true, error: null }));
      const summary = await receptionService.syncFromBookings();
      setSyncStatus({ running: false, summary, error: null, timestamp: new Date() });
      if (reload) {
        await loadAppointments();
      }
    } catch (err) {
      console.error("❌ Error syncing with bookings:", err);
      setSyncStatus({ running: false, summary: null, error: "Failed to sync with bookings.", timestamp: null });
      if (reload) {
        await loadAppointments();
      }
    }
  };

  useEffect(() => {
    // Initial sync pulls fresh booking data before loading appointments
    performSync();

    const interval = setInterval(loadAppointments, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle add appointment
  const handleAdd = () => {
    setEditingAppointment(null);
    setModalOpen(true);
  };

  // Handle edit appointment
  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setModalOpen(true);
  };

  // Handle save callback from modal (modal already persists changes via RTK Query)
  const handleSave = async () => {
    setError(null);
    setModalOpen(false);
    setEditingAppointment(null);
    await loadAppointments();
  };

  // Handle delete appointment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    try {
      setError(null);
      await receptionService.deleteAppointment(id);
      await loadAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to delete appointment. Please try again.");
    }
  };

  // Handle mark arrived
  const handleMarkArrived = async (id, status) => {
    try {
      setError(null);
      if (status === "Yes") {
        // Get staff email from the appointment or prompt
        const staffEmail = prompt("Enter staff email for notification (optional):");
        if (staffEmail && staffEmail.trim()) {
          await receptionService.markArrived(id, staffEmail.trim());
        } else {
          await receptionService.markArrived(id);
        }
      } else {
        // If setting to "No", just update via edit
        const apt = appointments.find(a => a.id === id);
        await receptionService.updateAppointment(id, {
          ...apt,
          customerArrived: "No"
        });
      }
      await loadAppointments();
    } catch (err) {
      console.error("Error updating arrival status:", err);
      setError("Failed to update arrival status. Please try again.");
      await loadAppointments(); // Reload to reset dropdown
    }
  };

  // Handle update payment check
  const handleUpdatePaymentCheck = async (id, status) => {
    try {
      setError(null);
      await receptionService.updatePaymentCheck(id, status);
      await loadAppointments();
    } catch (err) {
      console.error("Error updating payment check:", err);
      setError("Failed to update payment check. Please try again.");
      await loadAppointments(); // Reload to reset dropdown
    }
  };

  const handleCalendarDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : "Select a date";

  return (
    <div className="dashboard-container">
      <Header onAdd={handleAdd} />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-header__row">
            <h1>Reception Appointments</h1>
            <div className="sync-controls">
              <button
                className={`sync-btn ${syncStatus.running ? 'syncing' : ''}`}
                onClick={() => performSync()}
                disabled={syncStatus.running}
              >
                {syncStatus.running ? 'Syncing…' : 'Sync with Bookings'}
              </button>
              <div className="sync-meta">
                {syncStatus.running && <span className="sync-status-msg">Ensuring collections stay in sync…</span>}
                {!syncStatus.running && syncStatus.summary && (
                  <span className="sync-status-msg">
                    Synced {syncStatus.summary.bookingsProcessed} bookings ·
                    {` ${syncStatus.summary.appointmentsCreated} new / ${syncStatus.summary.appointmentsUpdated} updated`}
                    {syncStatus.timestamp && ` · ${syncStatus.timestamp.toLocaleTimeString()}`}
                  </span>
                )}
                {syncStatus.error && (
                  <span className="sync-status-error">{syncStatus.error}</span>
                )}
              </div>
            </div>
          </div>
          <div className="stats-container">
            <div className="stat-card">
              <span className="stat-label">Total</span>
              <span className="stat-value">{appointments.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Arrived</span>
              <span className="stat-value">
                {appointments.filter(a => a.customerArrived === "Yes").length}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pending Payment</span>
              <span className="stat-value">
                {appointments.filter(a => a.paymentChecked === "No").length}
              </span>
            </div>
          </div>
        </div>

        <section className="calendar-section">
          <div className="calendar-card">
            <div className="calendar-card__header">
              <div>
                <p className="calendar-eyebrow">Calendar</p>
                <h2>Check daily bookings</h2>
                <p className="calendar-subtitle">Tap a date to see who is scheduled.</p>
              </div>
            </div>
            <BookingCalendar
              bookings={appointments}
              onDateClick={handleCalendarDateClick}
              height={360}
            />
          </div>

          <div className="daily-card">
            <div className="daily-card__header">
              <div>
                <p className="calendar-eyebrow">Selected date</p>
                <h3>{selectedDateLabel}</h3>
              </div>
              {selectedDate && (
                <span className="daily-count">
                  {appointmentsForSelectedDate.length} {appointmentsForSelectedDate.length === 1 ? "booking" : "bookings"}
                </span>
              )}
            </div>
            <div className="daily-card__body">
              {!selectedDate ? (
                <p className="daily-empty">Select a date to preview appointments.</p>
              ) : appointmentsForSelectedDate.length === 0 ? (
                <p className="daily-empty">No appointments booked for this day.</p>
              ) : (
                <ul className="daily-list">
                  {appointmentsForSelectedDate.map((apt) => (
                    <li key={apt.id || apt._id} className="daily-list__item">
                      <div className="daily-time">{apt.time || "All day"}</div>
                      <div className="daily-details">
                        <p className="daily-name">{apt.customerName || "Unknown client"}</p>
                        <p className="daily-services">
                          {Array.isArray(apt.services) ? apt.services.join(", ") : apt.services || "Service TBD"}
                        </p>
                        <div className="daily-tags">
                          <span className={`tag ${apt.customerArrived === "Yes" ? "success" : "pending"}`}>
                            {apt.customerArrived === "Yes" ? "Arrived" : "Not arrived"}
                          </span>
                          <span className={`tag ${apt.paymentChecked === "Yes" ? "success" : "warning"}`}>
                            {apt.paymentChecked === "Yes" ? "Payment checked" : "Payment pending"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading appointments...</p>
            </div>
          ) : (
            <AppointmentTable
              appointments={appointments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkArrived={handleMarkArrived}
              onUpdatePaymentCheck={handleUpdatePaymentCheck}
            />
          )}
        </div>

        {/* All Database Data Display */}
        <AllDataDisplay />
      </main>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
          setError(null);
        }}
        onSave={handleSave}
        appointment={editingAppointment}
      />
    </div>
  );
}
