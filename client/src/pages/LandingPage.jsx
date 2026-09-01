import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function LandingPage() {
    const { user, isAdmin } = useAuth();

    const pillars = [
        {
            icon: "⚡",
            title: "Tri-Game Speed Gauntlet",
            desc: "Rapid speed quizzes, 4-image technical deductions, and real-time syntax debugging against live 10-second countdown timers.",
            badge: "Round 1",
            color: "cyan",
        },
        {
            icon: "🎴",
            title: "Live Tech Card Auction",
            desc: "Tactical asset bidding for key hardware & software modules (LiDAR, BMS, Edge AI, GPS) using earned Tech Coins.",
            badge: "Round 2",
            color: "gold",
        },
        {
            icon: "🎯",
            title: "Arena Problem Matching",
            desc: "Stadium projector reveals real-world engineering problem statements to align with your acquired tech card stack.",
            badge: "Round 3",
            color: "purple",
        },
        {
            icon: "🔬",
            title: "Dual Hardware & Words Arena",
            desc: "Scramble technical terms against the 15s timer and compute 4-resistor color bands with live roaming judges.",
            badge: "Round 4",
            color: "cyan",
        },
        {
            icon: "👑",
            title: "Grand Auction & Jury Defense",
            desc: "High-stakes final auction to lock target problem statements, followed by jury defense and deterministic podium crowning.",
            badge: "Round 5",
            color: "gold",
        },
    ];

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* Grand Hero Section */}
            <section style={{
                position: "relative",
                padding: "100px 24px 80px",
                textAlign: "center",
                overflow: "hidden",
            }}>
                <div style={{ maxWidth: "980px", margin: "0 auto", position: "relative", zIndex: 2 }}>
                    
                    {/* Floating Header Badges */}
                    <div style={{ display: "inline-flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap", justifyContent: "center" }}>
                        <span className="badge badge-cyan">
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
                            IEEE VTS STUDENT BRANCH CHAPTER
                        </span>
                        <span className="badge badge-gold">ANNUAL FLAGSHIP 2026</span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(36px, 6vw, 68px)",
                        lineHeight: 1.12,
                        marginBottom: "24px",
                        fontWeight: "900",
                        letterSpacing: "-0.03em",
                    }}>
                        TECH BID & AUCTION <br />
                        <span className="gradient-text-cyan">COMPETITION 2026</span>
                    </h1>

                    <p style={{
                        fontSize: "clamp(16px, 2vw, 19px)",
                        color: "var(--text-muted)",
                        maxWidth: "720px",
                        margin: "0 auto 40px",
                        lineHeight: 1.65,
                    }}>
                        The premier technical arena where speed, engineering knowledge, tactical bidding, and system architecture converge into an unforgettable 5-round battle.
                    </p>

                    {/* Action CTAs */}
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "60px" }}>
                        {user ? (
                            <Link
                                to={isAdmin ? "/admin" : "/dashboard"}
                                className="btn-primary"
                                style={{ padding: "16px 36px", fontSize: "16px" }}
                            >
                                {isAdmin ? "Go to Admin Console →" : "Open Team Dashboard →"}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                    style={{ padding: "16px 36px", fontSize: "16px" }}
                                >
                                    Register Your Team →
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-secondary"
                                    style={{ padding: "16px 32px", fontSize: "16px" }}
                                >
                                    Team Login
                                </Link>
                            </>
                        )}
                        <Link
                            to="/leaderboard"
                            className="btn-gold"
                            style={{ padding: "16px 32px", fontSize: "16px" }}
                        >
                            🏆 Live Standings
                        </Link>
                    </div>

                    {/* Stats Metrics Ribbon */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "16px",
                        maxWidth: "880px",
                        margin: "0 auto",
                    }}>
                        {[
                            { label: "Competition Stages", value: "5 Rounds", color: "var(--primary)" },
                            { label: "Max Earnable Currency", value: "🪙 1,000+", color: "var(--accent-gold)" },
                            { label: "Hardware & Software Assets", value: "8 Tech Cards", color: "#c084fc" },
                            { label: "Grand Final Challenges", value: "4 Statements", color: "#34d399" },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="glass-card"
                                style={{
                                    padding: "20px",
                                    textAlign: "center",
                                    background: "rgba(13, 18, 36, 0.6)",
                                    border: "1px solid rgba(255, 255, 255, 0.08)",
                                }}
                            >
                                <div style={{ fontSize: "24px", fontWeight: "900", color: stat.color, fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.04em" }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Competition Pillars Grid */}
            <section style={{ maxWidth: "1200px", margin: "40px auto 100px", padding: "0 24px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <span className="badge badge-purple" style={{ marginBottom: "12px" }}>
                        COMPETITION ARCHITECTURE
                    </span>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "900", letterSpacing: "-0.02em" }}>
                        5 Rounds Designed to Test Every Dimension
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "8px auto 0" }}>
                        From high-frequency speed questions to high-stakes auction dynamics.
                    </p>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "24px",
                }}>
                    {pillars.map((p, idx) => (
                        <div
                            key={idx}
                            className="glass-card"
                            style={{
                                padding: "32px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                                    <div style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "12px",
                                        background: p.color === "gold" ? "rgba(255, 215, 0, 0.12)" : p.color === "purple" ? "rgba(168, 85, 247, 0.15)" : "rgba(0, 240, 255, 0.12)",
                                        border: `1px solid ${p.color === "gold" ? "rgba(255, 215, 0, 0.3)" : p.color === "purple" ? "rgba(168, 85, 247, 0.35)" : "rgba(0, 240, 255, 0.3)"}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "24px",
                                    }}>
                                        {p.icon}
                                    </div>
                                    <span className={p.color === "gold" ? "badge badge-gold" : p.color === "purple" ? "badge badge-purple" : "badge badge-cyan"}>
                                        {p.badge}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: "20px", color: "#fff", marginBottom: "10px" }}>{p.title}</h3>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.65 }}>
                                    {p.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                marginTop: "auto",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "36px 24px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: "13px",
                background: "rgba(3, 7, 18, 0.8)",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "var(--primary)", fontWeight: "800" }}>IEEE VTS</span>
                        <span>•</span>
                        <span>Vehicular Technology Society Student Branch Chapter</span>
                    </div>
                    <div>
                        © 2026 Tech Bid Event. All Competition Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
