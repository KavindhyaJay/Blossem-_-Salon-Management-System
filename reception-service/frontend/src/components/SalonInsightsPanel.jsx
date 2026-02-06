import React, { useMemo, useState } from "react";
import "../styles/insightsPanel.css";

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

const formatCurrency = (value) => {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(numeric);
    }
    return "$0";
};

const formatLongDate = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Date TBD";
    }
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
};

const servicesList = (services) => {
    if (!services) {
        return [];
    }
    if (Array.isArray(services)) {
        return services.filter(Boolean);
    }
    if (typeof services === "string") {
        return services.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

export default function SalonInsightsPanel({ appointments = [], loading = false, onMarkArrived, activeView, onViewChange, defaultView = "today" }) {
    const isControlled = typeof activeView === "string";
    const [internalView, setInternalView] = useState(defaultView);
    const currentView = isControlled ? activeView : internalView;
    const [query, setQuery] = useState("");

    const handleViewChange = (view) => {
        if (!isControlled) {
            setInternalView(view);
        }
        onViewChange?.(view);
    };

    const searchValue = query.trim().toLowerCase();
    const todayKey = normalizeDateKey(new Date());

    const filteredAppointments = useMemo(() => {
        if (!searchValue) {
            return appointments;
        }
        return appointments.filter((apt) => {
            const haystack = [
                apt.customerName,
                apt.email,
                apt.staff,
                Array.isArray(apt.services) ? apt.services.join(" ") : apt.services,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return haystack.includes(searchValue);
        });
    }, [appointments, searchValue]);

    const todayAppointments = useMemo(
        () => filteredAppointments.filter((apt) => normalizeDateKey(apt.date) === todayKey),
        [filteredAppointments, todayKey]
    );

    const orderedAppointments = useMemo(() => {
        return [...filteredAppointments].sort((a, b) => {
            const dateA = normalizeDateKey(a.date) || "";
            const dateB = normalizeDateKey(b.date) || "";
            if (dateA === dateB) {
                return (a.time || "").localeCompare(b.time || "");
            }
            return dateA.localeCompare(dateB);
        });
    }, [filteredAppointments]);

    const arrivedCount = todayAppointments.filter((apt) => apt.customerArrived === "Yes").length;
    const waitingCount = Math.max(todayAppointments.length - arrivedCount, 0);
    const todayRevenue = todayAppointments.reduce((sum, apt) => sum + (Number(apt.totalPayment) || 0), 0);

    const renderAppointmentCards = (list) => {
        if (!list.length) {
            return (
                <div className="insight-empty">
                    <p>No appointments found for this view.</p>
                </div>
            );
        }

        return (
            <div className="insight-cards">
                {list.map((apt) => {
                    const appointmentId = apt.id || apt._id;
                    const cardServices = servicesList(apt.services);
                    const arrived = apt.customerArrived === "Yes";

                    return (
                        <article key={appointmentId || apt.email} className={`insight-card ${arrived ? "insight-card--arrived" : ""}`}>
                            <div className="insight-card__row">
                                <span className="insight-time">{apt.time || "All day"}</span>
                                <span className={`insight-pill ${arrived ? "is-arrived" : "is-waiting"}`}>
                                    {arrived ? "Arrived" : "Waiting"}
                                </span>
                            </div>

                            <div className="insight-contact">
                                <p className="insight-email">{apt.email || "No email on record"}</p>
                                <p className="insight-name">{apt.customerName || "Walk-in client"}</p>
                            </div>

                            <div className="insight-services">
                                {cardServices.length ? (
                                    cardServices.map((service, index) => (
                                        <span key={`${service}-${index}`} className="service-chip">
                                            {service}
                                        </span>
                                    ))
                                ) : (
                                    <span className="service-chip muted">Services TBD</span>
                                )}
                            </div>

                            <div className="insight-meta">
                                <span>{apt.staff || "Unassigned"}</span>
                                <span>{formatCurrency(apt.totalPayment)}</span>
                            </div>

                            <div className="insight-payments">
                                <span className={`payment-chip ${apt.payment === "Paid" ? "is-paid" : "is-pending"}`}>
                                    {apt.payment || "Pending"}
                                </span>
                                <span className={`payment-chip ${apt.paymentChecked === "Yes" ? "is-paid" : "is-pending"}`}>
                                    {apt.paymentChecked === "Yes" ? "Payment checked" : "Payment pending"}
                                </span>
                            </div>

                            {!arrived && appointmentId && onMarkArrived && (
                                <button className="insight-action" onClick={() => onMarkArrived(appointmentId)}>
                                    Mark as Arrived
                                </button>
                            )}
                        </article>
                    );
                })}
            </div>
        );
    };

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="insight-loader">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                </div>
            );
        }

        if (currentView === "calendar") {
            return (
                <div className="insight-calendar-placeholder">
                    <p>Use the calendar below to browse bookings by month.</p>
                </div>
            );
        }

        if (currentView === "today") {
            return renderAppointmentCards(todayAppointments);
        }

        return renderAppointmentCards(orderedAppointments);
    };

    return (
        <section className="insights-shell">
            <div className="insights-top">
                <div>
                    <p className="insights-eyebrow">Front Desk Snapshot</p>
                    <h2>Today's flow</h2>
                </div>
                <p className="insights-date">{formatLongDate(new Date())}</p>
            </div>

            <div className="insight-stats">
                <article className="stat-card">
                    <p>Today's Appointments</p>
                    <strong>{todayAppointments.length}</strong>
                </article>
                <article className="stat-card">
                    <p>Arrived</p>
                    <strong>{arrivedCount}</strong>
                </article>
                <article className="stat-card">
                    <p>Waiting</p>
                    <strong>{waitingCount}</strong>
                </article>
                <article className="stat-card accent">
                    <p>Today's Revenue</p>
                    <strong>{formatCurrency(todayRevenue)}</strong>
                </article>
            </div>

            <div className="insight-search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="text"
                    placeholder="Search by customer, email, staff, or service"
                />
            </div>

            <div className="insight-tabs">
                <button className={currentView === "today" ? "active" : ""} onClick={() => handleViewChange("today")}>
                    Today's Appointments
                </button>
                <button className={currentView === "calendar" ? "active" : ""} onClick={() => handleViewChange("calendar")}>
                    Calendar View
                </button>
                <button className={currentView === "all" ? "active" : ""} onClick={() => handleViewChange("all")}>
                    All Appointments
                </button>
            </div>

            {renderTabContent()}
        </section>
    );
}
