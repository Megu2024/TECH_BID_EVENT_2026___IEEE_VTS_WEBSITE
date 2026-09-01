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
            background: "rgba(7, 10, 18, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.09)",
            padding: "16px 32px",
        }}>
            <div style={{
                maxWidth: "1400px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "24px",
            }}>
                {/* Logo & Event Brand */}
                <Link to="/" style={{ display: "flex", alignItems: "center", gap: "14px", textDecoration: "none" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "3.5px",
                        boxShadow: "0 0 20px rgba(0, 110, 255, 0.4)",
                        overflow: "hidden",
                        flexShrink: 0,
                    }}>
                        <img src="/vts-logo.png" alt="IEEE VTS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: "19px", fontWeight: "900", letterSpacing: "-0.01em", color: "#fff" }}>
                            TECH BID <span style={{ color: "var(--primary)" }}>2026</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: "600" }}>
                            IEEE VTS Student Chapter VIT Chennai
                        </div>
                    </div>
                </Link>

                {/* Nav Links */}
                <nav style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Link
                        to="/"
                        style={{
                            padding: "9px 16px",
                            borderRadius: "10px",
                            fontSize: "15.5px",
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
                            padding: "9px 16px",
                            borderRadius: "10px",
                            fontSize: "15.5px",
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
                                    padding: "9px 16px",
                                    borderRadius: "10px",
                                    fontSize: "15.5px",
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
                                    padding: "9px 16px",
                                    borderRadius: "10px",
                                    fontSize: "15.5px",
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

                    <Link
                        to="/leaderboard"
                        style={{
                            padding: "9px 16px",
                            borderRadius: "10px",
                            fontSize: "15.5px",
                            fontWeight: "700",
                            color: isActive("/leaderboard") ? "var(--accent-gold)" : "var(--text-muted)",
                            background: isActive("/leaderboard") ? "rgba(255, 215, 0, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
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
                                    padding: "9px 16px",
                                    borderRadius: "10px",
                                    fontSize: "15.5px",
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
                                    padding: "9px 18px",
                                    borderRadius: "10px",
                                    fontSize: "15.5px",
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
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {user && !isAdmin && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                        }}>
                            {/* Live Tech Coins Badge */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "rgba(255, 215, 0, 0.14)",
                                border: "1px solid rgba(255, 215, 0, 0.4)",
                                padding: "8px 18px",
                                borderRadius: "9999px",
                                color: "#ffd700",
                                fontWeight: "800",
                                fontSize: "15.5px",
                                boxShadow: "0 0 18px rgba(255, 215, 0, 0.18)",
                            }}>
                                <span>🪙</span>
                                <span>{team ? team.techCoins : 0}</span>
                                <span style={{ fontSize: "12px", opacity: 0.85, textTransform: "uppercase" }}>Coins</span>
                            </div>

                            {/* User details */}
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "14.5px", fontWeight: "700", color: "#fff" }}>
                                    {user.name}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <span className="badge badge-purple" style={{ fontSize: "13.5px", padding: "8px 16px", fontWeight: "700" }}>
                            🛡️ Administrator
                        </span>
                    )}

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="btn-secondary"
                            style={{ padding: "9px 20px", fontSize: "14.5px", fontWeight: "700" }}
                        >
                            Logout
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                                to="/login"
                                className="btn-secondary"
                                style={{ padding: "9px 20px", fontSize: "14.5px", fontWeight: "700" }}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary"
                                style={{ padding: "9px 22px", fontSize: "14.5px", fontWeight: "800" }}
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
