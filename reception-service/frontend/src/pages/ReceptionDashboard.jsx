import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import AppointmentModal from "../components/AppointmentModal";
import BookingCalendar from "../components/BookingCalendar";
import SalonInsightsPanel from "../components/SalonInsightsPanel";
import StaffNotifyModal from "../components/StaffNotifyModal";
import { STAFF_DIRECTORY } from "../data/staffDirectory";
import { receptionService } from "../services/receptionService";
import "../styles/main.css";

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState("today");
  const [syncStatus, setSyncStatus] = useState({ running: false, summary: null, error: null, timestamp: null });
  const [arrivalPrompt, setArrivalPrompt] = useState({ open: false, appointment: null });
  const [sendingArrival, setSendingArrival] = useState(false);

  const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  const normalizeDateKey = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (DATE_ONLY_PATTERN.test(trimmed)) {
        return trimmed;
      }
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split("T")[0];
  };

  const appointmentsForSelectedDate = useMemo(() => {
    const key = normalizeDateKey(selectedDate);
    if (!key) return [];
    return appointments.filter((appointment) => normalizeDateKey(appointment.date) === key);
  }, [appointments, selectedDate]);

  const staffOptions = useMemo(() => {
    const directory = new Map(STAFF_DIRECTORY.map((staff) => [staff.name.toLowerCase(), { ...staff }]));
    appointments.forEach((appointment) => {
      if (!appointment?.staff) {
        return;
      }
      const key = appointment.staff.toLowerCase();
      if (!directory.has(key)) {
        directory.set(key, {
          id: `appointment-staff-${key}`,
          name: appointment.staff,
          email: appointment.staffEmail || "",
          specialization: "Assigned from booking",
        });
      } else if (!directory.get(key).email && appointment.staffEmail) {
        directory.set(key, { ...directory.get(key), email: appointment.staffEmail });
      }
    });

    return Array.from(directory.values());
  }, [appointments]);

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

    const refreshInterval = setInterval(loadAppointments, 10000);
    const syncInterval = setInterval(() => performSync({ reload: true }), 60000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(syncInterval);
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
    if (status === "Yes") {
      const target = appointments.find((appointment) => appointment.id === id);
      if (!target) {
        await loadAppointments();
        setError("Appointment could not be found. Please try again.");
        return;
      }
      setError(null);
      setArrivalPrompt({ open: true, appointment: target });
      return;
    }

    try {
      setError(null);
      const apt = appointments.find((appointment) => appointment.id === id);
      if (!apt) {
        await loadAppointments();
        return;
      }
      await receptionService.updateAppointment(id, {
        ...apt,
        customerArrived: "No",
      });
      await loadAppointments();
    } catch (err) {
      console.error("Error updating arrival status:", err);
      setError("Failed to update arrival status. Please try again.");
      await loadAppointments();
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

  const closeArrivalPrompt = () => setArrivalPrompt({ open: false, appointment: null });

  const handleArrivalSubmit = async ({ staffEmail, staffName }) => {
    if (!arrivalPrompt.appointment) {
      return;
    }

    try {
      setSendingArrival(true);
      setError(null);
      const appointmentId = arrivalPrompt.appointment.id;
      await receptionService.markArrived(appointmentId, staffEmail);

      if (staffName && staffName !== (arrivalPrompt.appointment.staff || "")) {
        await receptionService.updateAppointment(appointmentId, {
          ...arrivalPrompt.appointment,
          staff: staffName,
          customerArrived: "Yes",
        });
      }

      await loadAppointments();
      closeArrivalPrompt();
    } catch (err) {
      console.error("Error notifying staff:", err);
      setError("Failed to notify staff. Please try again.");
    } finally {
      setSendingArrival(false);
    }
  };

  const handleCalendarDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const clampDateToMonth = (monthDate, previousDate) => {
    if (!previousDate) {
      return monthDate;
    }
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const desiredDay = Math.min(previousDate.getDate(), daysInMonth);
    return new Date(monthDate.getFullYear(), monthDate.getMonth(), desiredDay);
  };

  const handleCalendarMonthChange = (monthDate) => {
    setActiveView("calendar");
    setSelectedDate((prev) => clampDateToMonth(monthDate, prev));
  };

  const syncPrimaryText = syncStatus.running
    ? "Auto-sync in progress…"
    : "Auto-sync runs every minute to keep bookings aligned.";

  const syncSecondaryText = syncStatus.summary
    ? `Synced ${syncStatus.summary.bookingsProcessed} bookings · ${syncStatus.summary.appointmentsCreated} new / ${syncStatus.summary.appointmentsUpdated} updated${syncStatus.timestamp ? ` · ${syncStatus.timestamp.toLocaleTimeString()}` : ""
    }`
    : syncStatus.running
      ? "Fetching latest bookings from Bookings service."
      : "Waiting for the next sync window.";

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
              <div className="sync-inline">
                <p className="sync-inline-primary">{syncPrimaryText}</p>
                <p className="sync-inline-secondary">{syncSecondaryText}</p>
                {syncStatus.error && (
                  <span className="sync-inline-error">{syncStatus.error}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <SalonInsightsPanel
          appointments={appointments}
          loading={loading}
          activeView={activeView}
          onViewChange={setActiveView}
          onMarkArrived={(id) => handleMarkArrived(id, "Yes")}
        />

        {activeView === "calendar" && (
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
                selectedDate={selectedDate}
                onDateClick={handleCalendarDateClick}
                onMonthChange={handleCalendarMonthChange}
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
                  <div className="daily-empty-state">
                    <div className="daily-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <p>Select a date to preview appointments.</p>
                  </div>
                ) : appointmentsForSelectedDate.length === 0 ? (
                  <div className="daily-empty-state">
                    <div className="daily-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                        <path d="M9 14h6" />
                      </svg>
                    </div>
                    <p>No appointments scheduled for this date.</p>
                  </div>
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
        )}

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

      <StaffNotifyModal
        isOpen={arrivalPrompt.open}
        appointment={arrivalPrompt.appointment}
        staffOptions={staffOptions}
        isSubmitting={sendingArrival}
        onSubmit={handleArrivalSubmit}
        onCancel={closeArrivalPrompt}
      />
    </div>
  );
}
