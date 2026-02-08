import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import { logout } from "../auth/auth";

function Dashboard() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        API.get("/bookings/customer/me")
            .then(res => setBookings(res.data))
            .catch(err => {
                console.error("Dashboard Error:", err);
                if (err.message === "Network Error") {
                    alert("Cannot connect to Backend. Please ensure Spring Boot is running on port 8081.");
                } else if (err.response?.status === 401) {
                    alert("Session expired. Please login again.");
                    logout();
                }
            });
    }, []);

    return (
        <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <div>
                    <h1 className="text-gold" style={{ fontSize: "32px", marginBottom: "5px" }}>Dashboard</h1>
                    <p style={{ color: "var(--text-secondary)" }}>Manage your salon appointments and payments</p>
                </div>
                <Link to="/booking" className="premium-button" style={{ width: "auto", padding: "12px 24px" }}>
                    + Book Appointment
                </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "25px", marginBottom: "40px" }}>
                <div className="premium-card" style={{ textAlign: "center", padding: "30px" }}>
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>Total Bookings</h3>
                    <h1 style={{ fontSize: "48px", margin: 0 }}>{bookings.length}</h1>
                </div>
                <div className="premium-card" style={{ textAlign: "center", padding: "30px", borderLeft: "4px solid var(--accent-red)" }}>
                    <h3 style={{ color: "var(--text-secondary)", marginBottom: "10px" }}>Payment Status</h3>
                    <p style={{ fontSize: "20px", margin: 0 }}>
                        <span className="text-red">{bookings.filter(b => b.payment && b.payment.toUpperCase() !== "PAID").length} Pending</span>
                        <span style={{ margin: "0 10px", opacity: 0.3 }}>|</span>
                        <span style={{ color: "#00c853" }}>{bookings.filter(b => b.payment && b.payment.toUpperCase() === "PAID").length} Paid</span>
                    </p>
                </div>
            </div>

            <h2 className="text-gold" style={{ marginBottom: "25px" }}>My Bookings</h2>
            <div style={{ display: "grid", gap: "20px" }}>
                {bookings.length === 0 ? (
                    <div className="premium-card" style={{ textAlign: "center" }}>
                        <p style={{ opacity: 0.5 }}>No bookings found.</p>
                    </div>
                ) : (
                    bookings.map(b => (
                        <div key={b.id} className="premium-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "25px" }}>
                            <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                                <div style={{ background: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", textAlign: "center", minWidth: "80px" }}>
                                    <div className="text-red" style={{ fontWeight: "600", fontSize: "14px" }}>{b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'N/A'}</div>
                                    <div style={{ fontSize: "24px", fontWeight: "600" }}>{b.date ? new Date(b.date).getDate() : '-'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "5px" }}>{Array.isArray(b.services) ? b.services.join(", ") : "N/A"}</div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Time: <span style={{ color: "white" }}>{b.time}</span></div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Amount: <span style={{ color: "white" }}>LKR {b.totalPayment.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "3px" }}>STATUS</div>
                                    <div style={{
                                        color: b.payment && b.payment.toUpperCase() === "PAID" ? "#00c853" : "var(--accent-red)",
                                        fontWeight: "600",
                                        fontSize: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor" }}></div>
                                        {b.payment || "PENDING"}
                                    </div>
                                </div>
                                {(!b.payment || b.payment.toUpperCase() !== "PAID") && (
                                    <Link to={`/payment/${b.id}`} className="premium-button" style={{ padding: "10px 20px", fontSize: "13px", width: "auto" }}>
                                        Pay Now
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Dashboard;
