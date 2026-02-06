import React, { useEffect, useMemo, useState } from "react";
import "./AppointmentModal.css";
import "./StaffNotifyModal.css";

const CUSTOM_OPTION = "__custom__";

const buildSummaryList = (appointment) => {
    if (!appointment) {
        return [];
    }
    return [
        { label: "Customer", value: appointment.customerName || appointment.email || "Unknown client" },
        { label: "Email", value: appointment.email || "Not provided" },
        {
            label: "Services",
            value: Array.isArray(appointment.services) && appointment.services.length
                ? appointment.services.join(", ")
                : appointment.services || "Not specified",
        },
        { label: "Date", value: appointment.date || "Date TBD" },
        { label: "Time", value: appointment.time || "Anytime" },
    ];
};

export default function StaffNotifyModal({
    isOpen,
    appointment,
    staffOptions = [],
    isSubmitting = false,
    onSubmit,
    onCancel,
}) {
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [email, setEmail] = useState("");
    const [formError, setFormError] = useState("");

    const summaryItems = useMemo(() => buildSummaryList(appointment), [appointment]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedStaffId("");
            setEmail("");
            setFormError("");
            return;
        }

        const normalizedName = appointment?.staff?.toLowerCase();
        const matched = staffOptions.find((staff) => normalizedName && staff.name.toLowerCase() === normalizedName);
        const initial = matched || staffOptions[0];
        setSelectedStaffId(initial?.id ?? "");
        setEmail(initial?.email || appointment?.staffEmail || "");
        setFormError("");
    }, [isOpen, appointment, staffOptions]);

    if (!isOpen) {
        return null;
    }

    const selectedStaff = staffOptions.find((staff) => staff.id === selectedStaffId);

    const handleStaffChange = (event) => {
        const value = event.target.value;
        setSelectedStaffId(value);
        if (value === CUSTOM_OPTION) {
            setEmail("");
            return;
        }
        const staff = staffOptions.find((item) => item.id === value);
        setEmail(staff?.email || "");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!email) {
            setFormError("Select a staff member or enter an email address.");
            return;
        }
        setFormError("");
        const staffName =
            selectedStaff?.name ||
            appointment?.staff ||
            (email ? "Selected Staff" : "");
        onSubmit?.({ staffEmail: email, staffName });
    };

    return (
        <div className="modal-overlay arrival-modal" role="dialog" aria-modal="true">
            <div className="modal-content arrival-modal__content">
                <div className="modal-header arrival-modal__header">
                    <div>
                        <p className="modal-eyebrow">Notify Assigned Staff</p>
                        <h3 className="modal-title">Customer has arrived</h3>
                    </div>
                    <button type="button" className="close-btn" onClick={onCancel} aria-label="Close arrival modal">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="arrival-form">
                    <div className="arrival-summary">
                        {summaryItems.map((item) => (
                            <p key={item.label}>
                                <strong>{item.label}:</strong> {item.value}
                            </p>
                        ))}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="staff-select">
                            Staff member
                        </label>
                        <select
                            id="staff-select"
                            className={`form-select ${selectedStaffId ? "filled" : ""}`}
                            value={selectedStaffId}
                            onChange={handleStaffChange}
                        >
                            <option value="">Choose staff to notify</option>
                            {staffOptions.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name} · {staff.specialization}
                                </option>
                            ))}
                            <option value={CUSTOM_OPTION}>Someone else…</option>
                        </select>
                        <p className="form-hint">Select the stylist who should receive the arrival notification.</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="staff-email">
                            Notification email
                        </label>
                        <input
                            id="staff-email"
                            type="email"
                            className={`form-input ${email ? "filled" : ""}`}
                            placeholder="staff@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                        <p className="form-hint">We will email the arrival summary to this address.</p>
                    </div>

                    {formError && <p className="arrival-error">{formError}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? "Sending…" : "Send & Mark arrived"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
