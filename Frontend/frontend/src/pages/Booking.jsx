import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Booking() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(false);

    const services = [
        { name: "Facial", price: 3500 },
        { name: "Professional Makeup", price: 5000 },
        { name: "Hair Styling", price: 2500 },
        { name: "Manicure", price: 1500 },
        { name: "Pedicure", price: 1500 },
        { name: "Hair Coloring", price: 4000 },
    ];

    useEffect(() => {
        API.get("/staff")
            .then(res => setStaff(res.data.filter(s => s.status === "Active")))
            .catch(err => console.error("Error fetching staff:", err));
    }, []);

    const toggleService = (service) => {
        if (selectedServices.find(s => s.name === service.name)) {
            setSelectedServices(selectedServices.filter(s => s.name !== service.name));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const calculateTotal = () => {
        return selectedServices.reduce((sum, s) => sum + s.price, 0);
    };

    const handleBooking = async () => {
        if (selectedServices.length === 0) {
            alert("Please select at least one service");
            return;
        }
        if (!selectedStaff) {
            alert("Please select a staff member");
            return;
        }
        if (!date || !time) {
            alert("Please select date and time");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const email = JSON.parse(atob(token.split('.')[1])).sub; // Extract email from JWT

            const staffMember = staff.find(s => s.email === selectedStaff);

            const bookingData = {
                email: email,
                services: selectedServices.map(s => s.name),
                date: date,
                time: time,
                staff: staffMember.name,
                staffEmail: staffMember.email,
                totalPayment: calculateTotal(),
                payment: "Unpaid"
            };

            const response = await API.post("/bookings", bookingData);
            alert("Booking created successfully!");
            navigate(`/payment/${response.data.id}`);
        } catch (err) {
            console.error("Booking error:", err);
            if (err.message === "Network Error") {
                alert("Cannot connect to backend. Please ensure the server is running.");
            } else {
                alert("Failed to create booking. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
            <h1 className="text-gold" style={{ marginBottom: "10px" }}>Book an Appointment</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Select services and schedule your visit</p>

            {/* Services Selection */}
            <div className="premium-card" style={{ marginBottom: "30px" }}>
                <h3 className="text-gold" style={{ marginBottom: "20px" }}>Select Services</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px" }}>
                    {services.map(service => (
                        <div
                            key={service.name}
                            onClick={() => toggleService(service)}
                            style={{
                                padding: "20px",
                                border: selectedServices.find(s => s.name === service.name)
                                    ? "2px solid var(--accent-gold)"
                                    : "1px solid var(--glass-border)",
                                borderRadius: "12px",
                                cursor: "pointer",
                                background: selectedServices.find(s => s.name === service.name)
                                    ? "rgba(212, 175, 55, 0.1)"
                                    : "rgba(255,255,255,0.03)",
                                transition: "all 0.3s ease"
                            }}
                        >
                            <div style={{ fontWeight: "600", marginBottom: "5px" }}>{service.name}</div>
                            <div className="text-gold">LKR {service.price.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff Selection */}
            <div className="premium-card" style={{ marginBottom: "30px" }}>
                <h3 className="text-gold" style={{ marginBottom: "20px" }}>Select Staff</h3>
                <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "15px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "16px"
                    }}
                >
                    <option value="">Choose a staff member...</option>
                    {staff.map(s => (
                        <option key={s.email} value={s.email}>
                            {s.name} - {s.specialization}
                        </option>
                    ))}
                </select>
            </div>

            {/* Date & Time */}
            <div className="premium-card" style={{ marginBottom: "30px" }}>
                <h3 className="text-gold" style={{ marginBottom: "20px" }}>Select Date & Time</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "10px", color: "var(--text-secondary)" }}>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            style={{
                                width: "100%",
                                padding: "15px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                color: "white",
                                fontSize: "16px"
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "10px", color: "var(--text-secondary)" }}>Time</label>
                        <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "15px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--glass-border)",
                                borderRadius: "8px",
                                color: "white",
                                fontSize: "16px"
                            }}
                        >
                            <option value="">Select time...</option>
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="premium-card" style={{ marginBottom: "30px", background: "rgba(212, 175, 55, 0.1)", border: "2px solid var(--accent-gold)" }}>
                <h3 className="text-gold" style={{ marginBottom: "15px" }}>Booking Summary</h3>
                <div style={{ marginBottom: "10px" }}>
                    <strong>Selected Services:</strong> {selectedServices.length > 0 ? selectedServices.map(s => s.name).join(", ") : "None"}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "600", marginTop: "15px" }}>
                    Total: <span className="text-gold">LKR {calculateTotal().toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "15px" }}>
                <button
                    className="premium-button"
                    onClick={handleBooking}
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    {loading ? "Processing..." : "Proceed to Payment"}
                </button>
                <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                        flex: 1,
                        padding: "15px",
                        background: "transparent",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "8px",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default Booking;
