import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ProjectorView() {
    const [activeTab, setActiveTab] = useState("leaderboard"); // 'leaderboard' | 'statements'
    const [statements, setStatements] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [probData, lbData] = await Promise.all([
                api.getPublicProblemStatements(),
                api.getPublicLeaderboard().catch(() => ({ leaderboard: [] })),
            ]);

            setStatements(probData.statements || []);

            const rawTeams = lbData.leaderboard || [];
            const sorted = [...rawTeams].sort((a, b) => {
                const scoreDiff = (b.finalScore || 0) - (a.finalScore || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return (b.techCoins || 0) - (a.techCoins || 0);
            });
            setLeaderboard(sorted);
        } catch (err) {
            console.error("Projector data load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Live poll every 5s for arena screen
        return () => clearInterval(interval);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    const categories = ["ALL", ...new Set(statements.map((s) => s.category).filter(Boolean))];
    const filteredStatements = activeCategory === "ALL"
        ? statements
        : statements.filter((s) => s.category === activeCategory);

    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    return (
        <div style={{
            minHeight: "100vh",
            background: "#030712",
            backgroundImage: "radial-gradient(circle at 50% 10%, rgba(0, 240, 255, 0.1) 0%, transparent 65%), radial-gradient(circle at 85% 90%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)",
            color: "#ffffff",
            padding: "28px 36px",
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Arena Top HUD Bar */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "20px",
                marginBottom: "28px",
                flexWrap: "wrap",
                gap: "16px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "14px",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px",
                        boxShadow: "0 0 25px rgba(0, 110, 255, 0.4)",
                        overflow: "hidden",
                    }}>
                        <img src="/vts-logo.png" alt="IEEE VTS Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                        <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                            ARENA STADIUM DISPLAY • LIVE SYNC
                        </div>
                        <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "900", letterSpacing: "-0.02em" }}>
                            IEEE VTS Tech Bid & Auction Event 2026
                        </h1>
                    </div>
                </div>

                {/* View Switchers & Fullscreen */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.04)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <button
                            onClick={() => setActiveTab("leaderboard")}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                background: activeTab === "leaderboard" ? "var(--primary)" : "transparent",
                                color: activeTab === "leaderboard" ? "#000" : "var(--text-muted)",
                                fontWeight: "800",
                                fontSize: "13px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            🏆 Standings
                        </button>
                        <button
                            onClick={() => setActiveTab("statements")}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                background: activeTab === "statements" ? "var(--primary)" : "transparent",
                                color: activeTab === "statements" ? "#000" : "var(--text-muted)",
                                fontWeight: "800",
                                fontSize: "13px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            🎯 Problem Statements
                        </button>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                        {isFullscreen ? "Exit Fullscreen" : "⛶ Fullscreen"}
                    </button>
                    <Link
                        to="/dashboard"
                        className="btn-secondary"
                        style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                        Exit Arena
                    </Link>
                </div>
            </div>

            {/* ============================================================= */}
            {/* VIEW 1: STADIUM LIVE LEADERBOARD */}
            {/* ============================================================= */}
            {activeTab === "leaderboard" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "28px" }}>
                    {/* Top 3 Stadium Podium */}
                    {leaderboard.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "20px",
                            alignItems: "flex-end",
                        }}>
                            {/* 2nd Place */}
                            {top2 && (
                                <div className="glass-card" style={{
                                    padding: "24px",
                                    textAlign: "center",
                                    border: "1px solid rgba(203, 213, 225, 0.35)",
                                    background: "linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
                                    order: 1,
                                }}>
                                    <div style={{ fontSize: "36px" }}>🥈</div>
                                    <span className="badge" style={{ background: "rgba(203, 213, 225, 0.15)", color: "#e2e8f0", margin: "8px 0" }}>
                                        RANK #2 • RUNNER UP
                                    </span>
                                    <h3 style={{ fontSize: "24px", color: "#fff", margin: "4px 0" }}>{top2.teamName}</h3>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>Leader: {top2.leader?.name || "Participant"}</div>
                                    <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "10px" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>COINS</div>
                                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top2.techCoins || 0}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>SCORE</div>
                                            <div style={{ fontSize: "18px", fontWeight: "900", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{top2.finalScore || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place (Champion) */}
                            {top1 && (
                                <div className="glass-card" style={{
                                    padding: "32px 24px",
                                    textAlign: "center",
                                    border: "1px solid rgba(255, 215, 0, 0.6)",
                                    background: "linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, rgba(15, 23, 42, 0.98) 100%)",
                                    boxShadow: "0 0 60px rgba(255, 215, 0, 0.3)",
                                    transform: "translateY(-10px)",
                                    order: 1,
                                }}>
                                    <div style={{ fontSize: "44px" }} className="animate-float">👑</div>
                                    <span className="badge badge-gold" style={{ fontSize: "12px", padding: "6px 16px", margin: "8px 0" }}>
                                        🏆 RANK #1 • ARENA LEADER
                                    </span>
                                    <h2 style={{ fontSize: "30px", color: "#fff", fontWeight: "900", margin: "6px 0" }}>{top1.teamName}</h2>
                                    <div style={{ fontSize: "14px", color: "var(--accent-gold)", marginBottom: "16px" }}>Leader: {top1.leader?.name || "Participant"}</div>
                                    <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.3)", padding: "14px", borderRadius: "12px" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: "700" }}>TECH COINS</div>
                                            <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top1.techCoins || 0}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700" }}>FINAL SCORE</div>
                                            <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>⭐ {top1.finalScore || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {top3 && (
                                <div className="glass-card" style={{
                                    padding: "24px",
                                    textAlign: "center",
                                    border: "1px solid rgba(217, 119, 6, 0.4)",
                                    background: "linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)",
                                    order: 3,
                                }}>
                                    <div style={{ fontSize: "36px" }}>🥉</div>
                                    <span className="badge" style={{ background: "rgba(217, 119, 6, 0.15)", color: "#fbbf24", margin: "8px 0" }}>
                                        RANK #3 • 2ND RUNNER UP
                                    </span>
                                    <h3 style={{ fontSize: "24px", color: "#fff", margin: "4px 0" }}>{top3.teamName}</h3>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px" }}>Leader: {top3.leader?.name || "Participant"}</div>
                                    <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 255, 255, 0.03)", padding: "10px", borderRadius: "10px" }}>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>COINS</div>
                                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top3.techCoins || 0}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>SCORE</div>
                                            <div style={{ fontSize: "18px", fontWeight: "900", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{top3.finalScore || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stadium Table */}
                    <div className="glass-card" style={{ padding: "0", overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "16px" }}>
                            <thead>
                                <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                    <th style={{ padding: "18px 24px", width: "120px" }}>Rank</th>
                                    <th style={{ padding: "18px 24px" }}>Team Name</th>
                                    <th style={{ padding: "18px 24px" }}>Leader</th>
                                    <th style={{ padding: "18px 24px" }}>Tech Cards</th>
                                    <th style={{ padding: "18px 24px" }}>Tech Coins</th>
                                    <th style={{ padding: "18px 24px", textAlign: "right" }}>Grand Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((team, idx) => {
                                    const actualRank = idx + 1;
                                    const isTop1 = actualRank === 1;
                                    const isTop2 = actualRank === 2;
                                    const isTop3 = actualRank === 3;

                                    return (
                                        <tr
                                            key={team._id || idx}
                                            style={{
                                                borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                                                background: isTop1 ? "rgba(255, 215, 0, 0.04)" : "transparent",
                                            }}
                                        >
                                            <td style={{ padding: "18px 24px" }}>
                                                <span style={{
                                                    display: "inline-block",
                                                    padding: "4px 14px",
                                                    borderRadius: "8px",
                                                    fontFamily: "var(--font-mono)",
                                                    fontWeight: "800",
                                                    fontSize: "14px",
                                                    background: isTop1 ? "rgba(255, 215, 0, 0.15)" : isTop2 ? "rgba(203, 213, 225, 0.15)" : isTop3 ? "rgba(217, 119, 6, 0.15)" : "rgba(255, 255, 255, 0.04)",
                                                    color: isTop1 ? "#ffd700" : isTop2 ? "#e2e8f0" : isTop3 ? "#fbbf24" : "var(--text-muted)",
                                                }}>
                                                    {isTop1 ? "🥇 #1" : isTop2 ? "🥈 #2" : isTop3 ? "🥉 #3" : `#${actualRank}`}
                                                </span>
                                            </td>
                                            <td style={{ padding: "18px 24px" }}>
                                                <strong style={{ fontSize: "18px", color: "#fff" }}>
                                                    {team.teamName}
                                                </strong>
                                            </td>
                                            <td style={{ padding: "18px 24px", color: "var(--text-muted)" }}>
                                                {team.leader?.name || "Participant"}
                                            </td>
                                            <td style={{ padding: "18px 24px" }}>
                                                <span className="badge badge-gold" style={{ fontSize: "12px" }}>
                                                    🎴 {team.techCards?.length || 0} Cards
                                                </span>
                                            </td>
                                            <td style={{ padding: "18px 24px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)", fontSize: "18px" }}>
                                                🪙 {team.techCoins || 0}
                                            </td>
                                            <td style={{ padding: "18px 24px", textAlign: "right" }}>
                                                <span style={{
                                                    fontSize: "24px",
                                                    fontWeight: "900",
                                                    color: isTop1 ? "var(--accent-gold)" : "var(--primary)",
                                                    fontFamily: "var(--font-mono)",
                                                }}>
                                                    {team.finalScore || 0}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============================================================= */}
            {/* VIEW 2: PROBLEM STATEMENTS CATALOG */}
            {/* ============================================================= */}
            {activeTab === "statements" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: "8px 20px",
                                    borderRadius: "9999px",
                                    fontSize: "13px",
                                    fontWeight: "700",
                                    background: activeCategory === cat ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                                    color: activeCategory === cat ? "#000" : "var(--text-muted)",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
                        gap: "24px",
                    }}>
                        {filteredStatements.map((statement) => (
                            <div
                                key={statement._id}
                                className="glass-card"
                                style={{
                                    padding: "32px",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    border: "1px solid rgba(0, 240, 255, 0.25)",
                                }}
                            >
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                        <span className="badge badge-cyan">
                                            CHALLENGE #{statement.statementNumber}
                                        </span>
                                        <span style={{ fontSize: "13px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                            Base Bid: 🪙 {statement.minBid || 50}
                                        </span>
                                    </div>
                                    <h2 style={{ fontSize: "22px", color: "#fff", marginBottom: "10px" }}>{statement.title}</h2>
                                    <div style={{ fontSize: "12px", color: "#c084fc", fontWeight: "700", textTransform: "uppercase", marginBottom: "14px" }}>
                                        {statement.category}
                                    </div>
                                    <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7 }}>
                                        {statement.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

export default ProjectorView;
