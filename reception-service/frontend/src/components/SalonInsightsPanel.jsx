import React, { useMemo } from "react";
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
        const formatted = new Intl.NumberFormat("en-LK", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numeric);
        return `LKR ${formatted}`;
    }
    return "LKR 0";
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

export default function SalonInsightsPanel({ appointments = [], loading = false, selectedDate = null }) {
    const realTodayKey = normalizeDateKey(new Date());
    const activeDate = selectedDate || new Date();
    const activeKey = normalizeDateKey(activeDate) || realTodayKey;

    const dailyAppointments = useMemo(
        () => appointments.filter((apt) => normalizeDateKey(apt.date) === activeKey),
        [appointments, activeKey]
    );

    const arrivedCount = dailyAppointments.filter((apt) => apt.customerArrived === "Yes").length;
    const waitingCount = Math.max(dailyAppointments.length - arrivedCount, 0);
    const dailyRevenue = dailyAppointments.reduce((sum, apt) => sum + (Number(apt.totalPayment) || 0), 0);
    const showingRealToday = activeKey === realTodayKey;
    const revenueLabel = showingRealToday ? "Today's Revenue" : "Selected Day Revenue";
    const flowLabel = showingRealToday ? "Today's flow" : "Selected day flow";
    const dateLabel = formatLongDate(activeDate);

    return (
        <section className="insights-shell">
            <div className="insights-top">
                <div>
                    <p className="insights-eyebrow">Front Desk Snapshot</p>
                    <h2>{flowLabel}</h2>
                </div>
                <p className="insights-date">{dateLabel}</p>
            </div>

            <div className="insight-stats">
                <article className="stat-card">
                    <p>{showingRealToday ? "Today's Appointments" : "Selected Day Appointments"}</p>
                    <strong>{dailyAppointments.length}</strong>
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
                    <p>{revenueLabel}</p>
                    <strong>{formatCurrency(dailyRevenue)}</strong>
                </article>
            </div>

            <div className="insight-calendar-placeholder">
                {loading ? (
                    <div className="insight-loader">
                        <div className="dot" />
                        <div className="dot" />
                        <div className="dot" />
                    </div>
                ) : (
                    <p>Use the calendar below to explore and manage bookings for specific dates.</p>
                )}
            </div>
        </section>
    );
}
