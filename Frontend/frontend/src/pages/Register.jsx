import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleRegister = async () => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            localStorage.setItem("token", res.data.token);
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Registration Error:", err);
            if (err.message === "Network Error") {
                alert("Cannot connect to Backend. Please ensure Spring Boot is running on port 8081.");
            } else {
                alert("Registration failed. Email might be already taken.");
            }
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="premium-card" style={{ width: "450px" }}>
                <h1 className="text-red" style={{ textAlign: "center", marginBottom: "30px" }}>Salon <span className="text-gold">Blossem</span></h1>
                <h2 style={{ marginBottom: "20px" }}>Register</h2>
                <input
                    className="premium-input"
                    placeholder="Name"
                    onChange={e => setName(e.target.value)}
                />
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
                <button className="premium-button" onClick={handleRegister}>Register</button>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Already have an account? <Link to="/login" className="premium-link">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
