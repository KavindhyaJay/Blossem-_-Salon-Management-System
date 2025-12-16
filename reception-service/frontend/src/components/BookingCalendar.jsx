import React, { useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, startOfWeek, getDay, format } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": require("date-fns/locale/en-US") };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (date)=>startOfWeek(date), getDay, locales });

export default function BookingCalendar({ bookings = [], onDateClick }) {
  const events = useMemo(() => bookings.map(b => {
    // attempt to parse date+time -> start/end
    const start = new Date(`${b.date}T${b.time || "09:00"}`);
    const end = new Date(start.getTime() + (60 * 60 * 1000)); // 1 hour default
    return { id: b.id, title: `${b.customerName} (${Array.isArray(b.services)?b.services.join(", "):b.services})`, start, end, allDay:false };
  }), [bookings]);

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={(slotInfo)=>onDateClick(slotInfo.start)}
        selectable
        onSelectEvent={(e) => onDateClick(e.start)}
        views={["month","week","day"]}
      />
    </div>
  );
}
