import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/api";

function Payment() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [hash, setHash] = useState("");

    useEffect(() => {
        // Fetch booking details
        API.get(`/bookings/${id}`)
            .then(res => {
                setBooking(res.data);
                return API.get(`/payments/hash/${id}`); // Fetch hash from backend
            })
            .then(res => setHash(res.data))
            .catch(err => {
                console.error("Payment Page Error:", err);
                if (err.message === "Network Error") {
                    alert("Cannot connect to Backend. Please ensure Spring Boot is running on port 8081.");
                } else {
                    alert("Failed to load booking details. Please try again.");
                }
            });
    }, [id]);

    const payNow = () => {
        if (!booking || !hash) {
            alert("Payment information not ready. Please wait...");
            return;
        }

        if (hash === "error") {
            alert("Failed to generate payment hash. Please contact support.");
            return;
        }

        const paymentData = {
            sandbox: true,
            merchant_id: "1233947", // Replace with your Merchant ID
            return_url: "http://localhost:3000/dashboard",
            cancel_url: "http://localhost:3000/dashboard",
            notify_url: "http://localhost:8081/payments/notify",
            order_id: id,
            items: `Services: ${Array.isArray(booking.services) ? booking.services.join(", ") : "N/A"}`,
            amount: booking.totalPayment.toFixed(2), // Ensure 2 decimal places
            currency: "LKR",
            first_name: "Customer",
            last_name: "Name",
            email: booking.email,
            phone: "0771234567",
            address: "No.1, Galle Road",
            city: "Colombo",
            country: "Sri Lanka",
            hash: hash, // Computed hash from backend
        };

        // PayHere payment callbacks
        window.payhere.onCompleted = function onCompleted(orderId) {
            console.log("Payment completed. OrderID:" + orderId);
            alert("Payment successful! Redirecting to dashboard...");
            window.location.href = "/dashboard";
        };

        window.payhere.onDismissed = function onDismissed() {
            console.log("Payment dismissed");
            alert("Payment was cancelled.");
        };

        window.payhere.onError = function onError(error) {
            console.log("Payment error:" + error);
            alert("Payment failed: " + error);
        };

        if (window.payhere) {
            window.payhere.startPayment(paymentData);
        } else {
            alert("PayHere SDK not loaded. Please refresh the page.");
            console.error("PayHere SDK not loaded");
        }
    };

    if (!booking) return <div>Loading...</div>;

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "20px" }}>
            <div className="premium-card" style={{ width: "100%", maxWidth: "500px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div className="text-gold" style={{ fontSize: "14px", fontWeight: "600", letterSpacing: "2px", marginBottom: "10px" }}>SECURE CHECKOUT</div>
                    <h2 style={{ fontSize: "28px" }}>Complete Payment</h2>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "25px", borderRadius: "15px", marginBottom: "30px", border: "1px solid var(--glass-border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Services</span>
                        <span style={{ fontWeight: "600", textAlign: "right", maxWidth: "200px" }}>{Array.isArray(booking.services) ? booking.services.join(", ") : "N/A"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Booking ID</span>
                        <span style={{ fontFamily: "monospace", fontSize: "14px" }}>#{id.substring(0, 8)}...</span>
                    </div>
                    <div style={{ height: "1px", background: "var(--glass-border)", margin: "15px 0" }}></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ color: "var(--text-secondary)", fontWeight: "600" }}>Total Amount</span>
                        <span className="text-gold" style={{ fontSize: "24px", fontWeight: "600" }}>LKR {booking.totalPayment.toFixed(2)}</span>
                    </div>
                </div>

                <button className="premium-button" style={{ marginBottom: "20px" }} onClick={payNow}>
                    Confirm & Pay Now
                </button>

                <div style={{ textAlign: "center" }}>
                    <Link to="/dashboard" className="premium-link" style={{ fontSize: "14px", opacity: 0.7 }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "20px", opacity: 0.4 }}>
                    <span style={{ fontSize: "10px" }}>Verified by PayHere</span>
                    <span style={{ fontSize: "10px" }}>SSL Secure</span>
                </div>
            </div>
        </div>
    );
}

export default Payment;
