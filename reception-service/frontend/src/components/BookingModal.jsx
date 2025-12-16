import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { createBooking, updateBooking } from "../services/bookingService";

Modal.setAppElement("#root");

export default function BookingModal({ open, close, booking }) {
  const [form, setForm] = useState({ customerName:"", services:[], date:"", time:"", staff:"", paymentStatus:"PENDING", status:"NEW" });

  useEffect(() => {
    if (booking) {
      setForm({
        customerName: booking.customerName || "",
        services: booking.services || [],
        date: booking.date || "",
        time: booking.time || "",
        staff: booking.staff || "",
        paymentStatus: booking.paymentStatus || "PENDING",
        status: booking.status || "NEW"
      });
    } else {
      setForm({ customerName:"", services:[], date:"", time:"", staff:"", paymentStatus:"PENDING", status:"NEW" });
    }
  }, [booking, open]);

  const onChange = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, services: Array.isArray(form.services) ? form.services : form.services.split(",").map(s=>s.trim()) };
    if (booking && booking.id) {
      updateBooking(booking.id, payload).then(()=>close());
    } else {
      createBooking(payload).then(()=>close());
    }
  };

  return (
    <Modal isOpen={open} onRequestClose={close} className="modal" overlayClassName="overlay">
      <h2>{booking ? "Edit booking" : "New booking"}</h2>
      <form onSubmit={submit} className="modal-form">
        <input placeholder="Customer name" value={form.customerName} onChange={e=>onChange("customerName", e.target.value)} required />
        <input placeholder="Services (comma separated)" value={Array.isArray(form.services) ? form.services.join(", ") : form.services} onChange={e=>onChange("services", e.target.value)} />
        <input type="date" value={form.date} onChange={e=>onChange("date", e.target.value)} required />
        <input type="time" value={form.time} onChange={e=>onChange("time", e.target.value)} required />
        <input placeholder="Staff" value={form.staff} onChange={e=>onChange("staff", e.target.value)} />
        <div className="modal-actions">
          <button className="btn-primary" type="submit">Save</button>
          <button className="btn-secondary" type="button" onClick={close}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
