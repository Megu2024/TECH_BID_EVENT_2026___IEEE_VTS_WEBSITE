import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

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
            const data = await api.login(formData);
            login(data.token, data.user);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Invalid login credentials");
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
                            boxShadow: "0 0 20px rgba(0, 240, 255, 0.3)",
                            overflow: "hidden",
                        }}>
                            <img src="/vts-logo.png" alt="IEEE VTS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>
                            PARTICIPANT PORTAL
                        </span>
                        <h2 style={{ fontSize: "28px", marginTop: "6px" }}>
                            Login to Your Team
                        </h2>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                            Enter your competition account credentials
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
                                Registered Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@domain.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                Password
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
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: "100%", padding: "14px", marginTop: "8px" }}
                        >
                            {loading ? "LOGGING IN..." : "LOGIN TO DASHBOARD →"}
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
                        Don't have an account?{" "}
                        <Link to="/register" style={{ fontWeight: "700", color: "var(--primary)" }}>
                            Register now
                        </Link>
                    </div>

                    <div style={{ marginTop: "12px", textAlign: "center" }}>
                        <Link to="/admin/login" style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                            Administrator Login Portal →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;