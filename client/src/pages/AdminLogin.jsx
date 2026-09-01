import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminLogin() {
    const navigate = useNavigate();
    const { adminLogin } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await api.adminLogin(formData);
            adminLogin(data.token, data.admin);
            navigate("/admin");
        } catch (err) {
            setError(err.message || "Invalid administrator credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
            }}>
                <div className="glass-card" style={{
                    maxWidth: "460px",
                    width: "100%",
                    padding: "40px",
                    border: "1px solid rgba(255, 71, 87, 0.3)",
                    boxShadow: "0 0 35px rgba(255, 71, 87, 0.15)",
                }}>
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{
                            width: "56px",
                            height: "56px",
                            margin: "0 auto 16px",
                            borderRadius: "14px",
                            background: "#ffffff",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 20px rgba(255, 71, 87, 0.3)",
                            overflow: "hidden",
                        }}>
                            <img src="/vts-logo.png" alt="IEEE VTS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: "700",
                            letterSpacing: "0.08em",
                            background: "rgba(255, 71, 87, 0.15)",
                            border: "1px solid rgba(255, 71, 87, 0.4)",
                            color: "#ff6b81",
                            textTransform: "uppercase",
                            marginBottom: "10px",
                        }}>
                            🛡️ RESTRICTED ACCESS
                        </span>
                        <h2 style={{ fontSize: "28px", marginTop: "6px" }}>
                            Admin Console Login
                        </h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Authorized competition evaluators & staff only
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: "rgba(244, 63, 94, 0.15)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            color: "#fb7185",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginBottom: "20px",
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                Admin Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="admin@vts.org"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                Admin Master Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                background: "linear-gradient(135deg, #ff4757 0%, #c23616 100%)",
                                color: "#ffffff",
                                fontFamily: "var(--font-heading)",
                                fontWeight: "700",
                                fontSize: "15px",
                                padding: "14px",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                cursor: "pointer",
                                boxShadow: "0 4px 20px rgba(255, 71, 87, 0.3)",
                                width: "100%",
                                marginTop: "8px",
                            }}
                            disabled={loading}
                        >
                            {loading ? "AUTHENTICATING..." : "ACCESS ADMIN CONSOLE →"}
                        </button>
                    </form>

                    <div style={{
                        marginTop: "24px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        paddingTop: "20px",
                    }}>
                        Are you a participant?{" "}
                        <Link to="/login" style={{ fontWeight: "700", color: "var(--primary)" }}>
                            Participant Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;
