import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, team, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const closeMobile = () => setMobileMenuOpen(false);

    return (
        <header style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(7, 10, 18, 0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.09)",
            padding: "12px 24px",
        }}>
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
            }}>
                {/* Logo & Event Brand */}
                <Link to="/" onClick={closeMobile} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                    <div style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "10px",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "3px",
                        boxShadow: "0 0 20px rgba(0, 110, 255, 0.4)",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}>
                        <img src="/vts-logo.png" alt="IEEE VTS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: "17px", fontWeight: "900", letterSpacing: "-0.01em", color: "#fff" }}>
                            TECH BID <span style={{ color: "var(--primary)" }}>2026</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "600" }}>
                            IEEE VTS Student Chapter
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Link
                        to="/"
                        style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "14.5px",
                            fontWeight: "700",
                            color: isActive("/") ? "var(--primary)" : "var(--text-muted)",
                            background: isActive("/") ? "rgba(0, 240, 255, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
                        }}
                    >
                        Home
                    </Link>

                    <Link
                        to="/event-info"
                        style={{
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "14.5px",
                            fontWeight: "700",
                            color: isActive("/event-info") ? "var(--primary)" : "var(--text-muted)",
                            background: isActive("/event-info") ? "rgba(0, 240, 255, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
                        }}
                    >
                        Event Guide
                    </Link>

                    {user && !isAdmin && (
                        <>
                            <Link
                                to="/dashboard"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    fontSize: "14.5px",
                                    fontWeight: "700",
                                    color: isActive("/dashboard") ? "var(--primary)" : "var(--text-muted)",
                                    background: isActive("/dashboard") ? "rgba(0, 240, 255, 0.1)" : "transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/team"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    fontSize: "14.5px",
                                    fontWeight: "700",
                                    color: isActive("/team") ? "var(--primary)" : "var(--text-muted)",
                                    background: isActive("/team") ? "rgba(0, 240, 255, 0.1)" : "transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Team
                            </Link>
                        </>
                    )}

                    {user && (
                        <Link
                            to="/leaderboard"
                            style={{
                                padding: "8px 14px",
                                borderRadius: "10px",
                                fontSize: "14.5px",
                                fontWeight: "700",
                                color: isActive("/leaderboard") ? "var(--accent-gold)" : "var(--text-muted)",
                                background: isActive("/leaderboard") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                                transition: "all 0.2s ease",
                            }}
                        >
                            Leaderboard
                        </Link>
                    )}

                    {isAdmin && (
                        <>
                            <Link
                                to="/projector"
                                target="_blank"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "10px",
                                    fontSize: "14.5px",
                                    fontWeight: "700",
                                    color: isActive("/projector") ? "#c084fc" : "var(--text-muted)",
                                    background: isActive("/projector") ? "rgba(192, 132, 252, 0.1)" : "transparent",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                📽️ Projector
                            </Link>

                            <Link
                                to="/admin"
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    fontSize: "14.5px",
                                    fontWeight: "800",
                                    color: "#ff4757",
                                    background: isActive("/admin") ? "rgba(255, 71, 87, 0.18)" : "rgba(255, 71, 87, 0.09)",
                                    border: "1px solid rgba(255, 71, 87, 0.35)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Admin Console
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Side Status & Auth */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {user && !isAdmin && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(255, 215, 0, 0.14)",
                            border: "1px solid rgba(255, 215, 0, 0.4)",
                            padding: "6px 14px",
                            borderRadius: "9999px",
                            color: "#ffd700",
                            fontWeight: "800",
                            fontSize: "14px",
                        }}>
                            <span>🪙</span>
                            <span>{team ? team.techCoins : 0}</span>
                        </div>
                    )}

                    {isAdmin && (
                        <span className="badge badge-purple desktop-only" style={{ fontSize: "12px", padding: "6px 12px", fontWeight: "700" }}>
                            🛡️ Admin
                        </span>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="btn-secondary desktop-only"
                            style={{ padding: "8px 16px", fontSize: "13.5px", fontWeight: "700" }}
                        >
                            Logout
                        </button>
                    ) : (
                        <div className="desktop-only" style={{ display: "flex", gap: "8px" }}>
                            <Link
                                to="/login"
                                className="btn-secondary"
                                style={{ padding: "8px 16px", fontSize: "13.5px", fontWeight: "700" }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary"
                                style={{ padding: "8px 18px", fontSize: "13.5px", fontWeight: "800" }}
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Hamburger Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="mobile-menu-btn"
                        style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            color: "#fff",
                            fontSize: "18px",
                            cursor: "pointer",
                            display: "none",
                        }}
                    >
                        {mobileMenuOpen ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Drawer */}
            {mobileMenuOpen && (
                <div style={{
                    marginTop: "14px",
                    padding: "16px",
                    background: "rgba(10, 15, 30, 0.98)",
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}>
                    <Link to="/" onClick={closeMobile} style={{ padding: "10px 14px", color: "#fff", fontWeight: "700", textDecoration: "none" }}>
                        🏠 Home
                    </Link>
                    <Link to="/event-info" onClick={closeMobile} style={{ padding: "10px 14px", color: "#fff", fontWeight: "700", textDecoration: "none" }}>
                        📖 Event Guide
                    </Link>
                    {user && !isAdmin && (
                        <>
                            <Link to="/dashboard" onClick={closeMobile} style={{ padding: "10px 14px", color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
                                📊 Dashboard
                            </Link>
                            <Link to="/team" onClick={closeMobile} style={{ padding: "10px 14px", color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
                                👥 Team
                            </Link>
                        </>
                    )}
                    {user && (
                        <Link to="/leaderboard" onClick={closeMobile} style={{ padding: "10px 14px", color: "var(--accent-gold)", fontWeight: "700", textDecoration: "none" }}>
                            🏆 Leaderboard
                        </Link>
                    )}
                    {isAdmin && (
                        <>
                            <Link to="/projector" target="_blank" onClick={closeMobile} style={{ padding: "10px 14px", color: "#c084fc", fontWeight: "700", textDecoration: "none" }}>
                                📽️ Projector View
                            </Link>
                            <Link to="/admin" onClick={closeMobile} style={{ padding: "10px 14px", color: "#ff4757", fontWeight: "800", textDecoration: "none" }}>
                                🛡️ Admin Console
                            </Link>
                        </>
                    )}
                    <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "10px", marginTop: "4px" }}>
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="btn-secondary"
                                style={{ width: "100%", padding: "10px", fontWeight: "700" }}
                            >
                                Logout ({user.name})
                            </button>
                        ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Link to="/login" onClick={closeMobile} className="btn-secondary" style={{ flex: 1, textAlign: "center", padding: "10px", fontWeight: "700" }}>
                                    Login
                                </Link>
                                <Link to="/register" onClick={closeMobile} className="btn-primary" style={{ flex: 1, textAlign: "center", padding: "10px", fontWeight: "800" }}>
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

export default Navbar;
