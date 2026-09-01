import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("teams"); // 'teams' | 'controls' | 'r1g2_arena' | 'content'
    const [teams, setTeams] = useState([]);
    const [search, setSearch] = useState("");
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Selected Team for Modals & Arena
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [r4g2ModalOpen, setR4g2ModalOpen] = useState(false);
    const [r5ModalOpen, setR5ModalOpen] = useState(false);

    // R1G2 Judge Arena State
    const [imageSets, setImageSets] = useState([]);
    const [arenaTeamId, setArenaTeamId] = useState("");
    const [arenaSetNumber, setArenaSetNumber] = useState(1); // 1=Set A, 2=Set B, 3=Set C
    const [arenaQuestionIdx, setArenaQuestionIdx] = useState(0); // 0 to 3
    const [visibleImagesCount, setVisibleImagesCount] = useState(1); // 1 to 4
    const [arenaScores, setArenaScores] = useState({ 0: null, 1: null, 2: null, 3: null });

    // Resistor Challenge (R4G2) State
    const [r4g2TotalCoins, setR4g2TotalCoins] = useState(150);

    // Tech Cards Assignment State
    const [cardsCatalog, setCardsCatalog] = useState([]);
    const [selectedCardName, setSelectedCardName] = useState("");
    const [cardBoughtValue, setCardBoughtValue] = useState("70");
    const [cardMarketValue, setCardMarketValue] = useState("70");

    // Tech Card CRUD State (Content Manager)
    const [editingTechCard, setEditingTechCard] = useState(null);
    const [techCardForm, setTechCardForm] = useState({
        name: "",
        basePrice: 70,
        totalCount: 4,
        description: "",
    });

    // R5 Auction & Defense State
    const [problemCatalog, setProblemCatalog] = useState([]);
    const [selectedProblemTitle, setSelectedProblemTitle] = useState("");
    const [auctionSpent, setAuctionSpent] = useState("50");
    const [matchedCardsCount, setMatchedCardsCount] = useState("3");

    // Content Manager State
    const [contentSubTab, setContentSubTab] = useState("imagesets"); // 'imagesets' | 'r1g1' | 'r1g3' | 'r4g1' | 'cards' | 'problems'
    const [questions, setQuestions] = useState([]);
    const [editingImageSetNumber, setEditingImageSetNumber] = useState(1);
    const [editableImageSet, setEditableImageSet] = useState(null);

    // Styled Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        itemHighlight: "",
        confirmText: "Delete",
        confirmType: "danger",
        onConfirm: () => {},
    });

    const triggerConfirm = ({
        title = "Confirm Action",
        message = "Are you sure you want to proceed? This action cannot be undone.",
        itemHighlight = "",
        confirmText = "Delete",
        confirmType = "danger",
        onConfirm,
    }) => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            itemHighlight,
            confirmText,
            confirmType,
            onConfirm: async () => {
                try {
                    await onConfirm();
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    // New Question Form State
    const [newQuestion, setNewQuestion] = useState({
        game: 1,
        round: 1,
        questionNumber: 1,
        questionType: "mcq",
        question: "",
        codeSnippet: "",
        jumbledWord: "",
        hint: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
        techCoins: 20,
        timeLimit: 10,
    });

    const loadAllData = async () => {
        try {
            setLoading(true);
            const [teamsData, settingsData, setsData, cardsData, probData, qData] = await Promise.all([
                api.getAllTeams(search),
                api.getEventSettings(),
                api.getImageSets(),
                api.getTechCardsCatalog(),
                api.getProblemStatementsCatalog(),
                api.getQuestions(),
            ]);

            setTeams(teamsData.teams || []);
            setSettings(settingsData.settings || {});
            setImageSets(setsData.sets || []);
            setCardsCatalog(cardsData.cards || []);
            setProblemCatalog(probData.statements || []);
            setQuestions(qData.questions || []);

            if (teamsData.teams?.length > 0 && !arenaTeamId) {
                setArenaTeamId(teamsData.teams[0]._id);
            }
            if (cardsData.cards?.length > 0 && !selectedCardName) {
                setSelectedCardName(cardsData.cards[0].name);
                setCardMarketValue(cardsData.cards[0].basePrice !== undefined ? cardsData.cards[0].basePrice : cardsData.cards[0].marketValue);
            }
            if (probData.statements?.length > 0 && !selectedProblemTitle) {
                setSelectedProblemTitle(probData.statements[0].title);
            }
            if (setsData.sets?.length > 0) {
                const found = setsData.sets.find((s) => s.setNumber === editingImageSetNumber) || setsData.sets[0];
                setEditableImageSet(JSON.parse(JSON.stringify(found)));
            }
        } catch (err) {
            console.error("Admin data load error:", err);
            setError(err.message || "Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, [search]);

    // Switch editable set in Content Manager
    useEffect(() => {
        if (imageSets.length > 0) {
            const found = imageSets.find((s) => s.setNumber === editingImageSetNumber);
            if (found) {
                setEditableImageSet(JSON.parse(JSON.stringify(found)));
            }
        }
    }, [editingImageSetNumber, imageSets]);

    // Random PIN Generator Helper
    const generateRandomPin = (field) => {
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const updated = { ...settings, [field]: pin };
        setSettings(updated);
        handleUpdateSettings({ [field]: pin });
    };

    // Update settings (Toggles & PINs)
    const handleUpdateSettings = async (updates) => {
        try {
            setActionLoading(true);
            const res = await api.updateEventSettings({ ...settings, ...updates });
            setSettings(res.settings);
            setMessage("Settings saved successfully!");
        } catch (err) {
            setError(err.message || "Failed to update settings");
        } finally {
            setActionLoading(false);
        }
    };

    // Recalculate Ranks
    const handleRecalculateRanks = async () => {
        try {
            setActionLoading(true);
            setError("");
            await api.recalculateRanks();
            setMessage("Deterministic ranks and final scores recalculated!");
            await loadAllData();
        } catch (err) {
            setError(err.message || "Rank recalculation failed");
        } finally {
            setActionLoading(false);
        }
    };

    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
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
            const baseVal = selectedCardObj ? (selectedCardObj.basePrice !== undefined ? selectedCardObj.basePrice : selectedCardObj.marketValue) : 50;

            existingCards.push({
                name: selectedCardName,
                basePrice: Number(baseVal),
                boughtPrice: Number(cardBoughtValue),
                marketValue: Number(cardMarketValue),
                category: selectedCardObj ? selectedCardObj.category : "Hardware / Software",
            });

            const res = await api.assignTechCards({
                teamId: selectedTeam._id,
                techCards: existingCards,
            });

            setSelectedTeam(res.team);
            setMessage(`Assigned ${selectedCardName} (Bought: 🪙 ${cardBoughtValue} | Market: 🪙 ${cardMarketValue}) to ${selectedTeam.teamName}!`);
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

    // -------------------------------------------------------------
    // R5 AUCTION & DEFENSE SCORING
    // -------------------------------------------------------------
    const handleScoreR5 = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            await api.assignAuctionStatement({
                teamId: selectedTeam._id,
                problemStatement: selectedProblemTitle,
                auctionCoinsSpent: Number(auctionSpent),
            });

            await api.scoreFinalEvaluation({
                teamId: selectedTeam._id,
                matchedCardsCount: Number(matchedCardsCount),
            });

            setMessage(`Round 5 Final Auction & Defense scored for ${selectedTeam.teamName}!`);
            setR5ModalOpen(false);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Round 5 scoring failed");
        } finally {
            setActionLoading(false);
        }
    };

    // -------------------------------------------------------------
    // IMAGE SET IMAGE FILE UPLOADER (Base64)
    // -------------------------------------------------------------
    const handleImageFileUpload = (qIdx, imgIdx, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = { ...editableImageSet };
            if (!updated.questions[qIdx]) return;
            if (!updated.questions[qIdx].images) updated.questions[qIdx].images = [];
            updated.questions[qIdx].images[imgIdx] = reader.result;
            setEditableImageSet(updated);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveImageSet = async () => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");
            await api.saveImageSet(editableImageSet);
            setMessage(`${editableImageSet.setName} saved successfully!`);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to save Image Set");
        } finally {
            setActionLoading(false);
        }
    };

    // -------------------------------------------------------------
    // QUESTION MANAGEMENT
    // -------------------------------------------------------------
    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            await api.saveQuestion(newQuestion);
            setMessage("Question created successfully!");
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to save question");
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Confirmation State
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const confirmDeleteQuestion = async () => {
        if (!deleteConfirmId) return;
        try {
            setActionLoading(true);
            await api.deleteQuestion(deleteConfirmId);
            setMessage("Question deleted successfully!");
            setDeleteConfirmId(null);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to delete question");
        } finally {
            setActionLoading(false);
        }
    };

    // -------------------------------------------------------------
    // TECH CARD CRUD (Content Manager)
    // -------------------------------------------------------------
    const handleSaveTechCard = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const payload = {
                id: editingTechCard?._id,
                name: techCardForm.name.trim(),
                basePrice: Number(techCardForm.basePrice),
                marketValue: editingTechCard ? Number(editingTechCard.marketValue || techCardForm.basePrice) : Number(techCardForm.basePrice),
                totalCount: Number(techCardForm.totalCount || 4),
                description: techCardForm.description.trim(),
            };

            await api.saveTechCard(payload);

            setMessage(
                editingTechCard
                    ? `Tech Card "${techCardForm.name}" updated successfully!`
                    : `Tech Card "${techCardForm.name}" created successfully!`
            );

            setEditingTechCard(null);
            setTechCardForm({
                name: "",
                basePrice: 70,
                totalCount: 4,
                description: "",
            });

            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to save Tech Card");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditTechCard = (card) => {
        setEditingTechCard(card);
        setTechCardForm({
            name: card.name,
            basePrice: card.basePrice !== undefined ? card.basePrice : card.marketValue || 70,
            totalCount: card.totalCount !== undefined ? card.totalCount : 4,
            description: card.description || "",
        });
        setContentSubTab("cards");
        // Smooth scroll to top of content area
        window.scrollTo({ top: 300, behavior: "smooth" });
    };

    const handleCancelEditTechCard = () => {
        setEditingTechCard(null);
        setTechCardForm({
            name: "",
            basePrice: 70,
            totalCount: 4,
            description: "",
        });
    };

    const handleDeleteTechCard = (id, name) => {
        triggerConfirm({
            title: "Delete Tech Card",
            message: "Are you sure you want to permanently delete this Tech Card from the catalog? It will no longer be available in Round 2 live auctions.",
            itemHighlight: name,
            confirmText: "Delete Tech Card",
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");
                    await api.deleteTechCard(id);
                    setMessage(`Tech Card "${name}" deleted successfully!`);
                    if (editingTechCard?._id === id) {
                        handleCancelEditTechCard();
                    }
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to delete Tech Card");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

    const handleDeleteQuestion = (id, questionText) => {
        triggerConfirm({
            title: "Delete Question",
            message: "Are you sure you want to permanently delete this competition question?",
            itemHighlight: questionText,
            confirmText: "Delete Question",
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");
                    await api.deleteQuestion(id);
                    setMessage("Question deleted successfully!");
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to delete question");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

    const handleDeleteProblemStatement = (id, title) => {
        triggerConfirm({
            title: "Delete Problem Statement",
            message: "Are you sure you want to permanently delete this problem statement from the Round 5 catalog?",
            itemHighlight: title,
            confirmText: "Delete Statement",
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");
                    await api.deleteProblemStatement(id);
                    setMessage(`Problem statement "${title}" deleted successfully!`);
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to delete problem statement");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

    if (loading && !settings) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Loading administrator console...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 20px 80px", width: "100%" }}>
                
                {/* Admin Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "28px",
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-purple">ADMIN CONSOLE</span>
                            <span className="badge badge-gold">IEEE VTS TECH BID 2026</span>
                        </div>
                        <h1 style={{ fontSize: "28px", margin: 0 }}>
                            Event Management & Scoring Center
                        </h1>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button
                            onClick={handleRecalculateRanks}
                            className="btn-primary"
                            disabled={actionLoading}
                            style={{ padding: "10px 18px", fontSize: "13px" }}
                        >
                            ⚡ Recalculate Ranks
                        </button>
                        <Link
                            to="/projector"
                            target="_blank"
                            className="btn-secondary"
                            style={{ padding: "10px 18px", fontSize: "13px", borderColor: "#c084fc", color: "#c084fc" }}
                        >
                            📽️ Projector View
                        </Link>
                    </div>
                </div>

                {message && (
                    <div style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        color: "#34d399",
                        padding: "12px 18px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        marginBottom: "20px",
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.35)",
                        color: "#fb7185",
                        padding: "12px 18px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        marginBottom: "20px",
                    }}>
                        {error}
                    </div>
                )}

                {/* Main Navigation Tabs */}
                <div style={{
                    display: "flex",
                    gap: "8px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    paddingBottom: "14px",
                    marginBottom: "28px",
                    overflowX: "auto",
                }}>
                    {[
                        { id: "teams", label: `👥 Teams & Scoring (${teams.length})` },
                        { id: "controls", label: "🎮 Game Controls & PINs" },
                        { id: "r1g2_arena", label: "🖼️ Round 1 Game 2 Judge Arena" },
                        { id: "content", label: "📚 Content & Questions Manager" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 18px",
                                borderRadius: "10px",
                                background: activeTab === tab.id ? "rgba(0, 240, 255, 0.15)" : "rgba(255, 255, 255, 0.04)",
                                border: activeTab === tab.id ? "1px solid var(--primary)" : "1px solid transparent",
                                color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
                                fontWeight: "700",
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ========================================================================= */}
                {/* TAB 1: TEAMS CARDS GRID (Mobile-friendly) */}
                {/* ========================================================================= */}
                {activeTab === "teams" && (
                    <div>
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
                        {teams.length === 0 ? (
                            <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-dim)" }}>
                                No teams registered yet.
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "20px",
                            }}>
                                {teams.map((t) => (
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
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            setSelectedTeam(t);
                                            setDetailsModalOpen(true);
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
                                                    <strong style={{ color: "var(--primary)" }}>Leader:</strong> {t.leader?.name || "None"} ({t.leader?.registerNumber || "Reg. Pending"})
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
                                                onClick={() => {
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
                                                    onClick={() => {
                                                        setArenaTeamId(t._id);
                                                        setActiveTab("r1g2_arena");
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px" }}
                                                >
                                                    🖼️ Score R1G2
                                                </button>
                                                <button
                                                    onClick={() => {
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
                                                    onClick={() => {
                                                        setSelectedTeam(t);
                                                        const available = cardsCatalog.filter(
                                                            (c) => !(t.techCards || []).some((tc) => tc.name?.trim().toLowerCase() === c.name?.trim().toLowerCase())
                                                        );
                                                        const target = available.length > 0 ? available[0] : (cardsCatalog[0] || null);
                                                        if (target) {
                                                            setSelectedCardName(target.name);
                                                            const bVal = target.basePrice !== undefined ? target.basePrice : 50;
                                                            const mVal = target.marketValue !== undefined ? target.marketValue : bVal;
                                                            setCardBoughtValue(bVal);
                                                            setCardMarketValue(mVal);
                                                        }
                                                        setCardModalOpen(true);
                                                    }}
                                                    className="btn-secondary"
                                                    style={{ padding: "8px", fontSize: "12px", borderColor: "rgba(255, 215, 0, 0.3)", color: "var(--accent-gold)" }}
                                                >
                                                    🎴 Tech Cards
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTeam(t);
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
                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: GAME CONTROLS & PIN GENERATION */}
                {/* ========================================================================= */}
                {activeTab === "controls" && settings && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                        
                        {/* Round 1 Game 1 Quiz Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>ROUND 1 • GAME 1</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Speed Quiz Game</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Multiple Choice Questions • 10s Timer • 20 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r1g1Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r1g1Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r1g1Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r1g1Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r1g1Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r1g1Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r1g1Enabled: !settings.r1g1Enabled, r1g1Pin: settings.r1g1Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r1g1Enabled ? "Disable Quiz Game" : "Enable Quiz Game"}
                                </button>
                            </div>
                        </div>

                        {/* Round 1 Game 3 Code Debugging Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>ROUND 1 • GAME 3</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Code Output & Debugging</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Programming Snippets • 10s Timer • 20 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r1g3Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r1g3Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r1g3Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r1g3Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r1g3Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r1g3Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r1g3Enabled: !settings.r1g3Enabled, r1g3Pin: settings.r1g3Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r1g3Enabled ? "Disable Code Game" : "Enable Code Game"}
                                </button>
                            </div>
                        </div>

                        {/* Round 4 Game 1 Jumbled Words Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-purple" style={{ marginBottom: "10px" }}>ROUND 4 • GAME 1</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Jumbled Technical Words</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Technical Words • 15s Timer • 30 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r4g1Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r4g1Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r4g1Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r4g1Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r4g1Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r4g1Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r4g1Enabled: !settings.r4g1Enabled, r4g1Pin: settings.r4g1Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r4g1Enabled ? "Disable Jumbled Game" : "Enable Jumbled Game"}
                                </button>
                            </div>
                        </div>

                        {/* Leaderboard Visibility Control */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-gold" style={{ marginBottom: "10px" }}>PARTICIPANT LEADERBOARD</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Rankings Visibility</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                Control whether participants can see ranks and standings
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Current Visibility:</span>
                                    <span className={settings.leaderboardVisible ? "badge badge-emerald" : "badge badge-purple"}>
                                        {settings.leaderboardVisible ? "VISIBLE TO ALL" : "HIDDEN (ADMIN ONLY)"}
                                    </span>
                                </div>

                                <button
                                    className={settings.leaderboardVisible ? "btn-secondary" : "btn-gold"}
                                    onClick={() => handleUpdateSettings({ leaderboardVisible: !settings.leaderboardVisible })}
                                    disabled={actionLoading}
                                >
                                    {settings.leaderboardVisible ? "Hide Rankings from Participants" : "Reveal Rankings to Participants 🏆"}
                                </button>
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================================= */}
                {/* TAB 3: ROUND 1 GAME 2 JUDGE ARENA (Interactive evaluation flow) */}
                {/* ========================================================================= */}
                {activeTab === "r1g2_arena" && (
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
                                            {t.teamName} (Leader: {t.leader?.name} — Current Coins: 🪙{t.techCoins})
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

                                    {/* Secret Admin Answer Box */}
                                    <div style={{
                                        background: "rgba(255, 215, 0, 0.1)",
                                        border: "1px solid rgba(255, 215, 0, 0.3)",
                                        padding: "8px 16px",
                                        borderRadius: "10px",
                                    }}>
                                        <span style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: "700", textTransform: "uppercase" }}>
                                            Admin Secret Answer:
                                        </span>
                                        <div style={{ fontSize: "16px", fontWeight: "900", color: "#fff", fontFamily: "var(--font-mono)" }}>
                                            {currentQuestion.technicalTerm}
                                        </div>
                                    </div>
                                </div>

                                {/* Images Slides Grid (Shows visible images side-by-side) */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: `repeat(auto-fit, minmax(${visibleImagesCount === 1 ? '340px' : '220px'}, 1fr))`,
                                    gap: "16px",
                                    marginBottom: "24px",
                                }}>
                                    {currentQuestion.images.slice(0, visibleImagesCount).map((imgUrl, imgIdx) => (
                                        <div
                                            key={imgIdx}
                                            style={{
                                                borderRadius: "12px",
                                                overflow: "hidden",
                                                background: "#000",
                                                border: "1px solid rgba(0, 240, 255, 0.3)",
                                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
                                                position: "relative",
                                            }}
                                        >
                                            <div style={{
                                                position: "absolute",
                                                top: "8px",
                                                left: "8px",
                                                background: "rgba(0, 0, 0, 0.75)",
                                                color: "var(--primary)",
                                                padding: "2px 8px",
                                                borderRadius: "6px",
                                                fontSize: "11px",
                                                fontWeight: "800",
                                            }}>
                                                Image {imgIdx + 1}
                                            </div>
                                            <img
                                                src={imgUrl}
                                                alt={`Slide ${imgIdx + 1}`}
                                                style={{
                                                    width: "100%",
                                                    height: visibleImagesCount === 1 ? "320px" : "220px",
                                                    objectFit: "cover",
                                                    display: "block",
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
                )}

                {/* ========================================================================= */}
                {/* TAB 4: CONTENT & QUESTION MANAGER */}
                {/* ========================================================================= */}
                {activeTab === "content" && (
                    <div>
                        {/* Sub-tabs for content */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto" }}>
                            {[
                                { id: "imagesets", label: "🖼️ R1G2 Image Sets Editor" },
                                { id: "r1g1", label: "📝 R1G1 Speed Quiz (10 Qs)" },
                                { id: "r1g3", label: "💻 R1G3 Code Debugging (10 Qs)" },
                                { id: "r4g1", label: "🔤 R4G1 Jumbled Words (10 Qs)" },
                                { id: "cards", label: "🎴 Tech Cards Catalog" },
                                { id: "problems", label: "🎯 Problem Statements" },
                            ].map((st) => (
                                <button
                                    key={st.id}
                                    onClick={() => setContentSubTab(st.id)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        background: contentSubTab === st.id ? "var(--primary)" : "rgba(255, 255, 255, 0.04)",
                                        color: contentSubTab === st.id ? "#000" : "var(--text-muted)",
                                        border: "none",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        {/* SUBTAB 1: IMAGE SETS EDITOR */}
                        {contentSubTab === "imagesets" && editableImageSet && (
                            <div className="glass-card" style={{ padding: "32px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {[1, 2, 3].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setEditingImageSetNumber(num)}
                                                className={editingImageSetNumber === num ? "btn-primary" : "btn-secondary"}
                                                style={{ padding: "8px 16px", fontSize: "13px" }}
                                            >
                                                Edit Set {num === 1 ? "A" : num === 2 ? "B" : "C"}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveImageSet}
                                        className="btn-gold"
                                        disabled={actionLoading}
                                        style={{ padding: "10px 24px" }}
                                    >
                                        💾 Save Image Set Changes
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                                    {editableImageSet.questions?.map((q, qIdx) => (
                                        <div
                                            key={qIdx}
                                            style={{
                                                background: "rgba(255, 255, 255, 0.02)",
                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                borderRadius: "14px",
                                                padding: "24px",
                                            }}
                                        >
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "18px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "4px" }}>
                                                        Question {qIdx + 1} Technical Term (Answer)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q.technicalTerm}
                                                        onChange={(e) => {
                                                            const updated = { ...editableImageSet };
                                                            updated.questions[qIdx].technicalTerm = e.target.value;
                                                            setEditableImageSet(updated);
                                                        }}
                                                        style={{ fontWeight: "700" }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "4px" }}>
                                                        Hint / Category
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q.hint || ""}
                                                        onChange={(e) => {
                                                            const updated = { ...editableImageSet };
                                                            updated.questions[qIdx].hint = e.target.value;
                                                            setEditableImageSet(updated);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* 4 Images Upload & Preview */}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                                                {[0, 1, 2, 3].map((imgIdx) => (
                                                    <div
                                                        key={imgIdx}
                                                        style={{
                                                            background: "#000",
                                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                                            borderRadius: "10px",
                                                            padding: "12px",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between",
                                                        }}
                                                    >
                                                        <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "800", marginBottom: "6px" }}>
                                                            Slide Image {imgIdx + 1}
                                                        </div>

                                                        {q.images?.[imgIdx] ? (
                                                            <img
                                                                src={q.images[imgIdx]}
                                                                alt={`Q${qIdx + 1} Img ${imgIdx + 1}`}
                                                                style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }}
                                                            />
                                                        ) : (
                                                            <div style={{ height: "110px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", fontSize: "12px" }}>
                                                                No Image
                                                            </div>
                                                        )}

                                                        <div>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageFileUpload(qIdx, imgIdx, e)}
                                                                style={{ fontSize: "11px", padding: "4px" }}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="or Paste Image URL"
                                                                value={q.images?.[imgIdx] || ""}
                                                                onChange={(e) => {
                                                                    const updated = { ...editableImageSet };
                                                                    if (!updated.questions[qIdx].images) updated.questions[qIdx].images = [];
                                                                    updated.questions[qIdx].images[imgIdx] = e.target.value;
                                                                    setEditableImageSet(updated);
                                                                }}
                                                                style={{ fontSize: "11px", marginTop: "6px", padding: "6px 8px" }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 2, 3, 4: QUESTIONS (R1G1, R1G3, R4G1) */}
                        {(contentSubTab === "r1g1" || contentSubTab === "r1g3" || contentSubTab === "r4g1") && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                
                                {/* Add Question Form */}
                                <div className="glass-card" style={{ padding: "28px" }}>
                                    <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>
                                        Add New Question for {contentSubTab.toUpperCase()}
                                    </h3>

                                    <form onSubmit={handleSaveQuestion} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Round</label>
                                                <input
                                                    type="number"
                                                    value={contentSubTab === "r4g1" ? 4 : 1}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Game</label>
                                                <input
                                                    type="number"
                                                    value={contentSubTab === "r1g3" ? 3 : 1}
                                                    readOnly
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Question Number</label>
                                                <input
                                                    type="number"
                                                    value={newQuestion.questionNumber}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, questionNumber: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Time Limit (Seconds)</label>
                                                <input
                                                    type="number"
                                                    value={newQuestion.timeLimit}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, timeLimit: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Tech Coins</label>
                                                <input
                                                    type="number"
                                                    value={newQuestion.techCoins}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, techCoins: Number(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Question Prompt</label>
                                            <input
                                                type="text"
                                                placeholder="Enter question text..."
                                                value={newQuestion.question}
                                                onChange={(e) => setNewQuestion({
                                                    ...newQuestion,
                                                    game: contentSubTab === "r1g3" ? 3 : 1,
                                                    round: contentSubTab === "r4g1" ? 4 : 1,
                                                    questionType: contentSubTab === "r1g3" ? "code" : contentSubTab === "r4g1" ? "jumbled" : "mcq",
                                                    question: e.target.value,
                                                })}
                                                required
                                            />
                                        </div>

                                        {contentSubTab === "r1g3" && (
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Code Snippet</label>
                                                <textarea
                                                    rows="3"
                                                    value={newQuestion.codeSnippet}
                                                    onChange={(e) => setNewQuestion({ ...newQuestion, codeSnippet: e.target.value })}
                                                    style={{ fontFamily: "var(--font-mono)" }}
                                                />
                                            </div>
                                        )}

                                        {contentSubTab === "r4g1" && (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                <div>
                                                    <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Jumbled Word Letters</label>
                                                    <input
                                                        type="text"
                                                        value={newQuestion.jumbledWord}
                                                        onChange={(e) => setNewQuestion({ ...newQuestion, jumbledWord: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Hint</label>
                                                    <input
                                                        type="text"
                                                        value={newQuestion.hint}
                                                        onChange={(e) => setNewQuestion({ ...newQuestion, hint: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                                            <div>
                                                <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Option A</label>
                                                <input type="text" value={newQuestion.options.A} onChange={(e) => setNewQuestion({ ...newQuestion, options: { ...newQuestion.options, A: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Option B</label>
                                                <input type="text" value={newQuestion.options.B} onChange={(e) => setNewQuestion({ ...newQuestion, options: { ...newQuestion.options, B: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Option C</label>
                                                <input type="text" value={newQuestion.options.C} onChange={(e) => setNewQuestion({ ...newQuestion, options: { ...newQuestion.options, C: e.target.value } })} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Option D</label>
                                                <input type="text" value={newQuestion.options.D} onChange={(e) => setNewQuestion({ ...newQuestion, options: { ...newQuestion.options, D: e.target.value } })} />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Correct Answer (A / B / C / D)</label>
                                            <input type="text" value={newQuestion.correctAnswer} onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })} required />
                                        </div>

                                        <button type="submit" className="btn-primary" disabled={actionLoading}>
                                            Save Question →
                                        </button>
                                    </form>
                                </div>

                                {/* Filtered Questions List */}
                                <div className="glass-card" style={{ padding: "28px" }}>
                                    <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>
                                        Existing Questions
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {questions
                                            .filter((q) => {
                                                if (contentSubTab === "r1g1") return q.round === 1 && q.game === 1;
                                                if (contentSubTab === "r1g3") return q.round === 1 && q.game === 3;
                                                if (contentSubTab === "r4g1") return q.round === 4 && q.game === 1;
                                                return true;
                                            })
                                            .map((q) => (
                                                <div
                                                    key={q._id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        padding: "12px 16px",
                                                        borderRadius: "10px",
                                                        background: "rgba(255, 255, 255, 0.02)",
                                                        border: "1px solid rgba(255, 255, 255, 0.06)",
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                                                            <span className="badge badge-cyan" style={{ fontSize: "10px" }}>Q{q.questionNumber}</span>
                                                            <span className="badge badge-gold" style={{ fontSize: "10px" }}>🪙 {q.techCoins} Coins</span>
                                                            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>⏱️ {q.timeLimit || 10}s | Correct: {q.correctAnswer}</span>
                                                        </div>
                                                        <div style={{ fontSize: "14px", color: "#fff" }}>
                                                            {q.question}
                                                        </div>
                                                    </div>
                                                    <button onClick={() => handleDeleteQuestion(q._id, q.question)} className="btn-danger" style={{ padding: "6px 12px", fontSize: "11px" }}>
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 5: TECH CARDS */}
                        {contentSubTab === "cards" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* Form for Creating / Editing Tech Card */}
                                <div className="glass-card" style={{ padding: "28px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span className="badge badge-gold">ROUND 2 AUCTION</span>
                                            <h3 style={{ fontSize: "18px", margin: 0 }}>
                                                {editingTechCard ? "✏️ Edit Tech Card" : "➕ Create New Tech Card"}
                                            </h3>
                                        </div>
                                        {editingTechCard && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEditTechCard}
                                                className="btn-secondary"
                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                            >
                                                ✕ Cancel Edit
                                            </button>
                                        )}
                                    </div>

                                    <form onSubmit={handleSaveTechCard} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                                                    Card Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Solid-State LiDAR 360"
                                                    value={techCardForm.name}
                                                    onChange={(e) => setTechCardForm({ ...techCardForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                                                    Base Value (🪙 Tech Coins) *
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 70"
                                                    min="0"
                                                    value={techCardForm.basePrice}
                                                    onChange={(e) => setTechCardForm({ ...techCardForm, basePrice: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                                                    Total Card Quantity (Stock) *
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="e.g. 4"
                                                    min="1"
                                                    value={techCardForm.totalCount}
                                                    onChange={(e) => setTechCardForm({ ...techCardForm, totalCount: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                                                Description / Specifications (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Brief overview or hardware specification..."
                                                value={techCardForm.description}
                                                onChange={(e) => setTechCardForm({ ...techCardForm, description: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                            <button type="submit" className="btn-primary" disabled={actionLoading} style={{ padding: "10px 24px" }}>
                                                {actionLoading ? "Saving..." : editingTechCard ? "Update Tech Card →" : "Create Tech Card →"}
                                            </button>
                                            {editingTechCard && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEditTechCard}
                                                    className="btn-secondary"
                                                    style={{ padding: "10px 18px" }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Existing Tech Cards Catalog Grid */}
                                <div className="glass-card" style={{ padding: "28px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                                        <div>
                                            <h3 style={{ fontSize: "18px", margin: 0 }}>Tech Cards Catalog</h3>
                                            <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                                Baseline assets for Round 2 live auction. Market value automatically updates when allotted to teams. Count decreases on allotment.
                                            </span>
                                        </div>
                                        <span className="badge badge-gold">{cardsCatalog.length} Total Cards</span>
                                    </div>

                                    {cardsCatalog.length === 0 ? (
                                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                            🎴 No Tech Cards in catalog yet. Use the form above to create one!
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                                            {cardsCatalog.map((c) => {
                                                const totalStock = c.totalCount !== undefined ? c.totalCount : 4;
                                                const allottedTeamsCount = (teams || []).reduce((acc, t) => {
                                                    const hasCard = (t.techCards || []).some((tc) => tc.name?.trim() === c.name?.trim());
                                                    return hasCard ? acc + 1 : acc;
                                                }, 0);
                                                const remaining = c.remainingCount !== undefined ? c.remainingCount : Math.max(0, totalStock - allottedTeamsCount);

                                                return (
                                                    <div
                                                        key={c._id}
                                                        style={{
                                                            padding: "20px",
                                                            borderRadius: "12px",
                                                            background: "rgba(255, 215, 0, 0.04)",
                                                            border: editingTechCard?._id === c._id ? "1px solid var(--accent-gold)" : "1px solid rgba(255, 215, 0, 0.18)",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            justifyContent: "space-between",
                                                            boxShadow: editingTechCard?._id === c._id ? "0 0 15px rgba(255, 215, 0, 0.2)" : "none",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        <div>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                                                                <span className={remaining > 0 ? "badge badge-emerald" : "badge badge-rose"} style={{ fontSize: "11px", fontWeight: "700" }}>
                                                                    {remaining > 0 ? `📦 ${remaining} / ${totalStock} Available` : `🚫 0 / ${totalStock} Left (Sold Out)`}
                                                                </span>
                                                                {allottedTeamsCount > 0 && (
                                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: "600" }}>
                                                                        {allottedTeamsCount} Allotted
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <strong style={{ fontSize: "16px", color: "#fff", display: "block", marginBottom: "6px" }}>
                                                                {c.name}
                                                            </strong>

                                                            {c.description && (
                                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
                                                                    {c.description}
                                                                </p>
                                                            )}

                                                            <div style={{
                                                                marginTop: "12px",
                                                                padding: "10px 14px",
                                                                background: "rgba(255, 255, 255, 0.03)",
                                                                borderRadius: "10px",
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                gap: "6px",
                                                            }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                                                    <span style={{ color: "var(--text-dim)" }}>Base Value:</span>
                                                                    <span style={{ color: "var(--text-main)", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                                                                        🪙 {c.basePrice !== undefined ? c.basePrice : c.marketValue}
                                                                    </span>
                                                                </div>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                                                    <span style={{ color: "var(--accent-gold)", fontWeight: "600" }}>Market Value:</span>
                                                                    <span style={{ color: "#ffd700", fontWeight: "900", fontSize: "15px", fontFamily: "var(--font-mono)" }}>
                                                                        🪙 {c.marketValue !== undefined ? c.marketValue : c.basePrice}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditTechCard(c)}
                                                                className="btn-secondary"
                                                                style={{ flex: 1, padding: "7px 10px", fontSize: "12px", fontWeight: "600" }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteTechCard(c._id, c.name)}
                                                                className="btn-danger"
                                                                style={{ padding: "7px 14px", fontSize: "12px", fontWeight: "600" }}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 6: PROBLEM STATEMENTS */}
                        {contentSubTab === "problems" && (
                            <div className="glass-card" style={{ padding: "28px" }}>
                                <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Problem Statements</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    {problemCatalog.map((p) => (
                                        <div key={p._id} style={{ padding: "18px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
                                                <div style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700" }}>CHALLENGE #{p.statementNumber} • {p.category}</div>
                                                <button
                                                    onClick={() => handleDeleteProblemStatement(p._id, p.title)}
                                                    className="btn-danger"
                                                    style={{ padding: "4px 10px", fontSize: "11px" }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                            <h4 style={{ fontSize: "16px", color: "#fff", margin: "0 0 6px 0" }}>{p.title}</h4>
                                            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

            </div>

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
                                    <span style={{ color: "var(--text-dim)" }}>Final Evaluation Score:</span>
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
                            <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "6px" }}>
                                Assigned Problem Statement
                            </h4>
                            <div style={{ fontSize: "14px", color: "#fff" }}>
                                {selectedTeam.problemStatement || "None assigned yet (Pending Round 5 Auction)"}
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
                                            <div>
                                                <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "4px" }}>
                                                    Select Tech Card from Catalog
                                                </label>
                                                <select
                                                    value={selectedCardName}
                                                    onChange={(e) => {
                                                        setSelectedCardName(e.target.value);
                                                        const c = cardsCatalog.find((card) => card.name === e.target.value);
                                                        if (c) {
                                                            setCardBoughtValue(c.basePrice !== undefined ? c.basePrice : 50);
                                                            setCardMarketValue(c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50));
                                                        }
                                                    }}
                                                >
                                                    {availableCardsForTeam.map((c) => {
                                                        const totalStock = c.totalCount !== undefined ? c.totalCount : 4;
                                                        const allotted = (teams || []).reduce((acc, t) => {
                                                            const hasCard = (t.techCards || []).some((tc) => tc.name?.trim() === c.name?.trim());
                                                            return hasCard ? acc + 1 : acc;
                                                        }, 0);
                                                        const remaining = c.remainingCount !== undefined ? c.remainingCount : Math.max(0, totalStock - allotted);

                                                        return (
                                                            <option key={c._id} value={c.name}>
                                                                {c.name} — Base: 🪙 {c.basePrice} | Market: 🪙 {c.marketValue} ({remaining} Left)
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>

                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "4px" }}>
                                                        Bought Value (🪙 Paid in Auction) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={cardBoughtValue}
                                                        onChange={(e) => setCardBoughtValue(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "12px", color: "var(--accent-gold)", fontWeight: "600", marginBottom: "4px" }}>
                                                        Market Value (🪙 Asset Worth) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={cardMarketValue}
                                                        onChange={(e) => setCardMarketValue(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ fontSize: "11px", color: "var(--text-dim)", lineHeight: 1.5, background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "8px" }}>
                                                💡 <strong>Coins Effect:</strong> Team coins are reduced by 🪙 {cardBoughtValue || 0} (auction purchase) and increased by 🪙 {(Number(cardMarketValue || 0) - Number(cardBoughtValue || 0))} (appreciation margin).
                                            </div>

                                            <button type="submit" className="btn-gold" disabled={actionLoading} style={{ padding: "12px", marginTop: "4px" }}>
                                                {actionLoading ? "Assigning..." : "Assign Tech Card to Team →"}
                                            </button>
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
            {r5ModalOpen && selectedTeam && (
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
                    <div className="glass-card" style={{ maxWidth: "500px", width: "100%", padding: "32px", position: "relative" }}>
                        <button
                            onClick={() => setR5ModalOpen(false)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}
                        >
                            ✕
                        </button>

                        <span className="badge badge-gold" style={{ marginBottom: "8px" }}>ROUND 5</span>
                        <h3 style={{ fontSize: "22px", marginBottom: "4px" }}>Grand Auction & Defense</h3>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                            Final scoring for <strong style={{ color: "#fff" }}>{selectedTeam.teamName}</strong>
                        </p>

                        <form onSubmit={handleScoreR5} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "4px" }}>
                                    Assigned Problem Statement
                                </label>
                                <select
                                    value={selectedProblemTitle}
                                    onChange={(e) => setSelectedProblemTitle(e.target.value)}
                                >
                                    {problemCatalog.map((p) => (
                                        <option key={p._id} value={p.title}>
                                            #{p.statementNumber}: {p.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Auction Coins Spent</label>
                                    <input
                                        type="number"
                                        value={auctionSpent}
                                        onChange={(e) => setAuctionSpent(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: "11px", color: "var(--text-dim)" }}>Tech Cards Matched</label>
                                    <select
                                        value={matchedCardsCount}
                                        onChange={(e) => setMatchedCardsCount(e.target.value)}
                                    >
                                        <option value="3">3/3 Matched (100 Coins)</option>
                                        <option value="2">2/3 Matched (50 Coins)</option>
                                        <option value="1">1/3 Matched (25 Coins)</option>
                                        <option value="0">0 Matched (0 Coins)</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-gold" disabled={actionLoading} style={{ padding: "12px", marginTop: "8px" }}>
                                {actionLoading ? "Recording..." : "Record Round 5 Scores →"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Styled Confirmation Modal for All Delete / Destructive Actions */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                itemHighlight={confirmModal.itemHighlight}
                confirmText={confirmModal.confirmText}
                confirmType={confirmModal.confirmType}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                loading={actionLoading}
            />

        </div>
    );
}

export default AdminDashboard;
