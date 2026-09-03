import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import PinModal from "../components/PinModal";
import QuizReviewModal from "../components/QuizReviewModal";

function ParticipantDashboard() {
    const { user, team, refreshTeam } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [eventStatus, setEventStatus] = useState(null);
    const [leaderboardVisible, setLeaderboardVisible] = useState(false);

    // Modal state for starting online games
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [activeGame, setActiveGame] = useState({ game: 1, round: 1, title: "" });
    const [pinError, setPinError] = useState("");
    const [verifyingPin, setVerifyingPin] = useState(false);

    // Quiz Review Modal state
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewGame, setReviewGame] = useState({ game: 1, round: 1, title: "" });

    // Game Session statuses (e.g. completed, running, not_started)
    const [r1g1Session, setR1g1Session] = useState({ status: "not_started" });
    const [r1g3Session, setR1g3Session] = useState({ status: "not_started" });
    const [r4g1Session, setR4g1Session] = useState({ status: "not_started" });

    const loadDashboardData = async (forceSpinner = false) => {
        try {
            // Optimistic fast-load from localStorage
            const cachedData = localStorage.getItem('participantDashboardCache');
            if (cachedData && !forceSpinner) {
                try {
                    const parsed = JSON.parse(cachedData);
                    setEventStatus(parsed.statusData || null);
                    setLeaderboardVisible(parsed.statusData?.leaderboardVisible || false);
                    setR1g1Session(parsed.s1 || { status: "not_started" });
                    setR1g3Session(parsed.s3 || { status: "not_started" });
                    setR4g1Session(parsed.s4 || { status: "not_started" });
                    setLoading(false); // Instantly remove loading screen
                } catch(e) {}
            } else {
                setLoading(true);
            }

            await refreshTeam();
            const statusData = await api.getEventStatus();
            setEventStatus(statusData);
            setLeaderboardVisible(statusData.leaderboardVisible);

            // Fetch session completion statuses
            let s1 = { status: "not_started" }, s3 = { status: "not_started" }, s4 = { status: "not_started" };
            try {
                s1 = await api.getGameSessionStatus(1, 1);
                setR1g1Session(s1);
            } catch (e) {
                console.error("R1G1 session status error", e);
            }

            try {
                s3 = await api.getGameSessionStatus(3, 1);
                setR1g3Session(s3);
            } catch (e) {
                console.error("R1G3 session status error", e);
            }

            try {
                s4 = await api.getGameSessionStatus(1, 4);
                setR4g1Session(s4);
            } catch (e) {
                console.error("R4G1 session status error", e);
            }

            // Cache the fresh data
            try {
                localStorage.setItem('participantDashboardCache', JSON.stringify({
                    statusData,
                    s1,
                    s3,
                    s4
                }));
            } catch (err) {
                console.warn("Local cache quota exceeded.");
            }

        } catch (err) {
            console.error("Dashboard data load error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const openGameModal = (game, round, title) => {
        setActiveGame({ game, round, title });
        setPinError("");
        setPinModalOpen(true);
    };

    const openReviewModal = (game, round, title) => {
        setReviewGame({ game, round, title });
        setReviewModalOpen(true);
    };

    const handlePinSubmit = async (pin) => {
        try {
            setVerifyingPin(true);
            setPinError("");

            await api.verifyGamePin(activeGame.game, activeGame.round, pin);
            setPinModalOpen(false);

            // Navigate to the online game runner with state
            navigate(`/game/${activeGame.game}/round/${activeGame.round}`, {
                state: { pin },
            });
        } catch (err) {
            setPinError(err.message || "Invalid Game PIN");
        } finally {
            setVerifyingPin(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Loading team dashboard...</p>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{
                    flex: 1,
                    maxWidth: "700px",
                    margin: "60px auto",
                    padding: "0 24px",
                    textAlign: "center",
                }}>
                    <div className="glass-card" style={{ padding: "48px 32px" }}>
                        <div style={{ fontSize: "56px", marginBottom: "16px" }}>👥</div>
                        <h2 style={{ fontSize: "32px", marginBottom: "12px" }}>No Team Registered Yet</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px", lineHeight: 1.6 }}>
                            To participate in the games, auctions, and score tracking, you need to either create a new team or be invited by your team leader.
                        </p>
                        <Link to="/team" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>
                            Create or Join Team →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const isLeader = team.leader?._id === user?.id || team.leader?._id === user?._id;

    // Financial & Score Variables for Complete Transparency
    const r1g1 = Number(team.round1?.game1Score || 0);
    const r1g2 = Number(team.round1?.game2Score || 0);
    const r1g3 = Number(team.round1?.game3Score || 0);
    const round1Earned = r1g1 + r1g2 + r1g3;

    const r4g1 = Number(team.round4?.game1Score || 0);
    const r4g2 = Number(team.round4?.game2Score || 0);
    const round4Earned = r4g1 + r4g2;

    const r5DefenseEarned = Number(team.round5?.finalEvaluationScore || 0);
    const r5AuctionSpent = Number(team.round5?.auctionCoinsSpent || 0);

    const totalCardsBoughtCost = (team.techCards || []).reduce(
        (sum, card) => sum + Number(card.boughtPrice !== undefined && card.boughtPrice !== null ? card.boughtPrice : (card.basePrice || 0)),
        0
    );

    const totalCardsMarketValue = (team.techCards || []).reduce(
        (sum, card) => sum + Number(card.marketValue !== undefined && card.marketValue !== null ? card.marketValue : (card.boughtPrice || card.basePrice || 0)),
        0
    );

    const netCardAppreciation = totalCardsMarketValue - totalCardsBoughtCost;
    const totalGrossEarned = round1Earned + round4Earned + r5DefenseEarned;
    const totalAuctionSpent = totalCardsBoughtCost + r5AuctionSpent;
    const liquidWalletCoins = team.techCoins || 0;
    const finalScore = team.finalScore || 0;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "1350px", margin: "0 auto", padding: "36px 24px 60px", width: "100%" }}>
                {/* Dashboard Top Banner */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "20px",
                    marginBottom: "32px",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <span className="badge badge-cyan">TEAM DASHBOARD</span>
                            {team.rank && leaderboardVisible && (
                                <span className="badge badge-gold">
                                    🏆 RANK #{team.rank}
                                </span>
                            )}
                        </div>
                        <h1 style={{ fontSize: "36px", margin: 0 }}>
                            {team.teamName}
                        </h1>
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <Link to="/team" className="btn-secondary" style={{ padding: "10px 20px" }}>
                            ⚙️ Team Roster
                        </Link>
                        <Link to="/event-info" className="btn-secondary" style={{ padding: "10px 20px" }}>
                            📖 Event Rules
                        </Link>
                    </div>
                </div>

                {/* Main Stats Grid (4 Cards: Liquid Wallet Coins, Cards Portfolio, Grand Final Score, Rank) */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "20px",
                    marginBottom: "32px",
                }}>
                    {/* Live Tech Coins Card (Wallet) */}
                    <div className="glass-card" style={{
                        padding: "24px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(255, 215, 0, 0.35)",
                        boxShadow: "0 0 25px rgba(255, 215, 0, 0.12)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Available Wallet Coins
                            </span>
                            <span style={{ fontSize: "26px" }}>🪙</span>
                        </div>
                        <div style={{ fontSize: "38px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffd700" }}>
                            {liquidWalletCoins + totalCardsMarketValue}
                        </div>
                        
                    </div>

                    {/* Tech Cards Portfolio Value Card */}
                    <div className="glass-card" style={{
                        padding: "24px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(168, 85, 247, 0.35)",
                        boxShadow: "0 0 25px rgba(168, 85, 247, 0.12)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Cards Portfolio Value
                            </span>
                            <span style={{ fontSize: "26px" }}>🎴</span>
                        </div>
                        <div style={{ fontSize: "38px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#e9d5ff" }}>
                            🪙 {totalCardsMarketValue}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            {team.techCards?.length || 0} Cards • Cost: 🪙{totalCardsBoughtCost} ({netCardAppreciation >= 0 ? `+🪙${netCardAppreciation} Gain` : `-🪙${Math.abs(netCardAppreciation)} Loss`})
                        </div>
                    </div>

                    {/* Grand Final Score Card */}
                    <div className="glass-card" style={{
                        padding: "24px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(0, 240, 255, 0.35)",
                        boxShadow: "0 0 25px rgba(0, 240, 255, 0.12)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Grand Final Score
                            </span>
                            <span style={{ fontSize: "26px" }}>⭐</span>
                        </div>
                        <div style={{ fontSize: "38px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                            {finalScore}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            Cumulative Score
                        </div>
                    </div>

                    {/* Leaderboard Rank Card */}
                    <div className="glass-card" style={{
                        padding: "24px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Competition Standing
                            </span>
                            <span style={{ fontSize: "26px" }}>🏆</span>
                        </div>
                        <div style={{ fontSize: "38px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                            {leaderboardVisible && team.rank ? `#${team.rank}` : "—"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            {leaderboardVisible
                                ? <Link to="/leaderboard" style={{ color: "var(--primary)", fontWeight: "600" }}>View Full Leaderboard →</Link>
                                : "Rankings officially gated by Admin"}
                        </div>
                    </div>
                </div>

                {/* Team Members Roster Bar */}
                <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
                    <h3 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>👥</span> Team Roster
                    </h3>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "14px",
                    }}>
                        {team.members.map((member) => (
                            <div
                                key={member._id}
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: "10px",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    border: "1px solid rgba(255, 255, 255, 0.06)",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <strong style={{ fontSize: "14px", color: "#fff" }}>
                                        {member.name}
                                    </strong>
                                    {team.leader?._id === member._id && (
                                        <span className="badge badge-gold" style={{ fontSize: "10px", padding: "2px 8px" }}>
                                            LEADER
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {member.email}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rounds Breakdown & Game Launchers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                    
                    {/* ROUND 1 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <span className="badge badge-cyan" style={{ marginBottom: "6px" }}>ROUND 1</span>
                                <h3 style={{ fontSize: "22px" }}>Tri-Game Challenge</h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Round 1 Earned</span>
                                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                                    🪙 {team.round1?.totalScore || 0}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                            {/* Game 1: Quiz */}
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <strong style={{ fontSize: "15px" }}>Game 1: Technical Quiz</strong>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                        🪙 {team.round1?.game1Score || 0}
                                    </span>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r1g1Session.status === "completed" ? (
                                        false ? (null) : (
                                            <div style={{ padding: "10px", fontSize: "13px", textAlign: "center", color: "var(--text-dim)", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                                                ✅ Completed
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(1, 1, "Round 1 Game 1: Technical Quiz")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r1g1Session.status === "running" ? "Resume Technical Quiz →" : "Start Technical Quiz →"}
                                            </button>
                                            
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Game 2: Image Term */}
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <strong style={{ fontSize: "15px" }}>Game 2: Image Term Identification</strong>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                        🪙 {team.round1?.game2Score || 0}
                                    </span>
                                </div>
                                
                                <div style={{ fontSize: "12px", color: "var(--text-dim)", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", textAlign: "center" }}>
                                    {team.round1?.game2Score > 0 ? `✅ Evaluated (${team.round1.game2Score} Coins)` : "⏳ Awaiting Admin Evaluation"}
                                </div>
                            </div>

                            {/* Game 3: Code Output */}
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <strong style={{ fontSize: "15px" }}>Game 3: Code Output & Debugging</strong>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                        🪙 {team.round1?.game3Score || 0}
                                    </span>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r1g3Session.status === "completed" ? (
                                        false ? (null) : (
                                            <div style={{ padding: "10px", fontSize: "13px", textAlign: "center", color: "var(--text-dim)", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                                                ✅ Completed
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(3, 1, "Round 1 Game 3: Code Output & Debugging")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r1g3Session.status === "running" ? "Resume Code Challenge →" : "Start Code Challenge →"}
                                            </button>
                                            {eventStatus?.quizAnswersVisible && (r1g3Session.hasPreviousAnswers || team.round1?.game3Score > 0) && (
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => openReviewModal(3, 1, "Round 1 Game 3: Code Output & Debugging")}
                                                    style={{ width: "100%", padding: "8px", fontSize: "12px", borderColor: "rgba(52, 211, 153, 0.4)", color: "#34d399" }}
                                                >
                                                    Check Code Answers 📝
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 2: TECH CARDS */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <span className="badge badge-gold" style={{ marginBottom: "6px" }}>ROUND 2</span>
                                <h3 style={{ fontSize: "22px" }}>Tech Cards Possessed</h3>
                            </div>
                            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                Total Cards: <strong style={{ color: "#fff" }}>{team.techCards?.length || 0}</strong>
                            </div>
                        </div>

                        {(!team.techCards || team.techCards.length === 0) ? (
                            <div style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px" }}>
                                🎴 No Tech Cards assigned yet. Won cards from the live auction will appear here.
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                                gap: "14px",
                            }}>
                                {team.techCards.map((card, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: "16px",
                                            borderRadius: "12px",
                                            background: "rgba(255, 215, 0, 0.05)",
                                            border: "1px solid rgba(255, 215, 0, 0.2)",
                                        }}
                                    >
                                        <strong style={{ fontSize: "15px", color: "#fff", display: "block", marginBottom: "8px" }}>
                                            {card.name}
                                        </strong>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "13px", background: "rgba(255,255,255,0.02)", padding: "8px 10px", borderRadius: "8px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--text-dim)" }}>Bought Value:</span>
                                                <span style={{ color: "var(--text-main)", fontWeight: "600", fontFamily: "var(--font-mono)" }}>🪙 {card.boughtPrice !== undefined && card.boughtPrice !== null ? card.boughtPrice : (card.basePrice || 0)}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--accent-gold)", fontWeight: "600" }}>Market Value:</span>
                                                <span style={{ color: "#ffd700", fontWeight: "800", fontFamily: "var(--font-mono)" }}>🪙 {card.marketValue}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ROUND 4 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <span className="badge badge-purple" style={{ marginBottom: "6px" }}>ROUND 4</span>
                                <h3 style={{ fontSize: "22px" }}>Dual Technical Arena</h3>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Round 4 Earned</span>
                                <div style={{ fontSize: "24px", fontWeight: "800", color: "#c084fc", fontFamily: "var(--font-mono)" }}>
                                    🪙 {team.round4?.totalScore || 0}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                            {/* Game 1: Jumbled Words */}
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <strong style={{ fontSize: "15px" }}>Game 1: Jumbled Technical Words</strong>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                        🪙 {team.round4?.game1Score || 0}
                                    </span>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r4g1Session.status === "completed" ? (
                                        false ? (null) : (
                                            <div style={{ padding: "10px", fontSize: "13px", textAlign: "center", color: "var(--text-dim)", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px" }}>
                                                ✅ Completed
                                            </div>
                                        )
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(1, 4, "Round 4 Game 1: Jumbled Words")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r4g1Session.status === "running" ? "Resume Jumbled Words →" : "Start Jumbled Words →"}
                                            </button>
                                            {eventStatus?.quizAnswersVisible && (r4g1Session.hasPreviousAnswers || team.round4?.game1Score > 0) && (
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => openReviewModal(1, 4, "Round 4 Game 1: Jumbled Words")}
                                                    style={{ width: "100%", padding: "8px", fontSize: "12px", borderColor: "rgba(52, 211, 153, 0.4)", color: "#34d399" }}
                                                >
                                                    Check Word Answers 📝
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Game 2: Resistance Challenge */}
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <strong style={{ fontSize: "15px" }}>Game 2: Resistance Challenge</strong>
                                    <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                        🪙 {team.round4?.game2Score || 0}
                                    </span>
                                </div>
                                
                                <div style={{ fontSize: "12px", color: "var(--text-dim)", padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", textAlign: "center" }}>
                                    {team.round4?.game2Score > 0 ? `✅ Evaluated (${team.round4.game2Score} Coins)` : "⏳ Awaiting Admin Evaluation"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 5: FINAL AUCTION & PROBLEM DEFENSE */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                            <div>
                                <span className="badge badge-rose" style={{ marginBottom: "6px" }}>ROUND 5</span>
                                <h3 style={{ fontSize: "22px" }}>Final Problem Defense</h3>
                            </div>
                            <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                                Defense Score: <strong style={{ color: "var(--accent-gold)" }}>🪙 {team.round5?.finalEvaluationScore || 0}</strong>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                                    Assigned Problem Statement
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", marginTop: "8px" }}>
                                    {team.problemStatement || team.round5?.problemStatement || "⏳ Bidding in progress during Round 5 Auction"}
                                </div>
                                {team.round5?.auctionCoinsSpent > 0 && (
                                    <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--text-dim)", background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "8px" }}>
                                        Coins Spent in Auction: <strong style={{ color: "var(--accent-red)" }}>- 🪙{team.round5.auctionCoinsSpent}</strong>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: "20px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                                    Physical Defense Status
                                </div>
                                <div style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
                                    {team.round5?.finalEvaluationScore > 0
                                        ? `✅ Completed: Awarded ${team.round5.finalEvaluationScore} Tech Coins (${team.round5.matchedCardsCount || 0}/3 Cards Matched)`
                                        : "⏳ Judges will test how your Problem Statement matches your Tech Cards (3/3=100, 2/3=65, 1/3=30, 0=0)"}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* PIN Code Verification Modal */}
            <PinModal
                isOpen={pinModalOpen}
                onClose={() => setPinModalOpen(false)}
                onSubmit={handlePinSubmit}
                gameTitle={activeGame.title}
                loading={verifyingPin}
                error={pinError}
            />

            {/* Quiz Answers Review Modal */}
            <QuizReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                game={reviewGame.game}
                round={reviewGame.round}
                gameTitle={reviewGame.title}
            />
        </div>
    );
}

export default ParticipantDashboard;
