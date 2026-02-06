import React, { useMemo, useState } from "react";
import "../styles/reception.css";

const mockStaff = [
    { id: "staff-1", name: "Sarah Johnson", email: "sarah.j@salon.com", specialization: "Hair Stylist" },
    { id: "staff-2", name: "Michael Chen", email: "michael.c@salon.com", specialization: "Colorist" },
    { id: "staff-3", name: "Emily Rodriguez", email: "emily.r@salon.com", specialization: "Nail Technician" },
    { id: "staff-4", name: "David Kim", email: "david.k@salon.com", specialization: "Massage Therapist" },
    { id: "staff-5", name: "Jessica Brown", email: "jessica.b@salon.com", specialization: "Esthetician" }
];

const mockInitialAppointments = [
    {
        id: "apt-1",
        email: "alice@example.com",
        services: ["Haircut", "Hair Coloring"],
        date: "2026-02-05",
        time: "09:00",
        staff: "Sarah Johnson",
        staffEmail: "sarah.j@salon.com",
        totalPayment: 170,
        paymentStatus: "Paid",
        customerStatus: "Not Arrived"
    },
    {
        id: "apt-2",
        email: "bob@example.com",
        services: ["Manicure", "Pedicure"],
        date: "2026-02-05",
        time: "10:00",
        staff: "Emily Rodriguez",
        staffEmail: "emily.r@salon.com",
        totalPayment: 80,
        paymentStatus: "Paid",
        customerStatus: "Not Arrived"
    },
    {
        id: "apt-3",
        email: "carol@example.com",
        services: ["Facial Treatment"],
        date: "2026-02-05",
        time: "11:30",
        staff: "Jessica Brown",
        staffEmail: "jessica.b@salon.com",
        totalPayment: 80,
        paymentStatus: "Paid",
        customerStatus: "Arrived"
    },
    {
        id: "apt-4",
        email: "david@example.com",
        services: ["Haircut"],
        date: "2026-02-10",
        time: "14:00",
        staff: "Sarah Johnson",
        staffEmail: "sarah.j@salon.com",
        totalPayment: 50,
        paymentStatus: "Paid",
        customerStatus: "Not Arrived"
    },
    {
        id: "apt-5",
        email: "emma@example.com",
        services: ["Massage", "Facial Treatment"],
        date: "2026-02-12",
        time: "10:30",
        staff: "David Kim",
        staffEmail: "david.k@salon.com",
        totalPayment: 170,
        paymentStatus: "Pending",
        customerStatus: "Not Arrived"
    },
    {
        id: "apt-6",
        email: "frank@example.com",
        services: ["Hair Coloring", "Hair Treatment"],
        date: "2026-02-15",
        time: "15:00",
        staff: "Michael Chen",
        staffEmail: "michael.c@salon.com",
        totalPayment: 180,
        paymentStatus: "Paid",
        customerStatus: "Not Arrived"
    }
];

const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const StatCard = ({ icon, label, value, accent }) => (
    <div className="stats-card">
        <div className="stats-card__label">
            <span role="img" aria-hidden="true">{icon}</span>
            {label}
        </div>
        <div className="stats-card__value" style={{ color: accent || "var(--fr-text)" }}>{value}</div>
    </div>
);

const AppointmentCard = ({ appointment, onStatusUpdate, onEdit, onDelete }) => (
    <div className="appointment-card">
        <div>
            <div className="appointment-card__title">{appointment.email}</div>
            <div className="appointment-card__meta">{appointment.services.join(", ")}</div>
        </div>

        <div className="appointment-card__meta">
            <strong>{formatDate(appointment.date)}</strong> · {appointment.time} · {appointment.staff}
        </div>

        <div className={`status-chip ${appointment.paymentStatus === "Paid" ? "paid" : "pending"}`}>
            {appointment.paymentStatus === "Paid" ? "Paid" : "Pending"}
        </div>

        <label style={{ fontSize: 13, fontWeight: 600 }}>
            Customer status
            <select
                className="arrival-select"
                value={appointment.customerStatus}
                onChange={(event) => onStatusUpdate(appointment.id, event.target.value)}
            >
                <option value="Arrived">Arrived</option>
                <option value="Not Arrived">Not Arrived</option>
            </select>
        </label>

        <div className="card-actions">
            {onEdit && (
                <button type="button" className="fr-btn-ghost" onClick={() => onEdit(appointment)}>
                    Edit
                </button>
            )}
            {onDelete && (
                <button type="button" className="fr-btn-danger" onClick={() => onDelete(appointment.id)}>
                    Delete
                </button>
            )}
        </div>
    </div>
);

