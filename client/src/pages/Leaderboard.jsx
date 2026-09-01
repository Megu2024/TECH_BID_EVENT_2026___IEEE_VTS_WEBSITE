import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [search, setSearch] = useState("");
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await api.getPublicLeaderboard();
            setVisible(data.visible);
            
            // Deterministically sort teams: Highest Final Score, then Highest Tech Coins
            const rawTeams = data.leaderboard || [];
            const sorted = [...rawTeams].sort((a, b) => {
                const scoreDiff = (b.finalScore || 0) - (a.finalScore || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return (b.techCoins || 0) - (a.techCoins || 0);
            });
            
            setLeaderboard(sorted);
        } catch (err) {
            setVisible(false);
            setError(err.message || "Rankings are currently locked by the Event Administrator");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const filteredTeams = leaderboard.filter((t) =>
        t.teamName?.toLowerCase().includes(search.toLowerCase()) ||
        t.leader?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const top1 = leaderboard[0];
    const top2 = leaderboard[1];
    const top3 = leaderboard[2];

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "1200px", margin: "40px auto 100px", padding: "0 24px", width: "100%" }}>
                
                {/* Header Banner */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span className="badge badge-gold">
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ffd700", display: "inline-block", boxShadow: "0 0 8px #ffd700" }} />
                            OFFICIAL EVENT STANDINGS
                        </span>
                        <span className="badge badge-cyan">IEEE VTS TECH BID 2026</span>
                    </div>

                    <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: "900", letterSpacing: "-0.03em", marginBottom: "12px" }}>
                        Competition <span className="gradient-text-gold">Leaderboard</span>
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
                        Live valuations, earned Tech Coins, and deterministic standings verified across all 5 competition stages.
                    </p>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            border: "3px solid rgba(255, 215, 0, 0.2)",
                            borderTopColor: "var(--accent-gold)",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 16px",
                        }} />
                        <div style={{ fontSize: "15px", fontWeight: "600" }}>Synchronizing Live Standings...</div>
                    </div>
                ) : !visible ? (
                    /* LOCKED RANKINGS STATE */
                    <div className="glass-card" style={{
                        maxWidth: "680px",
                        margin: "0 auto",
                        padding: "60px 40px",
                        textAlign: "center",
                        border: "1px solid rgba(168, 85, 247, 0.3)",
                        boxShadow: "0 0 50px rgba(168, 85, 247, 0.15)",
                    }}>
                        <div style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "20px",
                            background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(0, 240, 255, 0.1))",
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                            margin: "0 auto 24px",
                        }}>
                            🔒
                        </div>
                        <h2 style={{ fontSize: "28px", marginBottom: "12px", color: "#fff" }}>
                            Rankings Temporarily Sealed
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
                            The official leaderboard has been placed on pause by the Event Admins during active judging. Official winning standings will be unveiled live on the stadium projector during the closing ceremony.
                        </p>
                        <span className="badge badge-purple" style={{ fontSize: "12px", padding: "8px 20px" }}>
                            Status: Live Evaluation in Progress
                        </span>
                    </div>
                ) : (
                    <div>
                        {/* ============================================================= */}
                        {/* TOP 3 PODIUM HERO SECTION */}
                        {/* ============================================================= */}
                        {leaderboard.length > 0 && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: "20px",
                                alignItems: "flex-end",
                                marginBottom: "48px",
                            }}>
                                
                                {/* 2ND PLACE (SILVER) */}
                                {top2 && (
                                    <div className="glass-card" style={{
                                        padding: "28px",
                                        textAlign: "center",
                                        border: "1px solid rgba(203, 213, 225, 0.3)",
                                        background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
                                        order: window.innerWidth > 768 ? 1 : 2,
                                    }}>
                                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🥈</div>
                                        <span className="badge" style={{ background: "rgba(203, 213, 225, 0.15)", color: "#e2e8f0", borderColor: "rgba(203, 213, 225, 0.4)", marginBottom: "10px" }}>
                                            RANK #2 • RUNNER UP
                                        </span>
                                        <h3 style={{ fontSize: "22px", margin: "6px 0 4px", color: "#fff" }}>{top2.teamName}</h3>
                                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Leader: {top2.leader?.name || "Participant"}</div>
                                        
                                        <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "12px" }}>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Coins</div>
                                                <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top2.techCoins || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Final Score</div>
                                                <div style={{ fontSize: "18px", fontWeight: "900", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{top2.finalScore || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 1ST PLACE (CHAMPION - GOLD) */}
                                {top1 && (
                                    <div className="glass-card" style={{
                                        padding: "36px 28px",
                                        textAlign: "center",
                                        border: "1px solid rgba(255, 215, 0, 0.5)",
                                        background: "linear-gradient(180deg, rgba(255, 215, 0, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)",
                                        boxShadow: "0 0 50px rgba(255, 215, 0, 0.25)",
                                        transform: "translateY(-12px)",
                                        order: 1,
                                    }}>
                                        <div style={{ fontSize: "48px", marginBottom: "8px" }} className="animate-float">👑</div>
                                        <span className="badge badge-gold" style={{ fontSize: "12px", padding: "6px 16px", marginBottom: "12px" }}>
                                            🏆 RANK #1 • CURRENT LEADER
                                        </span>
                                        <h2 style={{ fontSize: "28px", margin: "8px 0 4px", color: "#fff", fontWeight: "900" }}>{top1.teamName}</h2>
                                        <div style={{ fontSize: "14px", color: "var(--accent-gold)", marginBottom: "20px" }}>Leader: {top1.leader?.name || "Participant"}</div>
                                        
                                        <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 215, 0, 0.08)", border: "1px solid rgba(255, 215, 0, 0.25)", padding: "16px", borderRadius: "14px" }}>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "700" }}>Tech Coins</div>
                                                <div style={{ fontSize: "24px", fontWeight: "900", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top1.techCoins || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--primary)", textTransform: "uppercase", fontWeight: "700" }}>Grand Total</div>
                                                <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>⭐ {top1.finalScore || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3RD PLACE (BRONZE) */}
                                {top3 && (
                                    <div className="glass-card" style={{
                                        padding: "28px",
                                        textAlign: "center",
                                        border: "1px solid rgba(217, 119, 6, 0.35)",
                                        background: "linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)",
                                        order: 3,
                                    }}>
                                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🥉</div>
                                        <span className="badge" style={{ background: "rgba(217, 119, 6, 0.15)", color: "#fbbf24", borderColor: "rgba(217, 119, 6, 0.4)", marginBottom: "10px" }}>
                                            RANK #3 • 2ND RUNNER UP
                                        </span>
                                        <h3 style={{ fontSize: "22px", margin: "6px 0 4px", color: "#fff" }}>{top3.teamName}</h3>
                                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>Leader: {top3.leader?.name || "Participant"}</div>
                                        
                                        <div style={{ display: "flex", justifyContent: "space-around", background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "12px" }}>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Coins</div>
                                                <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)" }}>🪙 {top3.techCoins || 0}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Final Score</div>
                                                <div style={{ fontSize: "18px", fontWeight: "900", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>{top3.finalScore || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                        {/* Search & Full Table */}
                        <div className="glass-card" style={{ padding: "32px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                                <div>
                                    <h3 style={{ fontSize: "20px", color: "#fff", margin: 0 }}>All Team Standings</h3>
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
                                        {filteredTeams.length} of {leaderboard.length} teams listed
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    placeholder="🔍 Search by team or leader name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ maxWidth: "340px" }}
                                />
                            </div>

                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                                    <thead>
                                        <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                            <th style={{ padding: "16px 20px", width: "110px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Rank</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Team Name</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Team Leader</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Tech Cards</th>
                                            <th style={{ padding: "16px 20px", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Active Coins</th>
                                            <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--text-muted)", textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Final Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeams.map((team, idx) => {
                                            const actualRank = idx + 1;
                                            const isTop1 = actualRank === 1;
                                            const isTop2 = actualRank === 2;
                                            const isTop3 = actualRank === 3;

                                            return (
                                                <tr
                                                    key={team._id || idx}
                                                    style={{
                                                        borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                                                        background: isTop1 ? "rgba(255, 215, 0, 0.03)" : "transparent",
                                                        transition: "background 0.2s ease",
                                                    }}
                                                >
                                                    <td style={{ padding: "18px 20px" }}>
                                                        <span style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: "4px 12px",
                                                            borderRadius: "8px",
                                                            fontFamily: "var(--font-mono)",
                                                            fontWeight: "800",
                                                            fontSize: "13px",
                                                            background: isTop1 ? "rgba(255, 215, 0, 0.15)" : isTop2 ? "rgba(203, 213, 225, 0.15)" : isTop3 ? "rgba(217, 119, 6, 0.15)" : "rgba(255, 255, 255, 0.04)",
                                                            color: isTop1 ? "#ffd700" : isTop2 ? "#e2e8f0" : isTop3 ? "#fbbf24" : "var(--text-muted)",
                                                            border: isTop1 ? "1px solid rgba(255, 215, 0, 0.4)" : isTop2 ? "1px solid rgba(203, 213, 225, 0.4)" : isTop3 ? "1px solid rgba(217, 119, 6, 0.4)" : "1px solid rgba(255, 255, 255, 0.06)",
                                                        }}>
                                                            {isTop1 ? "🥇 #1" : isTop2 ? "🥈 #2" : isTop3 ? "🥉 #3" : `#${actualRank}`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "18px 20px" }}>
                                                        <strong style={{ fontSize: "16px", color: "#fff", display: "block" }}>
                                                            {team.teamName}
                                                        </strong>
                                                    </td>
                                                    <td style={{ padding: "18px 20px", color: "var(--text-muted)" }}>
                                                        {team.leader?.name || "Participant"}
                                                    </td>
                                                    <td style={{ padding: "18px 20px" }}>
                                                        <span className="badge badge-gold" style={{ fontSize: "11px" }}>
                                                            🎴 {team.techCards?.length || 0} Cards
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: "18px 20px", fontWeight: "800", color: "#ffd700", fontFamily: "var(--font-mono)", fontSize: "15px" }}>
                                                        🪙 {team.techCoins || 0}
                                                    </td>
                                                    <td style={{ padding: "18px 20px", textAlign: "right" }}>
                                                        <span style={{
                                                            fontSize: "20px",
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
