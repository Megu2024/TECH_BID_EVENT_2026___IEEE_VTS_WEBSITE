import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, team, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "rgba(7, 10, 18, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "14px 28px",
        }}>
            <div style={{
                maxWidth: "1350px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
            }}>
                {/* Logo & Event Brand */}
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
                    <div style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #00f0ff 0%, #7000ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#000",
                        boxShadow: "0 0 15px rgba(0, 240, 255, 0.4)",
                    }}>
                        ⚡
                    </div>
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "-0.01em", color: "#fff" }}>
                            TECH BID EVENT <span style={{ color: "var(--primary)" }}>2026</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            IEEE VTS Student Branch Chapter
                        </div>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link
                        to="/"
                        style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: isActive("/") ? "var(--primary)" : "var(--text-muted)",
                            background: isActive("/") ? "rgba(0, 240, 255, 0.08)" : "transparent",
                        }}
                    >
                        Home
                    </Link>

                    <Link
                        to="/event-info"
                        style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: isActive("/event-info") ? "var(--primary)" : "var(--text-muted)",
                            background: isActive("/event-info") ? "rgba(0, 240, 255, 0.08)" : "transparent",
                        }}
                    >
                        Event & Rounds
                    </Link>

                    {user && !isAdmin && (
                        <>
                            <Link
                                to="/dashboard"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: isActive("/dashboard") ? "var(--primary)" : "var(--text-muted)",
                                    background: isActive("/dashboard") ? "rgba(0, 240, 255, 0.08)" : "transparent",
                                }}
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/team"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: isActive("/team") ? "var(--primary)" : "var(--text-muted)",
                                    background: isActive("/team") ? "rgba(0, 240, 255, 0.08)" : "transparent",
                                }}
                            >
                                Team
                            </Link>
                        </>
                    )}

                    <Link
                        to="/leaderboard"
                        style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: isActive("/leaderboard") ? "var(--accent-gold)" : "var(--text-muted)",
                            background: isActive("/leaderboard") ? "rgba(255, 215, 0, 0.08)" : "transparent",
                        }}
                    >
                        Leaderboard
                    </Link>

                    {isAdmin && (
                        <>
                            <Link
                                to="/projector"
                                target="_blank"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: isActive("/projector") ? "#c084fc" : "var(--text-muted)",
                                    background: isActive("/projector") ? "rgba(192, 132, 252, 0.08)" : "transparent",
                                }}
                            >
                                📽️ Projector
                            </Link>

                            <Link
                                to="/admin"
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    color: "#ff4757",
                                    background: isActive("/admin") ? "rgba(255, 71, 87, 0.15)" : "rgba(255, 71, 87, 0.08)",
                                    border: "1px solid rgba(255, 71, 87, 0.3)",
                                }}
                            >
                                Admin Console
                            </Link>
                        </>
                    )}
                </nav>

                {/* Right Side Status & Auth */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    {user && !isAdmin && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}>
                            {/* Live Tech Coins Badge */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "rgba(255, 215, 0, 0.12)",
                                border: "1px solid rgba(255, 215, 0, 0.35)",
                                padding: "6px 14px",
                                borderRadius: "9999px",
                                color: "#ffd700",
                                fontWeight: "700",
                                fontSize: "14px",
                                boxShadow: "0 0 15px rgba(255, 215, 0, 0.15)",
                            }}>
                                <span>🪙</span>
                                <span>{team ? team.techCoins : 0}</span>
                                <span style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>Coins</span>
                            </div>

                            {/* User details */}
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <span className="badge badge-purple" style={{ fontSize: "12px", padding: "6px 12px" }}>
                            🛡️ Administrator
                        </span>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="btn-secondary"
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                        >
                            Logout
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                                to="/login"
                                className="btn-secondary"
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary"
                                style={{ padding: "8px 16px", fontSize: "13px" }}
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Navbar;
