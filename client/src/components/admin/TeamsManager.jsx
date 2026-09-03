import { useState } from "react";
import api from "../../services/api";

function TeamsManager({
    teams,
    setTeams,
    cardsCatalog,
    problemCatalog,
    actionLoading,
    setActionLoading,
    setError,
    setMessage,
    loadAllData,
    triggerConfirm,
    setArenaTeamId,
    setActiveTab,
}) {
        const [search, setSearch] = useState("");
        const [selectedTeam, setSelectedTeam] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [r4g2ModalOpen, setR4g2ModalOpen] = useState(false);
    const [r5ModalOpen, setR5ModalOpen] = useState(false);
        const [r4g2TotalCoins, setR4g2TotalCoins] = useState(150);
    const [selectedCardName, setSelectedCardName] = useState("");
    const [cardBoughtValue, setCardBoughtValue] = useState("70");
        
    const [selectedProblemTitle, setSelectedProblemTitle] = useState("");
    const [auctionSpent, setAuctionSpent] = useState("50");
    const [matchedCardsCount, setMatchedCardsCount] = useState("3");
    const [explanationScore, setExplanationScore] = useState("0");

        const filteredTeams = teams.filter((t) => {
        if (!search || !search.trim()) return true;
        const s = search.trim().toLowerCase();
        return (
            t.teamName?.toLowerCase().includes(s) ||
            t.leader?.name?.toLowerCase().includes(s) ||
            t.leader?.registerNumber?.toLowerCase().includes(s) ||
            (t.members || []).some((m) => m.name?.toLowerCase().includes(s) || m.registerNumber?.toLowerCase().includes(s))
        );
    });

        const handleDeleteTeam = (teamId, teamName) => {
        triggerConfirm({
            title: "Permanently Delete Team?",
            message: `Are you absolutely sure you want to delete team "${teamName}"? This will permanently delete their team profile, all scores, game history, and reset all member accounts so they can register again.`,
            itemHighlight: teamName,
            confirmText: "Yes, Delete Team Permanently",
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    await api.deleteTeam(teamId);
                    setMessage(`Team "${teamName}" and all associated member accounts deleted successfully!`);
                    setDetailsModalOpen(false);
                    setSelectedTeam(null);
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to delete team");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

        // R4G2 RESISTOR SCORING
    // -------------------------------------------------------------
    const handleScoreR4G2 = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");
            await api.scoreR4G2({
                teamId: selectedTeam._id,
                totalScore: Number(r4g2TotalCoins),
            });
            setMessage(`Round 4 Game 2 score recorded: 🪙 ${r4g2TotalCoins} Coins!`);
            setR4g2ModalOpen(false);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Scoring failed");
        } finally {
            setActionLoading(false);
        }
    };

        // TECH CARD ASSIGNMENT & REMOVAL
    // -------------------------------------------------------------
    const handleAssignCard = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const existingCards = [...(selectedTeam.techCards || [])];

            // Prevent duplicate card names on team
            if (existingCards.some((c) => c.name?.trim().toLowerCase() === selectedCardName?.trim().toLowerCase())) {
                setError(`Team "${selectedTeam.teamName}" already possesses "${selectedCardName}". Duplicate cards are not allowed.`);
                setActionLoading(false);
                return;
            }

            const selectedCardObj = cardsCatalog.find((c) => c.name === selectedCardName);
            const baseVal = selectedCardObj ? (selectedCardObj.basePrice !== undefined ? selectedCardObj.basePrice : 50) : 50;
            const currentMarketVal = selectedCardObj ? (selectedCardObj.marketValue !== undefined ? selectedCardObj.marketValue : baseVal) : Number(cardBoughtValue);

            existingCards.push({
                name: selectedCardName,
                basePrice: Number(baseVal),
                boughtPrice: Number(cardBoughtValue),
                marketValue: Number(currentMarketVal),
                category: selectedCardObj ? selectedCardObj.category : "Hardware / Software",
            });

            const res = await api.assignTechCards({
                teamId: selectedTeam._id,
                techCards: existingCards,
            });

            setSelectedTeam(res.team);
            setMessage(`Assigned "${selectedCardName}" (Bought: 🪙 ${cardBoughtValue}) to ${selectedTeam.teamName}!`);
            setCardModalOpen(false);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Card assignment failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveCardFromTeam = (teamId, cardIndex, cardName) => {
        triggerConfirm({
            title: "Remove Tech Card from Team",
            message: `Are you sure you want to remove this Tech Card from team "${selectedTeam?.teamName}"? The team's Tech Coins and ranking will be automatically recalculated.`,
            itemHighlight: cardName,
            confirmText: "Remove Card",
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");

                    const currentCards = (selectedTeam.techCards || []).filter((_, idx) => idx !== cardIndex);

                    const res = await api.assignTechCards({
                        teamId: teamId,
                        techCards: currentCards,
                    });

                    setSelectedTeam(res.team);
                    setMessage(`Removed "${cardName}" from ${selectedTeam.teamName}. Tech coins & ranks updated!`);
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to remove card from team");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

        // R5 AUCTION & DEFENSE SCORING
    // -------------------------------------------------------------
    const handleScoreR5 = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const res = await api.scoreRound5({
                teamId: selectedTeam._id,
                problemStatement: selectedProblemTitle,
                auctionCoinsSpent: Number(auctionSpent || 0),
                matchedCardsCount: Number(matchedCardsCount || 0),
                explanationScore: Number(explanationScore || 0),
            });

            setMessage(`Round 5 Final Auction & Defense scored for ${selectedTeam.teamName}!`);
            setR5ModalOpen(false);
            if (res?.team) {
                setSelectedTeam(res.team);
                setTeams((prev) => prev.map((t) => (t._id === res.team._id ? res.team : t)));
            }
            await loadAllData();
        } catch (err) {
            setError(err.message || "Round 5 scoring failed");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
                            {/* TAB 1: TEAMS CARDS GRID (Mobile-friendly) */}
                {/* ========================================================================= */}
                
                        {/* Search Bar */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "24px",
                            flexWrap: "wrap",
                            gap: "14px",
                        }}>
                            <input
                                type="text"
                                placeholder="🔍 Search teams by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ maxWidth: "340px" }}
                            />

                            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                Showing <strong style={{ color: "#fff" }}>{teams.length}</strong> Registered Teams
                            </div>
                        </div>

                        {/* Teams Grid */}
                        {filteredTeams.length === 0 ? (
                            <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-dim)" }}>
                                {teams.length === 0 ? "No teams registered yet." : "No teams match your search criteria."}
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "20px",
                            }}>
                                {filteredTeams.map((t) => (
                                    <div
                                        key={t._id}
                                        className="glass-card"
                                        style={{
                                            padding: "24px",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            border: t.rank === 1 ? "1px solid rgba(255, 215, 0, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                                            boxShadow: t.rank === 1 ? "0 0 25px rgba(255, 215, 0, 0.12)" : "none",
                                        }}
                                    >
                                        <div>
                                            {/* Card Top */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                        <span className={t.rank === 1 ? "badge badge-gold" : "badge badge-cyan"} style={{ fontSize: "11px" }}>
                                                            {t.rank ? `RANK #${t.rank}` : "UNRANKED"}
                                                        </span>
                                                    </div>
                                                    <h3 style={{ fontSize: "20px", color: "#fff", margin: 0 }}>
                                                        {t.teamName}
                                                    </h3>
                                                </div>

                                                <div style={{
                                                    background: "rgba(255, 215, 0, 0.1)",
                                                    border: "1px solid rgba(255, 215, 0, 0.3)",
                                                    padding: "4px 12px",
                                                    borderRadius: "9999px",
                                                    fontSize: "13px",
                                                    fontWeight: "800",
                                                    color: "#ffd700",
                                                }}>
                                                    🪙 {t.techCoins || 0}
                                                </div>
                                            </div>

                                            {/* Leader & Members */}
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                                                <div>
                                                    <strong style={{ color: "var(--primary)" }}>Leader:</strong> {t.leader?.name || "None"}{t.leader?.registerNumber ? ` (${t.leader.registerNumber})` : ""}
                                                </div>
                                                <div style={{ marginTop: "2px", color: "var(--text-dim)" }}>
                                                    {t.members?.length || 1} Member(s) in roster
                                                </div>
                                            </div>

                                            {/* Scores Matrix Pills */}
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "8px",
                                                background: "rgba(255, 255, 255, 0.02)",
                                                padding: "12px",
                                                borderRadius: "10px",
                                                fontSize: "12px",
                                                marginBottom: "18px",
                                            }}>
                                                <div>
                                                    <span style={{ color: "var(--text-dim)" }}>Round 1 Total:</span>
                                                    <strong style={{ display: "block", color: "var(--primary)", fontSize: "13px" }}>🪙 {t.round1?.totalScore || 0}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: "var(--text-dim)" }}>Tech Cards:</span>
                                                    <strong style={{ display: "block", color: "var(--accent-gold)", fontSize: "13px" }}>{t.techCards?.length || 0} Cards</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: "var(--text-dim)" }}>Round 4 Total:</span>
                                                    <strong style={{ display: "block", color: "#c084fc", fontSize: "13px" }}>🪙 {t.round4?.totalScore || 0}</strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: "var(--text-dim)" }}>Total Score:</span>
                                                    <strong style={{ display: "block", color: "#fff", fontSize: "14px" }}>⭐ {t.finalScore || 0}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTeam(t);
                                                    setDetailsModalOpen(true);
                                                }}
                                                className="btn-primary"
                                                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                                            >
                                                🔍 View Details & Full Breakdown
                                            </button>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailsModalOpen(false);
                                                        setArenaTeamId(t._id);
                                                        setActiveTab("r1g2_arena");
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px" }}
                                                >
                                                    🖼️ Score R1G2
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailsModalOpen(false);
                                                        setSelectedTeam(t);
                                                        setR4g2ModalOpen(true);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px" }}
                                                >
                                                    ⚡ Score R4G2
                                                </button>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailsModalOpen(false);
                                                        setSelectedTeam(t);
                                                        const available = cardsCatalog.filter(
                                                            (c) => !(t.techCards || []).some((tc) => tc.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())
                                                        );
                                                        const target = available.length > 0 ? available[0] : (cardsCatalog[0] || null);
                                                        if (target) {
                                                            setSelectedCardName(target.name);
                                                            const bVal = target.basePrice !== undefined ? target.basePrice : 50;
                                                            setCardBoughtValue(bVal);
                                                        }
                                                        setCardModalOpen(true);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px", borderColor: "rgba(255, 215, 0, 0.3)", color: "var(--accent-gold)" }}
                                                >
                                                    🎴 Tech Cards
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailsModalOpen(false);
                                                        setSelectedTeam(t);
                                                        const existingStatement = t.problemStatement || t.round5?.problemStatement;
                                                        const p = problemCatalog.find((item) => (item.description && item.description === existingStatement) || (item.title && item.title === existingStatement)) || problemCatalog[0];
                                                        
                                                        setSelectedProblemTitle(existingStatement || (p ? (p.description || p.title) : ""));

                                                        // Strictly preserve stored auction purchase coins if available
                                                        if (t.round5?.auctionCoinsSpent !== undefined && t.round5?.auctionCoinsSpent !== null && Number(t.round5.auctionCoinsSpent) >= 0 && existingStatement) {
                                                            setAuctionSpent(String(t.round5.auctionCoinsSpent));
                                                        } else if (t.round5?.auctionCoinsSpent !== undefined && t.round5?.auctionCoinsSpent !== null && Number(t.round5.auctionCoinsSpent) > 0) {
                                                            setAuctionSpent(String(t.round5.auctionCoinsSpent));
                                                        } else if (p) {
                                                            setAuctionSpent(String(p.minBid !== undefined ? p.minBid : (p.baseValue || 50)));
                                                        } else {
                                                            setAuctionSpent("50");
                                                        }

                                                        setMatchedCardsCount(String(t.round5?.matchedCardsCount !== undefined && t.round5?.matchedCardsCount !== null ? t.round5.matchedCardsCount : 3));
                                                        setExplanationScore(String(t.round5?.explanationScore !== undefined && t.round5?.explanationScore !== null ? t.round5.explanationScore : 0));
                                                        setR5ModalOpen(true);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px", borderColor: "rgba(255, 215, 0, 0.3)", color: "var(--accent-gold)" }}
                                                >
                                                    🏆 Round 5
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    
                        {/* ========================================================================= */}
            {/* MODAL 1: TEAM DETAILS MODAL */}
            {/* ========================================================================= */}
            {detailsModalOpen && selectedTeam && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(3, 7, 18, 0.85)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px",
                }}>
                    <div className="glass-card" style={{
                        maxWidth: "680px",
                        width: "100%",
                        padding: "32px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        position: "relative",
                    }}>
                        <button
                            onClick={() => setDetailsModalOpen(false)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <div>
                                <span className="badge badge-gold" style={{ marginBottom: "4px" }}>
                                    {selectedTeam.rank ? `RANK #${selectedTeam.rank}` : "UNRANKED"}
                                </span>
                                <h2 style={{ fontSize: "26px", color: "#fff", margin: 0 }}>
                                    {selectedTeam.teamName}
                                </h2>
                            </div>
                            <div style={{ fontSize: "20px", fontWeight: "900", color: "#ffd700", fontFamily: "var(--font-mono)" }}>
                                🪙 {selectedTeam.techCoins || 0} Coins
                            </div>
                        </div>

                        {/* Leader & Members Roster */}
                        <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px" }}>
                                Team Members Roster
                            </h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {selectedTeam.members?.map((m, idx) => (
                                    <div key={m._id || idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)" }}>
                                        <div>
                                            <strong style={{ color: "#fff", fontSize: "14px" }}>{m.name}</strong>
                                            {m.isLeader && <span className="badge badge-gold" style={{ marginLeft: "8px", fontSize: "10px" }}>LEADER</span>}
                                            <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{m.email}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Scores Breakdown */}
                        <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px" }}>
                                Competition Scoring Breakdown
                            </h4>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 1 Game 1 (Quiz):</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round1?.game1Score || 0}</strong>
                                </div>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 1 Game 2 (Images):</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round1?.game2Score || 0}</strong>
                                </div>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 1 Game 3 (Code):</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round1?.game3Score || 0}</strong>
                                </div>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 4 Game 1 (Jumbled):</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round4?.game1Score || 0}</strong>
                                </div>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 4 Game 2 (Resistor):</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round4?.game2Score || 0}</strong>
                                </div>
                                <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                                    <span style={{ color: "var(--text-dim)" }}>Round 5 Score:</span>
                                    <strong style={{ display: "block", color: "#fff" }}>🪙 {selectedTeam.round5?.finalEvaluationScore || 0}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Tech Cards & Problem Statement */}
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "8px" }}>
                                Tech Cards Possessed ({selectedTeam.techCards?.length || 0})
                            </h4>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {selectedTeam.techCards?.length > 0 ? (
                                    selectedTeam.techCards.map((c, idx) => (
                                        <span
                                            key={idx}
                                            className="badge badge-gold"
                                            style={{
                                                fontSize: "11px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "6px 10px",
                                            }}
                                        >
                                            🎴 {c.name} (Bought: 🪙{c.boughtPrice !== undefined && c.boughtPrice !== null ? c.boughtPrice : (c.basePrice || 0)} | Market: 🪙{c.marketValue})
                                            <button
                                                type="button"
                                                title={`Remove ${c.name} from team`}
                                                onClick={() => handleRemoveCardFromTeam(selectedTeam._id, idx, c.name)}
                                                disabled={actionLoading}
                                                style={{
                                                    background: "rgba(239, 68, 68, 0.25)",
                                                    border: "1px solid rgba(239, 68, 68, 0.5)",
                                                    color: "#fca5a5",
                                                    borderRadius: "50%",
                                                    width: "18px",
                                                    height: "18px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: "10px",
                                                    padding: 0,
                                                    marginLeft: "2px",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>No Tech Cards assigned yet</span>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "8px" }}>
                                Assigned Problem Statement
                            </h4>
                            {selectedTeam.problemStatement || selectedTeam.round5?.problemStatement ? (
                                <div style={{ padding: "12px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                    <p style={{ fontSize: "13.5px", color: "#fff", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                                        🎯 {selectedTeam.problemStatement || selectedTeam.round5?.problemStatement}
                                    </p>
                                    <div style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                        🪙 Bought in Auction: 🪙 {selectedTeam.round5?.auctionCoinsSpent !== undefined ? selectedTeam.round5.auctionCoinsSpent : 0} Tech Coins
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                    None assigned yet (Pending Round 5 Auction)
                                </div>
                            )}
                        </div>

                        {/* Danger Zone: Safely Gated Deletion at Bottom */}
                        <div style={{
                            marginBottom: "24px",
                            padding: "16px 20px",
                            borderRadius: "12px",
                            background: "rgba(239, 68, 68, 0.05)",
                            border: "1px solid rgba(239, 68, 68, 0.25)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                <div>
                                    <strong style={{ fontSize: "13px", color: "#fca5a5", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span>⚠️</span> Danger Zone: Delete Team & Reset Accounts
                                    </strong>
                                    <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: "4px 0 0", lineHeight: 1.4 }}>
                                        Permanently delete this team, scores, and associated member accounts so they can register again from scratch.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteTeam(selectedTeam._id, selectedTeam.teamName)}
                                    disabled={actionLoading}
                                    style={{
                                        background: "rgba(239, 68, 68, 0.2)",
                                        border: "1px solid rgba(239, 68, 68, 0.5)",
                                        color: "#fca5a5",
                                        padding: "8px 16px",
                                        fontSize: "12px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "700",
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.35)";
                                        e.currentTarget.style.color = "#ffffff";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                                        e.currentTarget.style.color = "#fca5a5";
                                    }}
                                >
                                    🗑️ Delete Team Permanently
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setDetailsModalOpen(false)}
                            className="btn-secondary"
                            style={{ width: "100%", padding: "10px" }}
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 2: R4G2 RESISTOR SCORER MODAL */}
            {/* ========================================================================= */}
            {r4g2ModalOpen && selectedTeam && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(3, 7, 18, 0.85)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px",
                }}>
                    <div className="glass-card" style={{ maxWidth: "460px", width: "100%", padding: "32px", position: "relative" }}>
                        <button
                            onClick={() => setR4g2ModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}
                        >
                            ✕
                        </button>

                        <span className="badge badge-purple" style={{ marginBottom: "8px" }}>ROUND 4 • GAME 2</span>
                        <h3 style={{ fontSize: "22px", marginBottom: "4px" }}>Resistance Challenge Scorer</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                            Scoring overall tech coins for <strong style={{ color: "#fff" }}>{selectedTeam.teamName}</strong>
                        </p>

                        <form onSubmit={handleScoreR4G2} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "13px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                    Overall Tech Coins Awarded (0 - 300 Coins)
                                </label>
                                <input
                                    type="number"
                                    value={r4g2TotalCoins}
                                    onChange={(e) => setR4g2TotalCoins(e.target.value)}
                                    style={{ fontSize: "20px", fontWeight: "900", textAlign: "center", fontFamily: "var(--font-mono)" }}
                                    min="0"
                                    max="500"
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                                {[50, 100, 150, 200, 250, 300].map((preset) => (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setR4g2TotalCoins(preset)}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: "6px 0", fontSize: "11px", fontWeight: "700" }}
                                    >
                                        +{preset}
                                    </button>
                                ))}
                            </div>

                            <button type="submit" className="btn-primary" disabled={actionLoading} style={{ marginTop: "10px", padding: "12px" }}>
                                {actionLoading ? "Recording..." : "Record Resistor Score →"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 3: ASSIGN TECH CARD MODAL */}
            {/* ========================================================================= */}
            {cardModalOpen && selectedTeam && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(3, 7, 18, 0.85)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px",
                }}>
                    <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "32px", position: "relative" }}>
                        <button
                            onClick={() => setCardModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}
                        >
                            ✕
                        </button>

                        <span className="badge badge-gold" style={{ marginBottom: "8px" }}>ROUND 2</span>
                        <h3 style={{ fontSize: "22px", marginBottom: "4px" }}>Assign Tech Card</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                            Assign auction card won by <strong style={{ color: "#fff" }}>{selectedTeam.teamName}</strong>
                        </p>

                        {(() => {
                            const availableCardsForTeam = cardsCatalog.filter(
                                (c) => !(selectedTeam.techCards || []).some((tc) => tc.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())
                            );

                            return (
                                <>
                                    {availableCardsForTeam.length === 0 ? (
                                        <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px", color: "var(--text-dim)", fontSize: "13px", textAlign: "center", border: "1px dashed rgba(255, 255, 255, 0.15)" }}>
                                            ✅ This team already possesses all available Tech Cards from the catalog.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleAssignCard} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            {(() => {
                                                const selectedCardObj = cardsCatalog.find((c) => c.name === selectedCardName) || availableCardsForTeam[0];
                                                const totalStock = selectedCardObj ? (selectedCardObj.totalCount !== undefined ? selectedCardObj.totalCount : 4) : 4;
                                                const allotted = (teams || []).reduce((acc, t) => {
                                                    const hasCard = (t.techCards || []).some((tc) => tc.name?.trim() === selectedCardObj?.name?.trim());
                                                    return hasCard ? acc + 1 : acc;
                                                }, 0);
                                                const remaining = selectedCardObj ? (selectedCardObj.remainingCount !== undefined ? selectedCardObj.remainingCount : Math.max(0, totalStock - allotted)) : 0;
                                                const baseVal = selectedCardObj ? (selectedCardObj.basePrice !== undefined ? selectedCardObj.basePrice : 50) : 50;

                                                return (
                                                    <>
                                                        <div>
                                                            <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                                                Choose Tech Card from Available Stock ({availableCardsForTeam.length} Available)
                                                            </label>
                                                            <select
                                                                value={selectedCardName}
                                                                onChange={(e) => {
                                                                    setSelectedCardName(e.target.value);
                                                                    const c = cardsCatalog.find((card) => card.name === e.target.value);
                                                                    if (c) {
                                                                        setCardBoughtValue(c.basePrice !== undefined ? c.basePrice : 50);
                                                                    }
                                                                }}
                                                                style={{ padding: "10px 12px", fontSize: "14px", fontWeight: "600" }}
                                                            >
                                                                {availableCardsForTeam.map((c) => {
                                                                    const cTotal = c.totalCount !== undefined ? c.totalCount : 4;
                                                                    const cAllotted = (teams || []).reduce((acc, t) => {
                                                                        const hasCard = (t.techCards || []).some((tc) => tc.name?.trim() === c.name?.trim());
                                                                        return hasCard ? acc + 1 : acc;
                                                                    }, 0);
                                                                    const cRem = c.remainingCount !== undefined ? c.remainingCount : Math.max(0, cTotal - cAllotted);

                                                                    return (
                                                                        <option key={c._id} value={c.name}>
                                                                            {c.name} — Base Value: 🪙 {c.basePrice !== undefined ? c.basePrice : 50} ({cRem} Left)
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>

                                                        {/* Selected Card Overview Box */}
                                                        {selectedCardObj && (
                                                            <div style={{
                                                                padding: "12px 16px",
                                                                borderRadius: "10px",
                                                                background: "rgba(255, 215, 0, 0.06)",
                                                                border: "1px solid rgba(255, 215, 0, 0.25)",
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                            }}>
                                                                <div>
                                                                    <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Selected Asset</div>
                                                                    <strong style={{ fontSize: "15px", color: "#fff" }}>🎴 {selectedCardObj.name}</strong>
                                                                </div>
                                                                <div style={{ textAlign: "right" }}>
                                                                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Base Value</div>
                                                                    <strong style={{ fontSize: "16px", color: "var(--accent-gold)", fontFamily: "var(--font-mono)" }}>🪙 {baseVal}</strong>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Bought Value Bar */}
                                                        <div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                                <label style={{ fontSize: "13px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                                                    Bought Value (🪙 Paid in Auction) *
                                                                </label>
                                                                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                                                    Default: Base Value (🪙 {baseVal})
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                value={cardBoughtValue}
                                                                onChange={(e) => setCardBoughtValue(e.target.value)}
                                                                placeholder="e.g. 150"
                                                                min="0"
                                                                style={{
                                                                    width: "100%",
                                                                    fontSize: "20px",
                                                                    fontWeight: "900",
                                                                    fontFamily: "var(--font-mono)",
                                                                    textAlign: "center",
                                                                    padding: "10px",
                                                                    color: "#ffd700",
                                                                    background: "rgba(0,0,0,0.4)",
                                                                    border: "1px solid rgba(255, 215, 0, 0.4)",
                                                                    borderRadius: "8px",
                                                                }}
                                                                required
                                                            />
                                                        </div>

                                                        <button type="submit" className="btn-gold" disabled={actionLoading} style={{ padding: "12px", marginTop: "4px" }}>
                                                            {actionLoading ? "Assigning..." : "Assign Tech Card to Team →"}
                                                        </button>
                                                    </>
                                                );
                                            })()}
                                        </form>
                                    )}

                                    {/* Currently Possessed Cards with Remove Option */}
                                    <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                        <label style={{ display: "block", fontSize: "12px", color: "var(--primary)", textTransform: "uppercase", fontWeight: "700", marginBottom: "8px" }}>
                                            Currently Possessed Cards ({selectedTeam.techCards?.length || 0})
                                        </label>
                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                            {(selectedTeam.techCards || []).length > 0 ? (
                                                selectedTeam.techCards.map((c, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="badge badge-gold"
                                                        style={{
                                                            fontSize: "11px",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "6px",
                                                            padding: "5px 9px",
                                                        }}
                                                    >
                                                        🎴 {c.name} (Bought: 🪙{c.boughtPrice !== undefined && c.boughtPrice !== null ? c.boughtPrice : (c.basePrice || 0)} | Market: 🪙{c.marketValue})
                                                        <button
                                                            type="button"
                                                            title={`Remove ${c.name} from team`}
                                                            onClick={() => handleRemoveCardFromTeam(selectedTeam._id, idx, c.name)}
                                                            disabled={actionLoading}
                                                            style={{
                                                                background: "rgba(239, 68, 68, 0.25)",
                                                                border: "1px solid rgba(239, 68, 68, 0.5)",
                                                                color: "#fca5a5",
                                                                borderRadius: "50%",
                                                                width: "16px",
                                                                height: "16px",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                cursor: "pointer",
                                                                fontSize: "9px",
                                                                padding: 0,
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>No cards assigned yet</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: R5 AUCTION & DEFENSE MODAL */}
            {/* ========================================================================= */}
            {r5ModalOpen && selectedTeam && (() => {
                const selectedProblemObj = problemCatalog.find((p) => (p.description && p.description === selectedProblemTitle) || (p.title && p.title === selectedProblemTitle)) || problemCatalog[0];
                const baseVal = selectedProblemObj ? (selectedProblemObj.minBid !== undefined ? selectedProblemObj.minBid : (selectedProblemObj.baseValue || 50)) : 50;

                return (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(3, 7, 18, 0.85)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}>
                        <div className="glass-card" style={{ maxWidth: "520px", width: "100%", padding: "32px", position: "relative" }}>
                            <button
                                onClick={() => setR5ModalOpen(false)}
                                style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}
                            >
                                ✕
                            </button>

                            <span className="badge badge-gold" style={{ marginBottom: "8px" }}>ROUND 5</span>
                            <h3 style={{ fontSize: "22px", marginBottom: "4px" }}>Assign Problem Statement & Score Defense</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                Auction allocation and evaluation for <strong style={{ color: "#fff" }}>{selectedTeam.teamName}</strong>
                            </p>

                            <form onSubmit={handleScoreR5} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {problemCatalog.length === 0 ? (
                                    <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px", color: "var(--text-dim)", fontSize: "13px", textAlign: "center" }}>
                                        ⚠️ No problem statements found in catalog. Please add them in Content Manager first.
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                                Select Problem Statement from Catalog
                                            </label>
                                            <select
                                                value={selectedProblemTitle}
                                                onChange={(e) => {
                                                    setSelectedProblemTitle(e.target.value);
                                                    const found = problemCatalog.find((item) => item.description === e.target.value || item.title === e.target.value);
                                                    if (found && (!auctionSpent || Number(auctionSpent) === 0)) {
                                                        setAuctionSpent(String(found.minBid !== undefined ? found.minBid : (found.baseValue || 50)));
                                                    }
                                                }}
                                                style={{ padding: "10px 12px", fontSize: "13.5px", fontWeight: "600" }}
                                            >
                                                {problemCatalog.map((p) => {
                                                    const pVal = p.minBid !== undefined ? p.minBid : (p.baseValue || 50);
                                                    const total = p.totalCount !== undefined ? p.totalCount : 4;
                                                    const remaining = p.remainingCount !== undefined ? p.remainingCount : total;
                                                    const shortDesc = p.description ? (p.description.length > 55 ? p.description.slice(0, 55) + "..." : p.description) : p.title;
                                                    return (
                                                        <option key={p._id} value={p.description || p.title}>
                                                            Challenge #{p.statementNumber} (Base: 🪙 {pVal}) [{remaining}/{total} Available] — {shortDesc}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>

                                        {/* Selected Statement Preview */}
                                        {selectedProblemObj && (
                                            <div style={{
                                                padding: "12px 16px",
                                                borderRadius: "10px",
                                                background: "rgba(255, 215, 0, 0.06)",
                                                border: "1px solid rgba(255, 215, 0, 0.25)",
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <span className="badge badge-cyan" style={{ fontSize: "10px" }}>CHALLENGE #{selectedProblemObj.statementNumber}</span>
                                                        <span
                                                            className={
                                                                (selectedProblemObj.remainingCount !== undefined ? selectedProblemObj.remainingCount : (selectedProblemObj.totalCount || 4)) > 0
                                                                    ? "badge badge-green"
                                                                    : "badge badge-danger"
                                                            }
                                                            style={{ fontSize: "10px", fontWeight: "700" }}
                                                        >
                                                            📦 {selectedProblemObj.remainingCount !== undefined ? selectedProblemObj.remainingCount : (selectedProblemObj.totalCount || 4)} / {selectedProblemObj.totalCount || 4} Available
                                                        </span>
                                                    </div>
                                                    <span style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "700" }}>Base Value: 🪙 {baseVal}</span>
                                                </div>
                                                <p style={{ fontSize: "13px", color: "#fff", margin: 0, lineHeight: 1.5 }}>
                                                    {selectedProblemObj.description || selectedProblemObj.title}
                                                </p>
                                            </div>
                                        )}

                                        {/* Bought Value Bar */}
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                <label style={{ fontSize: "13px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                                    Bought Value (🪙 Paid in Auction) *
                                                </label>
                                                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                                    Base: 🪙 {baseVal}
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                value={auctionSpent}
                                                onChange={(e) => setAuctionSpent(e.target.value)}
                                                placeholder="e.g. 50"
                                                min="0"
                                                style={{
                                                    width: "100%",
                                                    fontSize: "20px",
                                                    fontWeight: "900",
                                                    fontFamily: "var(--font-mono)",
                                                    textAlign: "center",
                                                    padding: "10px",
                                                    color: "#ffd700",
                                                    background: "rgba(0,0,0,0.4)",
                                                    border: "1px solid rgba(255, 215, 0, 0.4)",
                                                    borderRadius: "8px",
                                                }}
                                                required
                                            />
                                            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "6px" }}>
                                                💡 <strong>Coins Effect:</strong> Team available wallet coins will be reduced by 🪙 {auctionSpent || 0} (auction purchase).
                                            </div>
                                        </div>

                                        {/* Defense Evaluation Scoring */}
                                        <div>
                                            <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                                Defense Evaluation • Tech Cards Matched
                                            </label>
                                            <select
                                                value={matchedCardsCount}
                                                onChange={(e) => setMatchedCardsCount(e.target.value)}
                                                style={{ padding: "10px 12px" }}
                                            >
                                                <option value="3">3/3 Matched (100 Coins)</option>
                                                <option value="2">2/3 Matched (65 Coins)</option>
                                                <option value="1">1/3 Matched (30 Coins)</option>
                                                <option value="0">0 Matched (0 Coins)</option>
                                            </select>
                                        </div>

                                        {/* Defense Explanation / Technical Defense Score */}
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                <label style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "700" }}>
                                                    Defense Explanation & Justification (0 - 50 Coins) *
                                                </label>
                                                <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                                                    Evaluator Score: Max 50 Coins
                                                </span>
                                            </div>
                                            <input
                                                type="number"
                                                value={explanationScore}
                                                onChange={(e) => {
                                                    const raw = e.target.value;
                                                    if (raw === "") {
                                                        setExplanationScore("");
                                                    } else {
                                                        const val = Math.min(50, Math.max(0, Number(raw) || 0));
                                                        setExplanationScore(val);
                                                    }
                                                }}
                                                placeholder="0 - 50"
                                                min="0"
                                                max="50"
                                                style={{
                                                    width: "100%",
                                                    fontSize: "18px",
                                                    fontWeight: "900",
                                                    fontFamily: "var(--font-mono)",
                                                    textAlign: "center",
                                                    padding: "10px",
                                                    color: "var(--primary)",
                                                    background: "rgba(0, 240, 255, 0.05)",
                                                    border: "1px solid rgba(0, 240, 255, 0.35)",
                                                    borderRadius: "8px",
                                                }}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn-gold" disabled={actionLoading} style={{ padding: "12px", marginTop: "4px" }}>
                                            {actionLoading ? "Recording..." : "Assign Statement & Record Round 5 →"}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                );
            })()}


        </div>
    );
}


export default TeamsManager;
