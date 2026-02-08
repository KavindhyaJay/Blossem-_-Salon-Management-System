import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await API.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Login Error:", err);
            if (err.message === "Network Error") {
                alert("Cannot connect to Backend. Please ensure Spring Boot is running on port 8081.");
            } else {
                alert("Login failed. Check email/password.");
            }
        }
    };

    const testConnection = async () => {
        try {
            const res = await API.get("/auth/health");
            alert("Backend is reachable! Response: " + res.data);
        } catch (err) {
            if (err.response) {
                alert("Backend is reachable (got " + err.response.status + ")");
            } else {
                alert("Backend is NOT reachable. Ensure it's running on port 8081.");
            }
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="premium-card" style={{ width: "400px" }}>
                <h1 className="text-red" style={{ textAlign: "center", marginBottom: "30px" }}>Salon <span className="text-gold">Blossem</span></h1>
                <h2 style={{ marginBottom: "20px" }}>Login</h2>
                <input
                    className="premium-input"
                    placeholder="Email"
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    className="premium-input"
                    type="password"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                />
                <button className="premium-button" onClick={handleLogin}>Login</button>
                <button
                    style={{ background: "transparent", color: "var(--text-secondary)", border: "none", fontSize: "12px", marginTop: "10px", cursor: "pointer", textDecoration: "underline" }}
                    onClick={testConnection}
                >
                    Diagnostic: Test Connection
                </button>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Don't have an account? <Link to="/register" className="premium-link">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
