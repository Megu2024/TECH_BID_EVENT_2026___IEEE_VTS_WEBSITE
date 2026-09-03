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
    const [typedAnswer, setTypedAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [roundCompleted, setRoundCompleted] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const timerRef = useRef(null);
    const inputRef = useRef(null);

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
                setTypedAnswer("");
                await fetchScore();
                return;
            }

            if (data.status === "running" && data.question) {
                setError("");
                setQuestion(data.question);
                setCurrentQuestionNumber(data.currentQuestionNumber);
                setTotalQuestions(data.totalQuestions);
                const activeTime = data.remainingSeconds !== undefined ? data.remainingSeconds : (data.question.timeLimit || 10);
                setTimeLeft(activeTime);
                setQuestionDuration(data.question.timeLimit || data.questionDuration || 10);
                setSelectedAnswer(null);
                setTypedAnswer("");
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

        // Immediate visual response: stop timer, save selection, and hide question
        setSelectedAnswer(answerKey);
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Optimistically hide the current question to feel instantaneous
        const prevQuestion = question;
        setQuestion(null);

        try {
            const result = await api.submitAnswer(
                game,
                round,
                prevQuestion.questionNumber,
                answerKey
            );

            // Fetch score in background to save roundtrip latency
            fetchScore().catch(console.error);

            if (result.roundCompleted) {
                setRoundCompleted(true);
                setTimeLeft(0);
                return;
            }

            // Fetch the actual next question from server
            await fetchCurrentQuestion();
        } catch (err) {
            console.error("Submit answer error:", err);
            // If error, restore question or fetch state
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

        // Tell server that frontend rendering is complete and timer should start
        api.startQuestionTimer(game, round).catch(err => console.error("Failed to start server timer", err));

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

    // Auto-focus typing cursor on the answer input box whenever question advances
    useEffect(() => {
        if (question && !roundCompleted && ((round === 4 && game === 1) || question.questionType === "jumbled" || Boolean(question.jumbledWord))) {
            const timer = setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [question?._id, currentQuestionNumber, question?.questionNumber, roundCompleted]);

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

    // --------------------------------------------------------
    // END QUIZ EARLY HANDLERS
    // --------------------------------------------------------
    const handleEndGameEarly = () => {
        setShowConfirmModal(true);
    };

    const confirmEndGameEarly = async () => {
        try {
            setSubmitting(true);
            setShowConfirmModal(false);
            await api.endGame(game, round);
            await fetchScore();
            setRoundCompleted(true);
            setQuestion(null);
            setTimeLeft(0);
        } catch (err) {
            console.error("Error ending game:", err);
            setError(err.message || "Failed to end quiz early");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
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

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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

                        {!roundCompleted && question && (
                            <button
                                type="button"
                                onClick={handleEndGameEarly}
                                disabled={submitting}
                                style={{
                                    padding: "10px 16px",
                                    borderRadius: "12px",
                                    background: "rgba(244, 63, 94, 0.12)",
                                    border: "1px solid rgba(244, 63, 94, 0.4)",
                                    color: "#fb7185",
                                    fontWeight: "700",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                🛑 End Quiz
                            </button>
                        )}
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
                        {(!question.jumbledWord || question.question !== `Unscramble: ${question.jumbledWord}`) && (
                            <h3 style={{
                                fontSize: "22px",
                                lineHeight: 1.4,
                                marginBottom: "28px",
                                color: "#ffffff",
                            }}>
                                {question.question}
                            </h3>
                        )}

                        {/* Choice Mode: Typed Answer Input for Jumbled Words vs MCQ Option Buttons */}
                        {((round === 4 && game === 1) || question.questionType === "jumbled" || Boolean(question.jumbledWord)) ? (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!typedAnswer.trim() || submitting || selectedAnswer !== null) return;
                                    handleAnswerSubmit(typedAnswer.trim());
                                }}
                                style={{
                                    maxWidth: "600px",
                                    margin: "0 auto 32px auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "18px",
                                }}
                            >
                                <div style={{ position: "relative" }}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        autoFocus
                                        placeholder="TYPE THE UNSCRAMBLED WORD HERE..."
                                        value={typedAnswer}
                                        disabled={submitting || selectedAnswer !== null}
                                        onChange={(e) => setTypedAnswer(e.target.value)}
                                        style={{
                                            width: "100%",
                                            padding: "18px 24px",
                                            fontSize: "22px",
                                            fontWeight: "800",
                                            fontFamily: "var(--font-mono)",
                                            letterSpacing: "3px",
                                            textAlign: "center",
                                            textTransform: "uppercase",
                                            borderRadius: "14px",
                                            border: selectedAnswer !== null
                                                ? "2px solid #34d399"
                                                : "2px solid rgba(0, 240, 255, 0.4)",
                                            background: "rgba(0, 0, 0, 0.5)",
                                            color: "#fff",
                                            outline: "none",
                                            boxShadow: selectedAnswer !== null
                                                ? "0 0 25px rgba(52, 211, 153, 0.3)"
                                                : "0 0 25px rgba(0, 240, 255, 0.15)",
                                            transition: "all 0.2s ease",
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!typedAnswer.trim() || submitting || selectedAnswer !== null}
                                    className="btn-primary"
                                    style={{
                                        padding: "16px 32px",
                                        fontSize: "17px",
                                        fontWeight: "800",
                                        letterSpacing: "1px",
                                        borderRadius: "12px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "10px",
                                        cursor: (!typedAnswer.trim() || submitting || selectedAnswer !== null) ? "default" : "pointer",
                                        opacity: (!typedAnswer.trim() || submitting || selectedAnswer !== null) ? 0.6 : 1,
                                    }}
                                >
                                    {submitting ? "SUBMITTING..." : selectedAnswer !== null ? `✓ SUBMITTED: ${selectedAnswer}` : "SUBMIT ANSWER ➔"}
                                </button>
                            </form>
                        ) : (
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
                        )}

                        {/* Value Badge */}
                        <div style={{ textAlign: "center", fontSize: "14px", color: "var(--accent-gold)", fontWeight: "700" }}>
                            🪙 {question.techCoins || 20} Tech Coins for Correct Answer
                        </div>

                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: "60px 32px", textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
                        <div style={{ fontSize: "56px", marginBottom: "16px" }}>⚡</div>
                        <h3 style={{ fontSize: "24px", color: "#fff", marginBottom: "12px" }}>
                            {error ? "Session Notice" : "Preparing Quiz Session"}
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
                            {error || "Unable to retrieve live question. Please launch the quiz from your Participant Dashboard."}
                        </p>
                        <Link to="/dashboard" className="btn-primary" style={{ padding: "12px 28px", fontSize: "14px" }}>
                            Return to Participant Dashboard →
                        </Link>
                    </div>
                )}

            </div>

            {/* In-Website Custom Confirmation Modal */}
            {showConfirmModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.75)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                        padding: "20px",
                    }}
                >
                    <div
                        className="glass-card"
                        style={{
                            maxWidth: "460px",
                            width: "100%",
                            padding: "32px",
                            borderRadius: "20px",
                            border: "1px solid rgba(244, 63, 94, 0.4)",
                            boxShadow: "0 0 40px rgba(244, 63, 94, 0.2)",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "42px", marginBottom: "12px" }}>🛑</div>
                        <h3 style={{ fontSize: "22px", margin: "0 0 10px 0", color: "#fff" }}>
                            End Quiz Early?
                        </h3>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "28px" }}>
                            Are you sure you want to exit the quiz arena? Your current progress will be submitted, and you will receive Tech Coins for the questions answered so far.
                        </p>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1, padding: "12px", fontSize: "14px" }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmEndGameEarly}
                                disabled={submitting}
                                className="btn-primary"
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    fontSize: "14px",
                                    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                                    boxShadow: "0 0 20px rgba(244, 63, 94, 0.4)",
                                }}
                            >
                                {submitting ? "Ending..." : "Yes, End Quiz"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OnlineGame;