const CalendarView = ({ appointments }) => {
    const grouped = useMemo(() => {
        return appointments.reduce((acc, apt) => {
            acc[apt.date] = acc[apt.date] || [];
            acc[apt.date].push(apt);
            return acc;
        }, {});
    }, [appointments]);

    const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

    if (!entries.length) {
        return <p className="fr-empty-state">No upcoming appointments</p>;
    }

    return (
        <div className="calendar-view">
            {entries.map(([date, items]) => (
                <div key={date} className="calendar-day">
                    <div className="calendar-day__date">{formatDate(date)}</div>
                    {items.map((apt) => (
                        <div key={apt.id} className="calendar-day__entry">
                            <span>{apt.time}</span>
                            <span>{apt.staff}</span>
                            <span>{apt.services.join(", ")}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const AppointmentDialog = ({ open, mode, staffList, initialValues, onClose, onSubmit }) => {
    const defaults = {
        email: "",
        services: "",
        date: "",
        time: "",
        staff: staffList[0]?.name || "",
        totalPayment: "",
        paymentStatus: "Paid",
        customerStatus: "Not Arrived"
    };

    const [form, setForm] = useState(defaults);

    React.useEffect(() => {
        if (!open) {
            return;
        }
        const nextValues = initialValues
            ? {
                email: initialValues.email || "",
                services: Array.isArray(initialValues.services) ? initialValues.services.join(", ") : initialValues.services || "",
                date: initialValues.date || "",
                time: initialValues.time || "",
                staff: initialValues.staff || staffList[0]?.name || "",
                totalPayment: initialValues.totalPayment ?? "",
                paymentStatus: initialValues.paymentStatus || "Paid",
                customerStatus: initialValues.customerStatus || "Not Arrived"
            }
            : defaults;
        setForm(nextValues);
    }, [open, initialValues, staffList]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.email || !form.date || !form.time) {
            return;
        }

        const selectedStaff = staffList.find((staff) => staff.name === form.staff);
        const services = form.services
            .split(",")
            .map((service) => service.trim())
            .filter(Boolean);

        onSubmit({
            id: initialValues?.id || `apt-${Date.now()}`,
            email: form.email,
            services: services.length ? services : ["General Service"],
            date: form.date,
            time: form.time,
            staff: form.staff,
            staffEmail: selectedStaff?.email || initialValues?.staffEmail || "",
            totalPayment: Number(form.totalPayment) || 0,
            paymentStatus: form.paymentStatus,
            customerStatus: form.customerStatus
        });
    };

    if (!open) {
        return null;
    }

    const title = mode === "edit" ? "Edit Appointment" : "New Appointment";

    return (
        <div className="fr-modal-overlay" role="dialog" aria-modal="true">
            <div className="fr-modal">
                <h3>{title}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="fr-form-grid">
                        <input name="email" placeholder="Customer email" value={form.email} onChange={handleChange} required />
                        <input name="services" placeholder="Services (comma separated)" value={form.services} onChange={handleChange} />
                        <input type="date" name="date" value={form.date} onChange={handleChange} required />
                        <input type="time" name="time" value={form.time} onChange={handleChange} required />
                        <select name="staff" value={form.staff} onChange={handleChange}>
                            {staffList.map((member) => (
                                <option key={member.id} value={member.name}>
                                    {member.name} · {member.specialization}
                                </option>
                            ))}
                        </select>
                        <input name="totalPayment" type="number" placeholder="Total payment" value={form.totalPayment} onChange={handleChange} />
                        <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                        </select>
                        <select name="customerStatus" value={form.customerStatus} onChange={handleChange}>
                            <option value="Arrived">Arrived</option>
                            <option value="Not Arrived">Not Arrived</option>
                        </select>
                    </div>
                    <div className="fr-form-actions">
                        <button type="button" className="fr-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="fr-btn-primary">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ReceptionExperience() {
    const [appointments, setAppointments] = useState(mockInitialAppointments);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("today");
    const [dialogState, setDialogState] = useState({ open: false, mode: "add", appointment: null });

    const todayKey = new Date().toISOString().split("T")[0];

    const openAddDialog = () => setDialogState({ open: true, mode: "add", appointment: null });
    const openEditDialog = (appointment) => setDialogState({ open: true, mode: "edit", appointment });
    const closeDialog = () => setDialogState((prev) => ({ ...prev, open: false }));

    const handleDialogSubmit = (appointmentData) => {
        setAppointments((prev) => {
            if (dialogState.mode === "edit") {
                return prev.map((apt) => (apt.id === appointmentData.id ? appointmentData : apt));
            }
            return [...prev, appointmentData];
        });
        closeDialog();
    };

    const handleDeleteAppointment = (id) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) {
            return;
        }
        setAppointments((prev) => prev.filter((apt) => apt.id !== id));
    };

    const filteredAppointments = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return appointments.filter((apt) =>
            apt.email.toLowerCase().includes(query) ||
            apt.staff.toLowerCase().includes(query) ||
            apt.services.some((service) => service.toLowerCase().includes(query))
        );
    }, [appointments, searchQuery]);

    const todayAppointments = filteredAppointments.filter((apt) => apt.date === todayKey);
    const arrivedCount = todayAppointments.filter((apt) => apt.customerStatus === "Arrived").length;
    const waitingCount = Math.max(todayAppointments.length - arrivedCount, 0);
    const totalRevenue = todayAppointments.reduce((sum, apt) => sum + (apt.totalPayment || 0), 0);

    const handleStatusUpdate = (id, status) => {
        setAppointments((prev) => prev.map((apt) => (apt.id === id ? { ...apt, customerStatus: status } : apt)));
    };

    const tabbedAppointments = {
        today: todayAppointments,
        calendar: filteredAppointments,
        all: [...filteredAppointments].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            return dateCompare === 0 ? a.time.localeCompare(b.time) : dateCompare;
        })
    };

    const renderAppointments = (list) => {
        if (!list.length) {
            return (
                <div className="fr-empty-state">
                    <p>No appointments found for this view.</p>
                </div>
            );
        }
        return (
            <div className="cards-grid">
                {list.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteAppointment}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="reception-experience">
            <header>
                <div className="fr-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1>Salon Reception</h1>
                        <p className="fr-subtitle">Manage appointments and customer arrivals</p>
                    </div>
                    <button className="fr-btn-primary" onClick={openAddDialog}>
                        Add Appointment
                    </button>
                </div>
            </header>

            <main className="fr-container" style={{ paddingTop: 32, paddingBottom: 60 }}>
                <section className="stats-grid">
                    <StatCard icon="📅" label="Today's Appointments" value={todayAppointments.length} accent="var(--fr-accent-light)" />
                    <StatCard icon="✅" label="Arrived" value={arrivedCount} accent="var(--fr-text)" />
                    <StatCard icon="⏱" label="Waiting" value={waitingCount} accent="var(--fr-muted)" />
                    <StatCard icon="💰" label="Today's Revenue" value={formatCurrency(totalRevenue)} accent="var(--fr-accent)" />
                </section>

                <div className="fr-search" style={{ position: "relative" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by customer email, staff name, or service..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>

                <div className="tabs-list">
                    <button className={`tab-button ${activeTab === "today" ? "active" : ""}`} onClick={() => setActiveTab("today")}>
                        Today's Appointments
                    </button>
                    <button className={`tab-button ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>
                        Calendar View
                    </button>
                    <button className={`tab-button ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
                        All Appointments
                    </button>
                </div>

                <section className="tab-panel">
                    {activeTab === "calendar" ? (
                        <CalendarView appointments={tabbedAppointments.calendar} />
                    ) : (
                        renderAppointments(tabbedAppointments[activeTab])
                    )}
                </section>

                <section className="info-card" style={{ marginTop: 32 }}>
                    <h3 style={{ marginTop: 0 }}>Data Collections Information</h3>
                    <p><strong>Booking Collection:</strong> Contains id, email, services, date, time, staff, totalPayment, paymentStatus.</p>
                    <p><strong>Reception Collection:</strong> Extends booking data with customerStatus and arrival tracking.</p>
                    <p><strong>Staff Collection:</strong> Name, email, specialty metadata for notifications.</p>
                    <p style={{ borderTop: "1px solid #bae6fd", paddingTop: 12, marginTop: 16 }}>
                        <strong>Note:</strong> In production, appointments sync between booking and reception collections. Staff receive an email when a customer arrives.
                    </p>
                </section>
            </main>

            <AppointmentDialog
                open={dialogState.open}
                mode={dialogState.mode}
                staffList={mockStaff}
                initialValues={dialogState.appointment}
                onClose={closeDialog}
                onSubmit={handleDialogSubmit}
            />
        </div>
    );
}
