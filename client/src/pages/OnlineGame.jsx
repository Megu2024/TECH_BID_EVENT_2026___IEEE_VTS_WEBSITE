import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function OnlineGame() {
    const { gameId, roundId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const game = Number(gameId || 1);
    const round = Number(roundId || 1);
    const pin = location.state?.pin || "1234";

    const [gameStarted, setGameStarted] = useState(false);
    const [question, setQuestion] = useState(null);
    const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(15);
    const [questionDuration, setQuestionDuration] = useState(10);

    const [timeLeft, setTimeLeft] = useState(10);
    const [score, setScore] = useState(0);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [roundCompleted, setRoundCompleted] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const timerRef = useRef(null);

    // Get game title for header
    const getGameTitle = () => {
        if (round === 1 && game === 1) return "Technical Quiz";
        if (round === 1 && game === 3) return "Code Output & Debugging";
        if (round === 4 && game === 1) return "Jumbled Technical Words";
        return `Round ${round} Game ${game}`;
    };

    // --------------------------------------------------------
    // START OR RESUME GAME SESSION
    // --------------------------------------------------------
    const initGame = async () => {
        try {
            setLoading(true);
            setError("");

            const startData = await api.startGame(game, round, pin);
            setGameStarted(true);
            setTotalQuestions(startData.totalQuestions || 15);
            setQuestionDuration(startData.questionDuration || 10);

            await fetchScore();
            await fetchCurrentQuestion();
        } catch (err) {
            console.error("Game init error:", err);
            setError(err.message || "Failed to start game session");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------------
    // FETCH CURRENT QUESTION (Server Timer Sync)
    // --------------------------------------------------------
    const fetchCurrentQuestion = async () => {
        try {
            const data = await api.getCurrentQuestion(game, round);

            if (data.status === "completed") {
                setRoundCompleted(true);
                setQuestion(null);
                setTimeLeft(0);
                setSelectedAnswer(null);
                await fetchScore();
                return;
            }

            if (data.status === "running" && data.question) {
                setQuestion(data.question);
                setCurrentQuestionNumber(data.currentQuestionNumber);
                setTotalQuestions(data.totalQuestions);
                setTimeLeft(data.remainingSeconds || 10);
                setSelectedAnswer(null);
                setSubmitting(false);
            }
        } catch (err) {
            console.error("Fetch question error:", err);
            setError(err.message || "Error fetching current question");
        }
    };

    // --------------------------------------------------------
    // SUBMIT ANSWER IMMEDIATELY
    // --------------------------------------------------------
    const handleAnswerSubmit = async (answerKey) => {
        if (!question || selectedAnswer !== null || submitting) return;

        // Immediate visual highlight
        setSelectedAnswer(answerKey);
        setSubmitting(true);

        try {
            const result = await api.submitAnswer(
                game,
                round,
                question.questionNumber,
                answerKey
            );

            await fetchScore();

            if (result.roundCompleted) {
                setRoundCompleted(true);
                setQuestion(null);
                setTimeLeft(0);
                return;
            }

            // Immediately advance to next question
            await fetchCurrentQuestion();
        } catch (err) {
            console.error("Submit answer error:", err);
            // If server auto-advanced or rejected, sync question
            await fetchCurrentQuestion();
        } finally {
            setSubmitting(false);
        }
    };

    // --------------------------------------------------------
    // FETCH SCORE
    // --------------------------------------------------------
    const fetchScore = async () => {
        try {
            const scoreData = await api.getTeamScore(game, round);
            setScore(scoreData.totalTechCoins || 0);
        } catch (err) {
            console.error("Fetch score error:", err);
        }
    };

    // --------------------------------------------------------
    // CLIENT TIMER TICK (Synchronized with Server)
    // --------------------------------------------------------
    useEffect(() => {
        if (!gameStarted || !question || roundCompleted) return;

        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [gameStarted, question?.questionNumber, roundCompleted]);

    // --------------------------------------------------------
    // TIMER EXPIRED -> AUTO-ADVANCE
    // --------------------------------------------------------
    useEffect(() => {
        if (!gameStarted || !question || roundCompleted || timeLeft > 0) return;

        const autoAdvance = async () => {
            await fetchCurrentQuestion();
        };

        autoAdvance();
    }, [timeLeft, gameStarted, question, roundCompleted]);

    useEffect(() => {
        initGame();
    }, [game, round]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Entering game arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#060913" }}>
            <Navbar />

            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px 80px", width: "100%", flex: 1 }}>
                
                {/* Header Bar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                    gap: "16px",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-cyan">ROUND {round} • GAME {game}</span>
                            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Live Team Session</span>
                        </div>
                        <h2 style={{ fontSize: "28px", margin: 0 }}>
                            {getGameTitle()}
                        </h2>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "rgba(255, 215, 0, 0.12)",
                        border: "1px solid rgba(255, 215, 0, 0.35)",
                        padding: "10px 20px",
                        borderRadius: "14px",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.15)",
                    }}>
                        <span style={{ fontSize: "20px" }}>🪙</span>
                        <div>
                            <div style={{ fontSize: "11px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "700" }}>
                                Earned Coins
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: "900", fontFamily: "var(--font-mono)", color: "#fff" }}>
                                {score}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        color: "#fb7185",
                        padding: "14px 20px",
                        borderRadius: "12px",
                        marginBottom: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}>
                        <span>{error}</span>
                        <Link to="/dashboard" className="btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }}>
                            Back to Dashboard
                        </Link>
                    </div>
                )}

                {/* ROUND COMPLETED SCREEN */}
                {roundCompleted ? (
                    <div className="glass-card" style={{
                        padding: "60px 32px",
                        textAlign: "center",
                        maxWidth: "600px",
                        margin: "40px auto",
                        border: "1px solid rgba(0, 240, 255, 0.3)",
                        boxShadow: "0 0 40px rgba(0, 240, 255, 0.15)",
                    }}>
                        <div style={{ fontSize: "72px", marginBottom: "16px" }}>🏆</div>
                        <h2 style={{ fontSize: "36px", marginBottom: "8px" }}>Round Complete!</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "16px", marginBottom: "28px" }}>
                            {getGameTitle()} has concluded. Your team's performance has been recorded.
                        </p>

                        <div style={{
                            background: "rgba(255, 215, 0, 0.08)",
                            border: "1px solid rgba(255, 215, 0, 0.25)",
                            borderRadius: "16px",
                            padding: "24px",
                            maxWidth: "320px",
                            margin: "0 auto 32px",
                        }}>
                            <span style={{ fontSize: "13px", color: "var(--accent-gold)", textTransform: "uppercase", fontWeight: "700" }}>
                                Final Game Score
                            </span>
                            <div style={{ fontSize: "48px", fontWeight: "900", color: "#fff", fontFamily: "var(--font-mono)", margin: "6px 0" }}>
                                🪙 {score}
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                Tech Coins Awarded
                            </span>
                        </div>

                        <Link to="/dashboard" className="btn-primary" style={{ padding: "14px 36px", fontSize: "16px" }}>
                            Return to Team Dashboard →
                        </Link>
                    </div>
                ) : question ? (
                    /* ACTIVE QUESTION CARD */
                    <div className="glass-card" style={{ padding: "40px 36px" }}>
                        
                        {/* Progress Bar & Countdown Timer */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "28px",
                        }}>
                            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                                Question <span style={{ color: "var(--primary)" }}>{currentQuestionNumber}</span> of {totalQuestions}
                            </div>

                            {/* Clock badge with pulse effect on low time */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 18px",
                                borderRadius: "9999px",
                                background: timeLeft <= 3 ? "rgba(244, 63, 94, 0.2)" : "rgba(0, 240, 255, 0.12)",
                                border: timeLeft <= 3 ? "1px solid rgba(244, 63, 94, 0.5)" : "1px solid rgba(0, 240, 255, 0.35)",
                                color: timeLeft <= 3 ? "#fb7185" : "var(--primary)",
                                fontWeight: "800",
                                fontSize: "18px",
                                fontFamily: "var(--font-mono)",
                                transition: "all 0.2s ease",
                            }}>
                                <span>⏱️</span>
                                <span>{timeLeft}s</span>
                            </div>
                        </div>

                        {/* Jumbled Word / Code snippet container */}
                        {question.jumbledWord && (
                            <div style={{
                                background: "rgba(138, 43, 226, 0.15)",
                                border: "1px solid rgba(138, 43, 226, 0.4)",
                                borderRadius: "14px",
                                padding: "20px",
                                textAlign: "center",
                                marginBottom: "24px",
                            }}>
                                <div style={{ fontSize: "12px", color: "#c084fc", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.1em" }}>
                                    Jumbled Letters
                                </div>
                                <div style={{
                                    fontSize: "32px",
                                    fontWeight: "900",
                                    fontFamily: "var(--font-mono)",
                                    letterSpacing: "0.3em",
                                    color: "#ffd700",
                                    margin: "10px 0",
                                }}>
                                    {question.jumbledWord}
                                </div>
                                {question.hint && (
                                    <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                        💡 Hint: {question.hint}
                                    </div>
                                )}
                            </div>
                        )}

                        {question.codeSnippet && (
                            <div style={{
                                background: "rgba(0, 0, 0, 0.5)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "12px",
                                padding: "18px",
                                marginBottom: "24px",
                                overflowX: "auto",
                            }}>
                                <pre style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "14px",
                                    color: "#38bdf8",
                                    lineHeight: 1.5,
                                    margin: 0,
                                }}>
                                    <code>{question.codeSnippet}</code>
                                </pre>
                            </div>
                        )}

                        {/* Question Text */}
                        <h3 style={{
                            fontSize: "22px",
                            lineHeight: 1.4,
                            marginBottom: "32px",
                            color: "#ffffff",
                        }}>
                            {question.question}
                        </h3>

                        {/* Option Buttons */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "16px",
                            marginBottom: "28px",
                        }}>
                            {Object.entries(question.options || {}).filter(([k, v]) => Boolean(v)).map(([key, value]) => {
                                const isSelected = selectedAnswer === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleAnswerSubmit(key)}
                                        disabled={submitting || selectedAnswer !== null}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "14px",
                                            padding: "18px 22px",
                                            borderRadius: "14px",
                                            background: isSelected ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.03)",
                                            border: isSelected ? "2px solid var(--primary)" : "1px solid rgba(255, 255, 255, 0.1)",
                                            color: "#ffffff",
                                            fontSize: "16px",
                                            fontWeight: isSelected ? "700" : "500",
                                            cursor: (submitting || selectedAnswer !== null) ? "default" : "pointer",
                                            textAlign: "left",
                                            transition: "all 0.15s ease",
                                            boxShadow: isSelected ? "0 0 20px rgba(0, 240, 255, 0.3)" : "none",
                                            transform: isSelected ? "scale(1.02)" : "none",
                                        }}
                                    >
                                        <span style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            background: isSelected ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                                            color: isSelected ? "#000" : "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: "800",
                                            fontSize: "14px",
                                            fontFamily: "var(--font-mono)",
                                            flexShrink: 0,
                                        }}>
                                            {key}
                                        </span>
                                        <span>{value}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Value Badge */}
                        <div style={{ textAlign: "center", fontSize: "14px", color: "var(--accent-gold)", fontWeight: "700" }}>
                            🪙 {question.techCoins || 20} Tech Coins for Correct Answer
                        </div>

                    </div>
                ) : null}

            </div>
        </div>
    );
}

export default OnlineGame;
