import { useState, useEffect } from "react";
import api from "../../services/api";

function ArenaManager({
    teams,
    imageSets,
    setImageSets,
    arenaTeamId,
    setArenaTeamId,
    activeTab,
    actionLoading,
    setActionLoading,
    setError,
    setMessage,
    loadAllData
}) {

    const [arenaSetNumber, setArenaSetNumber] = useState(1); // 1=Set A, 2=Set B, 3=Set C
    const [arenaQuestionIdx, setArenaQuestionIdx] = useState(0); // 0 to 3
    const [visibleImagesCount, setVisibleImagesCount] = useState(1); // 1 to 4
    const [arenaScores, setArenaScores] = useState({ 0: null, 1: null, 2: null, 3: null });
    const [showArenaAnswer, setShowArenaAnswer] = useState(false);

    useEffect(() => {
        if (activeTab === "r1g2_arena") {
            const hasFullImages = imageSets.some((s) => s.questions?.some((q) => q.images && q.images.length > 0));
            if (!hasFullImages) {
                const refreshImageSets = async () => {
                    try {
                        const setsData = await api.getImageSets();
                        setImageSets(setsData.sets || []);
                    } catch (err) {
                        console.error("Image sets refresh error:", err);
                    }
                };
                refreshImageSets();
            }
        }
    }, [activeTab, imageSets, setImageSets]);

        // R1G2 ARENA EVALUATION FLOW
    // -------------------------------------------------------------
    const currentSet = imageSets.find((s) => s.setNumber === Number(arenaSetNumber)) || imageSets[0];
    const currentQuestion = currentSet?.questions?.[arenaQuestionIdx];

    const handleAwardR1G2Score = (coins) => {
        setArenaScores({
            ...arenaScores,
            [arenaQuestionIdx]: coins,
        });

        // If there's another question, advance; else stay
        if (arenaQuestionIdx < (currentSet?.questions?.length || 4) - 1) {
            setArenaQuestionIdx(arenaQuestionIdx + 1);
            setVisibleImagesCount(1);
            setShowArenaAnswer(false);
        }
    };

    const handleSaveR1G2FinalTotal = async () => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const totalR1G2Coins = Object.values(arenaScores).reduce((sum, val) => sum + (Number(val) || 0), 0);

            await api.scoreR1G2({
                teamId: arenaTeamId,
                setNumber: arenaSetNumber,
                coinsEarned: totalR1G2Coins,
            });

            setMessage(`Round 1 Game 2 successfully evaluated! Awarded 🪙 ${totalR1G2Coins} Tech Coins.`);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to save Round 1 Game 2 score");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
                            {/* ========================================================================= */}
                <div className="glass-card" style={{ padding: "32px" }}>

                        {/* Arena Top Selectors */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "28px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", color: "var(--accent-gold)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>
                                    1. Select Team Being Evaluated:
                                </label>
                                <select
                                    value={arenaTeamId}
                                    onChange={(e) => {
                                        setArenaTeamId(e.target.value);
                                        setArenaScores({ 0: null, 1: null, 2: null, 3: null });
                                    }}
                                    style={{ fontSize: "15px", fontWeight: "600" }}
                                >
                                    {teams.map((t) => (
                                        <option key={t._id} value={t._id}>
                                            {t.teamName} (Leader: {t.leader?.name || "N/A"})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", color: "var(--primary)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>
                                    2. Pick Image Set for this Team:
                                </label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {[
                                        { num: 1, label: "Set A" },
                                        { num: 2, label: "Set B" },
                                        { num: 3, label: "Set C" },
                                    ].map((s) => (
                                        <button
                                            key={s.num}
                                            type="button"
                                            onClick={() => {
                                                setArenaSetNumber(s.num);
                                                setArenaQuestionIdx(0);
                                                setVisibleImagesCount(1);
                                                setShowArenaAnswer(false);
                                                setArenaScores({ 0: null, 1: null, 2: null, 3: null });
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: "10px",
                                                borderRadius: "8px",
                                                fontWeight: "800",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                background: arenaSetNumber === s.num ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                                                color: arenaSetNumber === s.num ? "#000" : "var(--text-muted)",
                                                border: arenaSetNumber === s.num ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
                                            }}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Question Selector Tabs */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto" }}>
                            {(currentSet?.questions || [1, 2, 3, 4]).map((q, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        setArenaQuestionIdx(idx);
                                        setVisibleImagesCount(1);
                                        setShowArenaAnswer(false);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: "10px 16px",
                                        borderRadius: "8px",
                                        background: arenaQuestionIdx === idx ? "rgba(0, 240, 255, 0.2)" : "rgba(255, 255, 255, 0.03)",
                                        border: arenaQuestionIdx === idx ? "1px solid var(--primary)" : "1px solid rgba(255, 255, 255, 0.08)",
                                        color: arenaQuestionIdx === idx ? "#fff" : "var(--text-muted)",
                                        fontWeight: "700",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Question {idx + 1} {arenaScores[idx] !== null && `(🪙 ${arenaScores[idx]})`}
                                </button>
                            ))}
                        </div>

                        {/* Active Question Display & Progressive Image Reveal */}
                        {currentQuestion ? (
                            <div style={{
                                background: "rgba(0, 0, 0, 0.4)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                borderRadius: "16px",
                                padding: "28px",
                                marginBottom: "28px",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                    <div>
                                        <span className="badge badge-cyan" style={{ marginBottom: "6px" }}>
                                            {currentSet.setName} • QUESTION {arenaQuestionIdx + 1} OF 4
                                        </span>
                                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                                            Showing <strong style={{ color: "var(--primary)" }}>{visibleImagesCount} of 4</strong> Images to Participants
                                        </div>
                                    </div>

                                    {/* Secret Admin Answer Box (Hidden by default until revealed) */}
                                    <div style={{
                                        background: showArenaAnswer ? "rgba(255, 215, 0, 0.15)" : "rgba(255, 215, 0, 0.07)",
                                        border: showArenaAnswer ? "1px solid rgba(255, 215, 0, 0.5)" : "1px solid rgba(255, 215, 0, 0.25)",
                                        padding: "8px 14px",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}>
                                        <div>
                                            <span style={{ fontSize: "10.5px", color: "var(--accent-gold)", fontWeight: "800", textTransform: "uppercase", display: "block" }}>
                                                Admin Secret Answer:
                                            </span>
                                            {showArenaAnswer ? (
                                                <div style={{ fontSize: "17px", fontWeight: "900", color: "#ffd700", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                                                    {currentQuestion.technicalTerm}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "1px" }}>
                                                    🔒 Hidden
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowArenaAnswer(!showArenaAnswer)}
                                            className={showArenaAnswer ? "btn-secondary" : "btn-gold"}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                borderRadius: "6px",
                                                fontWeight: "800",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {showArenaAnswer ? "🙈 Hide" : "👁️ View Answer"}
                                        </button>
                                    </div>
                                </div>

                                {/* Images Slides Grid (2x2 Grid Layout for maximum clarity) */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: visibleImagesCount === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                                    gap: "20px",
                                    maxWidth: visibleImagesCount === 1 ? "640px" : "100%",
                                    margin: visibleImagesCount === 1 ? "0 auto 24px" : "0 0 24px",
                                }}>
                                    {currentQuestion.images.slice(0, visibleImagesCount).map((imgUrl, imgIdx) => (
                                        <div
                                            key={imgIdx}
                                            style={{
                                                borderRadius: "14px",
                                                overflow: "hidden",
                                                background: "#030712",
                                                border: "1px solid rgba(0, 240, 255, 0.35)",
                                                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.7)",
                                                position: "relative",
                                                height: visibleImagesCount === 1 ? "380px" : "320px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "8px",
                                            }}
                                        >
                                            <div style={{
                                                position: "absolute",
                                                top: "10px",
                                                left: "10px",
                                                background: "rgba(3, 7, 18, 0.85)",
                                                color: "var(--primary)",
                                                border: "1px solid rgba(0, 240, 255, 0.3)",
                                                padding: "3px 10px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                                zIndex: 2,
                                                backdropFilter: "blur(6px)",
                                            }}>
                                                Image {imgIdx + 1}
                                            </div>
                                            <img
                                                src={imgUrl}
                                                alt={`Slide ${imgIdx + 1}`}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    width: "auto",
                                                    height: "auto",
                                                    objectFit: "contain",
                                                    display: "block",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Reveal Next Image Button */}
                                {visibleImagesCount < 4 && (
                                    <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                        <button
                                            type="button"
                                            onClick={() => setVisibleImagesCount(visibleImagesCount + 1)}
                                            className="btn-secondary"
                                            style={{ padding: "10px 24px", fontSize: "14px", borderColor: "var(--primary)", color: "var(--primary)" }}
                                        >
                                            ➕ Team Requested Next Clue (Reveal Image {visibleImagesCount + 1})
                                        </button>
                                    </div>
                                )}

                                {/* Award Coin Buttons based on Image Count */}
                                <div style={{
                                    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                                    paddingTop: "20px",
                                }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", marginBottom: "10px" }}>
                                        Judge Evaluation Action for Question {arenaQuestionIdx + 1}:
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                                        <button
                                            type="button"
                                            onClick={() => handleAwardR1G2Score(100)}
                                            className="btn-gold"
                                            disabled={visibleImagesCount !== 1}
                                            style={{
                                                padding: "12px",
                                                fontSize: "13px",
                                                opacity: visibleImagesCount === 1 ? 1 : 0.4,
                                            }}
                                        >
                                            🏆 Correct on 1st Image (+100 Coins)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAwardR1G2Score(75)}
                                            className="btn-gold"
                                            disabled={visibleImagesCount !== 2}
                                            style={{
                                                padding: "12px",
                                                fontSize: "13px",
                                                opacity: visibleImagesCount === 2 ? 1 : 0.4,
                                            }}
                                        >
                                            ⭐ Correct on 2nd Image (+75 Coins)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAwardR1G2Score(50)}
                                            className="btn-gold"
                                            disabled={visibleImagesCount !== 3}
                                            style={{
                                                padding: "12px",
                                                fontSize: "13px",
                                                opacity: visibleImagesCount === 3 ? 1 : 0.4,
                                            }}
                                        >
                                            ⚡ Correct on 3rd Image (+50 Coins)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAwardR1G2Score(25)}
                                            className="btn-gold"
                                            disabled={visibleImagesCount !== 4}
                                            style={{
                                                padding: "12px",
                                                fontSize: "13px",
                                                opacity: visibleImagesCount === 4 ? 1 : 0.4,
                                            }}
                                        >
                                            🎯 Correct on 4th Image (+25 Coins)
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAwardR1G2Score(0)}
                                            className="btn-danger"
                                            style={{ padding: "12px", fontSize: "13px" }}
                                        >
                                            ❌ Incorrect / 0 Coins
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Arena Score Summary & Save */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "rgba(255, 215, 0, 0.05)",
                            border: "1px solid rgba(255, 215, 0, 0.25)",
                            borderRadius: "14px",
                            padding: "20px 24px",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}>
                            <div>
                                <div style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "700", textTransform: "uppercase" }}>
                                    Accumulated R1G2 Score:
                                </div>
                                <div style={{ fontSize: "28px", fontWeight: "900", color: "#fff", fontFamily: "var(--font-mono)" }}>
                                    🪙 {Object.values(arenaScores).reduce((sum, val) => sum + (Number(val) || 0), 0)} Tech Coins
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                    Q1: {arenaScores[0] ?? "—"} | Q2: {arenaScores[1] ?? "—"} | Q3: {arenaScores[2] ?? "—"} | Q4: {arenaScores[3] ?? "—"}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveR1G2FinalTotal}
                                className="btn-primary"
                                disabled={actionLoading}
                                style={{ padding: "14px 28px", fontSize: "15px" }}
                            >
                                {actionLoading ? "Saving..." : "💾 Save & Record Score to Team"}
                            </button>
                        </div>
                    </div>


                {/* ========================================================================= */}
        </div>
    );
}

export default ArenaManager;
