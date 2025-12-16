import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import AppointmentTable from "../components/AppointmentTable";
import AppointmentModal from "../components/AppointmentModal";
import AllDataDisplay from "../components/AllDataDisplay";
import { receptionService } from "../services/receptionService";
import "../styles/main.css";

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    // Load appointments on component mount
    loadAppointments();

    // Refresh data every 10 seconds for real-time updates
    const interval = setInterval(loadAppointments, 10000);

    return () => {
      if (interval) clearInterval(interval);
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

  // Handle save appointment (create or update)
  const handleSave = async (appointmentData) => {
    try {
      setError(null);
      if (editingAppointment) {
        await receptionService.updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await receptionService.createAppointment(appointmentData);
      }
      setModalOpen(false);
      setEditingAppointment(null);
      await loadAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
      setError(err.response?.data?.message || "Failed to save appointment. Please try again.");
    }
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
          <h1>Reception Appointments</h1>
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
                {appointments.filter(a => a.receptionPaymentChecked === "No").length}
              </span>
            </div>
          </div>
        </div>

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
