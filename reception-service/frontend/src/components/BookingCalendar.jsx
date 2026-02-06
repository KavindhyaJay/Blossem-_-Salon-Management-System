import React, { useEffect, useMemo, useState } from "react";
import "./BookingCalendar.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

const isSameDay = (a, b) => {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const formatMonthLabel = (value) => {
  return value.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export default function BookingCalendar({ bookings = [], selectedDate, onDateClick, onMonthChange }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const base = selectedDate || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    const normalized = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    setCurrentMonth((prev) => {
      const sameMonth =
        prev.getFullYear() === normalized.getFullYear() &&
        prev.getMonth() === normalized.getMonth();
      if (!sameMonth) {
        onMonthChange?.(normalized);
        return normalized;
      }
      return prev;
    });
  }, [selectedDate, onMonthChange]);

  const appointmentMap = useMemo(() => {
    return bookings.reduce((acc, apt) => {
      const key = normalizeDateKey(apt.date);
      if (!key) {
        return acc;
      }
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(apt);
      return acc;
    }, {});
  }, [bookings]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const days = [];
    for (let index = 0; index < 42; index += 1) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + index);
      const key = normalizeDateKey(dayDate);
      const list = key ? appointmentMap[key] || [] : [];
      const arrived = list.filter((item) => item.customerArrived === "Yes").length;
      const waiting = list.length - arrived;

      days.push({
        date: dayDate,
        key,
        inMonth: dayDate.getMonth() === currentMonth.getMonth(),
        appointments: list,
        arrived,
        waiting,
      });
    }

    return Array.from({ length: 6 }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7));
  }, [currentMonth, appointmentMap]);

  const handleSelect = (day) => {
    const isDifferentMonth =
      day.date.getFullYear() !== currentMonth.getFullYear() ||
      day.date.getMonth() !== currentMonth.getMonth();
    if (isDifferentMonth) {
      const normalized = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
      setCurrentMonth(normalized);
      onMonthChange?.(normalized);
    }
    onDateClick?.(day.date);
  };

  const handleNavigate = (direction) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      onMonthChange?.(next);
      return next;
    });
  };

  const handleToday = () => {
    const today = new Date();
    const normalized = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(normalized);
    onMonthChange?.(normalized);
    onDateClick?.(today);
  };

  const selectedKey = normalizeDateKey(selectedDate);
  const today = new Date();

  return (
    <div className="booking-calendar">
      <div className="calendar-toolbar">
        <div>
          <p className="calendar-month-label">{formatMonthLabel(currentMonth)}</p>
          <p className="calendar-subtext">Tap a day to preview who is coming in.</p>
        </div>
        <div className="calendar-toolbar__actions">
          <button className="calendar-chip" type="button" onClick={handleToday}>
            Today
          </button>
          <div className="calendar-nav">
            <button type="button" aria-label="Previous month" onClick={() => handleNavigate(-1)}>
              ‹
            </button>
            <button type="button" aria-label="Next month" onClick={() => handleNavigate(1)}>
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={`week-${weekIndex}`}>
            {week.map((day) => {
              const isSelected = day.key && day.key === selectedKey;
              const isToday = isSameDay(day.date, today);
              const hasAppointments = day.appointments.length > 0;
              const label = day.appointments.length === 1 ? "1 apt" : `${day.appointments.length} apts`;

              return (
                <button
                  key={day.key || day.date.toISOString()}
                  type="button"
                  className={`calendar-cell${day.inMonth ? "" : " is-dim"}${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}`}
                  onClick={() => handleSelect(day)}
                >
                  <span className="calendar-date-number">{day.date.getDate()}</span>
                  {hasAppointments && (
                    <>
                      <span className="calendar-apt-count">{label}</span>
                      <div className="calendar-dot-row">
                        {day.arrived > 0 && <span className="calendar-dot arrived" />}
                        {day.waiting > 0 && <span className="calendar-dot waiting" />}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="calendar-legend">
        <span><span className="calendar-dot arrived" /> Arrived</span>
        <span><span className="calendar-dot waiting" /> Not Arrived</span>
        <span><span className="calendar-today-indicator" /> Today</span>
      </div>
    </div>
  );
}
