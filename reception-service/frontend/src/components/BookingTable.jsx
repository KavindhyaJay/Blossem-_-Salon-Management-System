import React from "react";
import { markPaid, markReady, deleteBooking, assignStaff } from "../services/bookingService";

export default function BookingTable({ bookings, refresh, onEdit }) {
  const doDelete = (id) => {
    if (!window.confirm("Delete booking?")) return;
    deleteBooking(id).then(()=>refresh());
  };

  const doMarkPaid = (id) => markPaid(id).then(()=>refresh());
  const doMarkReady = (id) => markReady(id).then(()=>refresh());
  const doAssign = (id) => {
    const staff = prompt("Assign staff name:");
    if (staff) assignStaff(id, staff).then(()=>refresh());
  };

  return (
    <table className="booking-table">
      <thead>
        <tr><th>Customer</th><th>Services</th><th>Date</th><th>Time</th><th>Staff</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {bookings.map(b => (
          <tr key={b.id}>
            <td>{b.customerName}</td>
            <td>{Array.isArray(b.services) ? b.services.join(", ") : b.services}</td>
            <td>{b.date}</td>
            <td>{b.time}</td>
            <td>{b.staff || "-"}</td>
            <td>{b.paymentStatus}</td>
            <td>{b.status}</td>
            <td className="actions">
              <button onClick={()=>onEdit(b)} className="btn-small">Edit</button>
              <button onClick={()=>doMarkPaid(b.id)} className="btn-small">Paid</button>
              <button onClick={()=>doMarkReady(b.id)} className="btn-small">Ready</button>
              <button onClick={()=>doAssign(b.id)} className="btn-small">Assign</button>
              <button onClick={()=>doDelete(b.id)} className="btn-small danger">Del</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
