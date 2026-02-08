import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout, isLoggedIn } from "../auth/auth";

function Navbar() {
    const navigate = useNavigate();
    const isAuth = isLoggedIn();

    return (
        <nav style={{
            padding: "20px 40px",
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--glass-border)",
            position: "sticky",
            top: 0,
            zIndex: 1000
        }}>
            <Link to="/" style={{ textDecoration: "none" }}>
                <h2 className="text-red" style={{ margin: 0, fontSize: "24px" }}>Salon <span className="text-gold">Blossem</span></h2>
            </Link>

            <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                {isAuth ? (
                    <>
                        <Link to="/dashboard" className="premium-link" style={{ fontWeight: "600" }}>Dashboard</Link>
                        <button
                            className="premium-button secondary"
                            style={{ width: "auto", padding: "8px 20px", fontSize: "14px" }}
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="premium-link">Login</Link>
                        <Link to="/register" className="premium-button" style={{ width: "auto", padding: "8px 20px", fontSize: "14px", textDecoration: "none" }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
