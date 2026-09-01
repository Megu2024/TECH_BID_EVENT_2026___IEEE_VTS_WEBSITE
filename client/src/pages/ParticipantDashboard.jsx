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

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            await refreshTeam();
            const statusData = await api.getEventStatus();
            setEventStatus(statusData);
            setLeaderboardVisible(statusData.leaderboardVisible);

            // Fetch session completion statuses
            try {
                const s1 = await api.getGameSessionStatus(1, 1);
                setR1g1Session(s1);
            } catch (e) {
                console.error("R1G1 session status error", e);
            }

            try {
                const s3 = await api.getGameSessionStatus(3, 1);
                setR1g3Session(s3);
            } catch (e) {
                console.error("R1G3 session status error", e);
            }

            try {
                const s4 = await api.getGameSessionStatus(1, 4);
                setR4g1Session(s4);
            } catch (e) {
                console.error("R4G1 session status error", e);
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

                {/* Main Stats Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                    marginBottom: "32px",
                }}>
                    {/* Live Tech Coins Card */}
                    <div className="glass-card" style={{
                        padding: "28px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(255, 215, 0, 0.3)",
                        boxShadow: "0 0 25px rgba(255, 215, 0, 0.1)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Active Tech Coins
                            </span>
                            <span style={{ fontSize: "28px" }}>🪙</span>
                        </div>
                        <div style={{ fontSize: "44px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                            {team.techCoins || 0}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            Available for Round 2 & Round 5 Auctions
                        </div>
                    </div>

                    {/* Final Score Card */}
                    <div className="glass-card" style={{
                        padding: "28px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(0, 240, 255, 0.3)",
                        boxShadow: "0 0 25px rgba(0, 240, 255, 0.1)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Total Competition Score
                            </span>
                            <span style={{ fontSize: "28px" }}>⭐</span>
                        </div>
                        <div style={{ fontSize: "44px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                            {team.finalScore || 0}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            Coins + Tech Card Values + Final Defense
                        </div>
                    </div>

                    {/* Leaderboard Rank Card */}
                    <div className="glass-card" style={{
                        padding: "28px",
                        background: "linear-gradient(135deg, rgba(16, 23, 42, 0.9) 0%, rgba(30, 41, 69, 0.9) 100%)",
                        border: "1px solid rgba(138, 43, 226, 0.3)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Leaderboard Rank
                            </span>
                            <span style={{ fontSize: "28px" }}>🏆</span>
                        </div>
                        <div style={{ fontSize: "44px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                            {leaderboardVisible && team.rank ? `#${team.rank}` : "—"}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            {leaderboardVisible
                                ? <Link to="/leaderboard" style={{ color: "var(--primary)", fontWeight: "600" }}>View Full Leaderboard →</Link>
                                : "Official Rankings hidden by Admin"}
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
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                    15 Multiple Choice Questions • 10s per question • 20 Tech Coins / Q
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r1g1Session.status === "completed" ? (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => openReviewModal(1, 1, "Round 1 Game 1: Technical Quiz")}
                                            style={{ width: "100%", padding: "10px", fontSize: "13px", borderColor: "#34d399", color: "#34d399" }}
                                        >
                                            Check Quiz Answers 📝
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(1, 1, "Round 1 Game 1: Technical Quiz")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r1g1Session.status === "running" ? "Resume Technical Quiz →" : "Start Technical Quiz →"}
                                            </button>
                                            {(r1g1Session.hasPreviousAnswers || team.round1?.game1Score > 0) && (
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => openReviewModal(1, 1, "Round 1 Game 1: Technical Quiz")}
                                                    style={{ width: "100%", padding: "8px", fontSize: "12px", borderColor: "rgba(52, 211, 153, 0.4)", color: "#34d399" }}
                                                >
                                                    Check Quiz Answers 📝
                                                </button>
                                            )}
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
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                    Physical evaluation administered directly by Admin judges (1-4 words scoring).
                                </p>
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
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                    Fast-paced code snippets, syntax analysis, and debugging challenges.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r1g3Session.status === "completed" ? (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => openReviewModal(3, 1, "Round 1 Game 3: Code Output & Debugging")}
                                            style={{ width: "100%", padding: "10px", fontSize: "13px", borderColor: "#34d399", color: "#34d399" }}
                                        >
                                            Check Code Answers 📝
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(3, 1, "Round 1 Game 3: Code Output & Debugging")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r1g3Session.status === "running" ? "Resume Code Challenge →" : "Start Code Challenge →"}
                                            </button>
                                            {(r1g3Session.hasPreviousAnswers || team.round1?.game3Score > 0) && (
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
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                    Unscramble high-level vehicular, embedded, and software terminology.
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {r4g1Session.status === "completed" ? (
                                        <button
                                            className="btn-secondary"
                                            onClick={() => openReviewModal(1, 4, "Round 4 Game 1: Jumbled Words")}
                                            style={{ width: "100%", padding: "10px", fontSize: "13px", borderColor: "#34d399", color: "#34d399" }}
                                        >
                                            Check Word Answers 📝
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-primary"
                                                onClick={() => openGameModal(1, 4, "Round 4 Game 1: Jumbled Words")}
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                {r4g1Session.status === "running" ? "Resume Jumbled Words →" : "Start Jumbled Words →"}
                                            </button>
                                            {(r4g1Session.hasPreviousAnswers || team.round4?.game1Score > 0) && (
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
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
                                    Practical circuit calculation & multimeter evaluation administered by Admin judges.
                                </p>
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
                                    <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--accent-rose)" }}>
                                        Coins Spent in Auction: -🪙 {team.round5.auctionCoinsSpent}
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
                                        : "⏳ Judges will test how your Problem Statement matches your Tech Cards (3/3=100, 2/3=50, 1/3=25, 0=0)"}
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
