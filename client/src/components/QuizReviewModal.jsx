import { useEffect, useState } from "react";
import api from "../services/api";

function QuizReviewModal({ isOpen, onClose, game, round, gameTitle }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewData, setReviewData] = useState(null);

    useEffect(() => {
        if (isOpen && game && round) {
            loadReviewData();
        }
    }, [isOpen, game, round]);

    const loadReviewData = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await api.getGameReviewAnswers(game, round);
            setReviewData(data);
        } catch (err) {
            console.error("Failed to load review answers:", err);
            setError(err.message || "Unable to fetch quiz answers review");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.88)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
        }}>
            <div className="glass-card" style={{
                maxWidth: "840px",
                width: "100%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                boxShadow: "0 0 35px rgba(0, 240, 255, 0.15)",
                borderRadius: "20px",
            }}>
                {/* Header */}
                <div style={{
                    padding: "24px 28px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(16, 23, 42, 0.8)",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-cyan">QUIZ ANSWERS REVIEW</span>
                            <span className="badge badge-gold">ROUND {round} • GAME {game}</span>
                        </div>
                        <h2 style={{ fontSize: "22px", margin: 0, color: "#fff" }}>
                            {gameTitle || `Round ${round} Game ${game} Answers`}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            color: "#fff",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            cursor: "pointer",
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1 }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                            Loading quiz performance & official answers...
                        </div>
                    ) : error ? (
                        <div style={{
                            background: "rgba(244, 63, 94, 0.15)",
                            border: "1px solid rgba(244, 63, 94, 0.3)",
                            color: "#fb7185",
                            padding: "16px",
                            borderRadius: "12px",
                            textAlign: "center",
                        }}>
                            {error}
                        </div>
                    ) : reviewData ? (
                        <div>
                            {/* Performance Overview Banner */}
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "16px",
                                marginBottom: "28px",
                                background: "rgba(255, 255, 255, 0.03)",
                                padding: "20px",
                                borderRadius: "14px",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                            }}>
                                <div>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Score Earned</span>
                                    <div style={{ fontSize: "28px", fontWeight: "900", color: "var(--accent-gold)", fontFamily: "var(--font-mono)" }}>
                                        🪙 {reviewData.totalEarnedCoins} Coins
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase" }}>Correct Answers</span>
                                    <div style={{ fontSize: "28px", fontWeight: "900", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                                        ✅ {reviewData.correctCount} / {reviewData.totalQuestions}
                                    </div>
                                </div>
                            </div>

                            {/* Questions Review List */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {reviewData.questions.map((q) => (
                                    <div
                                        key={q.questionNumber}
                                        style={{
                                            background: "rgba(255, 255, 255, 0.02)",
                                            border: q.isCorrect
                                                ? "1px solid rgba(52, 211, 153, 0.3)"
                                                : q.answered
                                                ? "1px solid rgba(244, 63, 94, 0.3)"
                                                : "1px solid rgba(255, 255, 255, 0.08)",
                                            borderRadius: "14px",
                                            padding: "20px",
                                        }}
                                    >
                                        {/* Question Top Header */}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                            <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>
                                                QUESTION #{q.questionNumber}
                                            </span>
                                            <span style={{
                                                fontSize: "12px",
                                                fontWeight: "700",
                                                padding: "4px 10px",
                                                borderRadius: "9999px",
                                                background: q.isCorrect ? "rgba(52, 211, 153, 0.15)" : "rgba(244, 63, 94, 0.15)",
                                                color: q.isCorrect ? "#34d399" : "#fb7185",
                                            }}>
                                                {q.isCorrect ? `+${q.earnedCoins} Coins Earned` : "0 Coins (Incorrect)"}
                                            </span>
                                        </div>

                                        {/* Code snippet or Jumbled word if applicable */}
                                        {q.jumbledWord && (
                                            <div style={{ background: "rgba(138, 43, 226, 0.15)", border: "1px solid rgba(138, 43, 226, 0.3)", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px", fontFamily: "var(--font-mono)", color: "#ffd700", fontSize: "18px", fontWeight: "800", letterSpacing: "0.1em" }}>
                                                Jumbled Word: {q.jumbledWord}
                                            </div>
                                        )}

                                        {q.codeSnippet && (
                                            <div style={{ background: "#000", padding: "12px", borderRadius: "8px", marginBottom: "12px", overflowX: "auto" }}>
                                                <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "13px", color: "#38bdf8" }}>
                                                    <code>{q.codeSnippet}</code>
                                                </pre>
                                            </div>
                                        )}

                                        <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "16px", lineHeight: 1.5 }}>
                                            {q.question}
                                        </h4>

                                        {/* Options Grid */}
                                        {q.options && Object.keys(q.options).length > 0 ? (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                                                {Object.entries(q.options).filter(([k, v]) => Boolean(v)).map(([optKey, optVal]) => {
                                                    const isUserSelected = q.userAnswer === optKey;
                                                    const isCorrectOption = String(q.correctAnswer).trim().toUpperCase() === optKey;

                                                    let optionBg = "rgba(255, 255, 255, 0.03)";
                                                    let optionBorder = "1px solid rgba(255, 255, 255, 0.08)";
                                                    let labelText = "";

                                                    if (isCorrectOption) {
                                                        optionBg = "rgba(52, 211, 153, 0.15)";
                                                        optionBorder = "1px solid rgba(52, 211, 153, 0.5)";
                                                        labelText = isUserSelected ? "✅ Your Answer (Correct)" : "✅ Correct Answer";
                                                    } else if (isUserSelected && !isCorrectOption) {
                                                        optionBg = "rgba(244, 63, 94, 0.15)";
                                                        optionBorder = "1px solid rgba(244, 63, 94, 0.5)";
                                                        labelText = "❌ Your Answer (Incorrect)";
                                                    }

                                                    return (
                                                        <div
                                                            key={optKey}
                                                            style={{
                                                                padding: "12px 16px",
                                                                borderRadius: "10px",
                                                                background: optionBg,
                                                                border: optionBorder,
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "4px",
                                                            }}
                                                        >
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                <strong style={{ fontSize: "14px", color: isCorrectOption ? "#34d399" : isUserSelected ? "#fb7185" : "#fff" }}>
                                                                    {optKey}. {optVal}
                                                                </strong>
                                                            </div>
                                                            {labelText && (
                                                                <span style={{ fontSize: "11px", fontWeight: "700", color: isCorrectOption ? "#34d399" : "#fb7185" }}>
                                                                    {labelText}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Text Answer format (Jumbled / Code) */
                                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255, 255, 255, 0.03)", padding: "12px 16px", borderRadius: "10px" }}>
                                                <div style={{ fontSize: "13px" }}>
                                                    <span style={{ color: "var(--text-muted)" }}>Your Answer: </span>
                                                    <strong style={{ color: q.isCorrect ? "#34d399" : "#fb7185" }}>
                                                        {q.userAnswer || "No Answer Submitted"}
                                                    </strong>
                                                </div>
                                                <div style={{ fontSize: "13px" }}>
                                                    <span style={{ color: "var(--text-muted)" }}>Official Correct Answer: </span>
                                                    <strong style={{ color: "#34d399" }}>
                                                        {q.correctAnswer}
                                                    </strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 28px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                    textAlign: "right",
                    background: "rgba(16, 23, 42, 0.8)",
                }}>
                    <button onClick={onClose} className="btn-secondary" style={{ padding: "10px 24px" }}>
                        Close Review
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuizReviewModal;
