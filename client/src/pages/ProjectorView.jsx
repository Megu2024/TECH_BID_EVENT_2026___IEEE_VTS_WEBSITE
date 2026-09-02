import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ProjectorView() {
    const [activeTab, setActiveTab] = useState("leaderboard"); // 'leaderboard' | 'techcards' | 'statements'
    const [statements, setStatements] = useState([]);
    const [techCards, setTechCards] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [activeCardCategory, setActiveCardCategory] = useState("ALL");
    const [cardSearchQuery, setCardSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [probData, lbData, cardsData] = await Promise.all([
                api.getPublicProblemStatements().catch(() => ({ statements: [] })),
                api.getPublicLeaderboard().catch(() => ({ leaderboard: [] })),
                api.getPublicTechCards().catch(() => ({ techCards: [] })),
            ]);

            setStatements(probData.statements || []);
            setTechCards(cardsData.cards || cardsData.techCards || []);

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

    const cardCategories = ["ALL", ...new Set(techCards.map((c) => c.category || "General").filter(Boolean))];
    const filteredTechCards = techCards.filter((card) => {
        const matchesCat = activeCardCategory === "ALL" || (card.category || "General") === activeCardCategory;
        const matchesSearch = !cardSearchQuery.trim() ||
            card.name?.toLowerCase().includes(cardSearchQuery.toLowerCase()) ||
            card.description?.toLowerCase().includes(cardSearchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

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
                    <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.04)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)", gap: "4px" }}>
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
                                transition: "all 0.15s ease",
                            }}
                        >
                            🏆 Standings
                        </button>
                        <button
                            onClick={() => setActiveTab("techcards")}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "8px",
                                background: activeTab === "techcards" ? "var(--primary)" : "transparent",
                                color: activeTab === "techcards" ? "#000" : "var(--text-muted)",
                                fontWeight: "800",
                                fontSize: "13px",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                            }}
                        >
                            🎴 Tech Cards
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
                                transition: "all 0.15s ease",
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
            {/* VIEW 2: STADIUM TECH CARDS CATALOG & AUCTION DECK */}
            {/* ============================================================= */}
            {activeTab === "techcards" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Top Stats Ribbon */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "rgba(0, 240, 255, 0.03)",
                        border: "1px solid rgba(0, 240, 255, 0.15)",
                        padding: "16px 24px",
                        borderRadius: "14px",
                        flexWrap: "wrap",
                        gap: "16px",
                    }}>
                        {(() => {
                            const totalCapacity = techCards.reduce((sum, c) => sum + (c.totalCount !== undefined ? Number(c.totalCount) : 4), 0);
                            const availableUnits = techCards.reduce((sum, c) => {
                                if (c.remainingCount !== undefined) return sum + Number(c.remainingCount);
                                const owningCount = leaderboard.filter((t) =>
                                    (t.techCards || []).some((tc) => tc.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())
                                ).length;
                                return sum + Math.max(0, (c.totalCount || 4) - owningCount);
                            }, 0);

                            return (
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                    <div style={{ padding: "8px 18px", background: "rgba(0, 240, 255, 0.1)", border: "1px solid rgba(0, 240, 255, 0.3)", borderRadius: "10px" }}>
                                        <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
                                            AVAILABLE TECH CARDS
                                        </span>
                                        <strong style={{ fontSize: "20px", color: "var(--primary)", fontFamily: "var(--font-mono)", fontWeight: "900" }}>
                                            🎴 {availableUnits} / {totalCapacity} Available
                                        </strong>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Search Filter */}
                        <div style={{ minWidth: "260px" }}>
                            <input
                                type="text"
                                placeholder="🔍 Search card name or tech..."
                                value={cardSearchQuery}
                                onChange={(e) => setCardSearchQuery(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    fontSize: "13px",
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                    color: "#fff",
                                }}
                            />
                        </div>
                    </div>

                    {/* Category Filter Pills */}
                    {cardCategories.length > 1 && (
                        <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                            {cardCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCardCategory(cat)}
                                    style={{
                                        padding: "8px 20px",
                                        borderRadius: "9999px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        background: activeCardCategory === cat ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                                        color: activeCardCategory === cat ? "#000" : "var(--text-muted)",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Tech Cards Arena Grid */}
                    {filteredTechCards.length === 0 ? (
                        <div className="glass-card" style={{ padding: "60px 32px", textAlign: "center", color: "var(--text-dim)" }}>
                            <h3>No Tech Cards match your filter</h3>
                            <p style={{ fontSize: "14px", marginTop: "8px" }}>Try selecting 'ALL' or changing your search query.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                            gap: "24px",
                        }}>
                            {filteredTechCards.map((card) => {
                                const owningTeams = leaderboard.filter((t) =>
                                    (t.techCards || []).some((tc) => tc.name?.trim().toLowerCase() === card.name?.trim().toLowerCase())
                                );
                                const remainingUnits = Math.max(0, (card.totalCount || 4) - owningTeams.length);

                                return (
                                    <div
                                        key={card._id}
                                        className="glass-card"
                                        style={{
                                            padding: "28px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            border: "1px solid rgba(0, 240, 255, 0.25)",
                                            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(3, 7, 18, 0.95) 100%)",
                                            borderRadius: "16px",
                                            gap: "16px",
                                            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                                            transition: "all 0.25s ease",
                                        }}
                                    >
                                        <div>
                                            {/* Top badges: Category & Stock */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                                <span className="badge badge-purple" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                                    {card.category || "Hardware / Software"}
                                                </span>
                                                <span className="badge" style={{
                                                    fontSize: "11px",
                                                    fontWeight: "700",
                                                    background: remainingUnits > 0 ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)",
                                                    color: remainingUnits > 0 ? "#34d399" : "#fb7185",
                                                    border: remainingUnits > 0 ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid rgba(244, 63, 94, 0.3)",
                                                }}>
                                                    📦 {remainingUnits} / {card.totalCount || 4} Available
                                                </span>
                                            </div>

                                            {/* Card Name */}
                                            <h2 style={{ fontSize: "22px", color: "#fff", fontWeight: "900", margin: "0 0 10px 0", letterSpacing: "-0.01em" }}>
                                                {card.name}
                                            </h2>

                                            {/* Price / Value Box */}
                                            <div style={{
                                                display: "flex",
                                                gap: "10px",
                                                background: "rgba(255, 255, 255, 0.03)",
                                                padding: "10px 14px",
                                                borderRadius: "10px",
                                                border: "1px solid rgba(255, 255, 255, 0.06)",
                                                marginBottom: "14px",
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>BASE PRICE</span>
                                                    <strong style={{ fontSize: "16px", color: "var(--accent-gold)", fontFamily: "var(--font-mono)" }}>
                                                        🪙 {card.basePrice || 50}
                                                    </strong>
                                                </div>
                                                <div style={{ flex: 1, borderLeft: "1px solid rgba(255, 255, 255, 0.08)", paddingLeft: "10px" }}>
                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "block" }}>MARKET VALUE</span>
                                                    <strong style={{ fontSize: "16px", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                                                        📈 🪙 {card.marketValue || card.basePrice || 50}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                                                {card.description || "Official tournament technology item available for auction bidding."}
                                            </p>
                                        </div>

                                        {/* Team Ownership Tracker */}
                                        <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>
                                                Claimed By ({owningTeams.length} {owningTeams.length === 1 ? "Team" : "Teams"}):
                                            </div>
                                            {owningTeams.length > 0 ? (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                    {owningTeams.map((t, idx) => (
                                                        <span key={idx} className="badge badge-gold" style={{ fontSize: "11px", padding: "3px 8px" }}>
                                                            🛡️ {t.teamName}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.35)", fontStyle: "italic" }}>
                                                    Available for live auction bidding
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================= */}
            {/* VIEW 3: PROBLEM STATEMENTS CATALOG */}
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
