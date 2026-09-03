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
    const [showArenaAnswer, setShowArenaAnswer] = useState(false);

    // Resistor Challenge (R4G2) State
    const [r4g2TotalCoins, setR4g2TotalCoins] = useState(150);

    // Tech Cards Assignment & Market Fluctuation State
    const [cardsCatalog, setCardsCatalog] = useState([]);
    const [selectedCardName, setSelectedCardName] = useState("");
    const [cardBoughtValue, setCardBoughtValue] = useState("70");
    const [marketDraft, setMarketDraft] = useState({});
    const [cardSearchQuery, setCardSearchQuery] = useState("");
    const [techCardsSubView, setTechCardsSubView] = useState("market"); // 'market' | 'catalog'

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
    const [explanationScore, setExplanationScore] = useState("0");

    // Problem Statements CRUD & Bulk Operations State
    const [editingProblemStatement, setEditingProblemStatement] = useState(null);
    const [problemForm, setProblemForm] = useState({
        statementNumber: 1,
        baseValue: 50,
        totalCount: 4,
        description: "",
    });
    const [selectedProblemIds, setSelectedProblemIds] = useState([]);
    const [problemSearchQuery, setProblemSearchQuery] = useState("");

    // Content Manager State
    const [contentSubTab, setContentSubTab] = useState("r1g1"); // 'r1g1' | 'imagesets' | 'r1g3' | 'r4g1' | 'cards' | 'problems'
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [batchTimeInput, setBatchTimeInput] = useState("12");
    const [editingImageSetNumber, setEditingImageSetNumber] = useState(1);
    const [editableImageSet, setEditableImageSet] = useState(null);
    // Multi-Question Coins & Difficulty Matrix State
    const [questionViewMode, setQuestionViewMode] = useState("matrix"); // 'matrix' | 'list'
    const [bulkCoinsDraft, setBulkCoinsDraft] = useState({});
    const [bulkCustomTime, setBulkCustomTime] = useState(12);
    const [savedSuccessId, setSavedSuccessId] = useState(null);

    // Styled Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        itemHighlight: "",
        confirmText: "Delete",
        confirmType: "danger",
        onConfirm: () => { },
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

    const refreshQuestions = async () => {
        try {
            const qData = await api.getQuestions();
            setQuestions(qData.questions || []);
        } catch (err) {
            console.error("Questions refresh error:", err);
        }
    };

    const refreshImageSets = async () => {
        try {
            const setsData = await api.getImageSets();
            setImageSets(setsData.sets || []);
            if (setsData.sets?.length > 0) {
                const found = setsData.sets.find((s) => s.setNumber === editingImageSetNumber) || setsData.sets[0];
                setEditableImageSet(JSON.parse(JSON.stringify(found)));
            }
        } catch (err) {
            console.error("Image sets refresh error:", err);
        }
    };

    const refreshTechCards = async () => {
        try {
            const cardsData = await api.getTechCardsCatalog();
            setCardsCatalog(cardsData.cards || []);
        } catch (err) {
            console.error("Tech cards refresh error:", err);
        }
    };

    const refreshProblems = async () => {
        try {
            const probData = await api.getProblemStatementsCatalog();
            setProblemCatalog(probData.statements || []);
        } catch (err) {
            console.error("Problems refresh error:", err);
        }
    };

    const loadAllData = async (forceSpinner = false) => {
        try {
            // Optimistic fast-load from localStorage
            const cachedData = localStorage.getItem('adminBootstrapCacheOriginal');
            if (cachedData && !forceSpinner) {
                try {
                    const parsed = JSON.parse(cachedData);
                    setTeams(parsed.teams || []);
                    setSettings(parsed.settings || {});
                    setImageSets(parsed.sets || parsed.imageSets || []);
                    setCardsCatalog(parsed.cards || parsed.techCards || []);
                    setProblemCatalog(parsed.statements || parsed.problemCatalog || []);
                    setQuestions(parsed.questions || []);
                    setLoading(false); // Instantly remove loading screen
                } catch(e) {}
            } else if (forceSpinner || !settings) {
                setLoading(true);
            }
            // High-performance single network round-trip (<15ms)
            const data = await api.getAdminBootstrap();
            
            // Cache the fresh data (wrap in try-catch for quota limits)
            try {
                localStorage.setItem('adminBootstrapCacheOriginal', JSON.stringify(data));
            } catch (err) {
                console.warn("Admin cache quota exceeded, skipping local cache.");
            }


            setTeams(data.teams || []);
            setSettings(data.settings || {});
            setImageSets(data.sets || data.imageSets || []);
            setCardsCatalog(data.cards || data.techCards || []);
            setProblemCatalog(data.statements || data.problemCatalog || []);
            setQuestions(data.questions || []);

            if (data.teams?.length > 0 && !arenaTeamId) {
                setArenaTeamId(data.teams[0]._id);
            }
            if (data.cards?.length > 0 && !selectedCardName) {
                setSelectedCardName(data.cards[0].name);
                setCardBoughtValue(data.cards[0].basePrice !== undefined ? data.cards[0].basePrice : (data.cards[0].marketValue || 70));
            }
            if (data.statements?.length > 0 && !selectedProblemTitle) {
                setSelectedProblemTitle(data.statements[0].title);
            }
            if (data.sets?.length > 0) {
                const found = data.sets.find((s) => s.setNumber === editingImageSetNumber) || data.sets[0];
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
    }, []);

    // Instant in-memory team search
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

    // Switch editable set in Content Manager
    useEffect(() => {
        if (imageSets.length > 0) {
            const found = imageSets.find((s) => s.setNumber === editingImageSetNumber);
            if (found) {
                setEditableImageSet(JSON.parse(JSON.stringify(found)));
            }
        }
    }, [editingImageSetNumber, imageSets]);

    // On-demand full image set loading when visiting Arena or Content ImageSets tab
    useEffect(() => {
        if (activeTab === "r1g2_arena" || (activeTab === "content" && contentSubTab === "imagesets")) {
            const hasFullImages = imageSets.some((s) => s.questions?.some((q) => q.images && q.images.length > 0));
            if (!hasFullImages) {
                refreshImageSets();
            }
        }
    }, [activeTab, contentSubTab]);

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

    // Delete Team Permanently & Reset Member Accounts
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

    // -------------------------------------------------------------
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
            await refreshImageSets();
        } catch (err) {
            setError(err.message || "Failed to save Image Set");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveQuestion = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");
            const payload = { ...newQuestion };
            if (contentSubTab === "r4g1" || payload.questionType === "jumbled") {
                if (!payload.question || payload.question.trim() === "") {
                    payload.question = payload.jumbledWord ? `Unscramble: ${payload.jumbledWord.trim().toUpperCase()}` : "Unscramble the jumbled letters";
                }
            }
            await api.saveQuestion(payload);
            setMessage(editingQuestion ? "Question updated successfully!" : "Question created successfully!");
            setEditingQuestion(null);
            setNewQuestion({
                game: contentSubTab === "r1g3" ? 3 : 1,
                round: contentSubTab === "r4g1" ? 4 : 1,
                questionNumber: (questions.filter((q) => {
                    if (contentSubTab === "r1g1") return q.round === 1 && q.game === 1;
                    if (contentSubTab === "r1g3") return q.round === 1 && q.game === 3;
                    if (contentSubTab === "r4g1") return q.round === 4 && q.game === 1;
                    return true;
                }).length || 0) + 1,
                questionType: contentSubTab === "r1g3" ? "code" : contentSubTab === "r4g1" ? "jumbled" : "mcq",
                question: "",
                codeSnippet: "",
                jumbledWord: "",
                hint: "",
                options: { A: "", B: "", C: "", D: "" },
                correctAnswer: "",
                techCoins: 20,
                timeLimit: 10,
            });
            await refreshQuestions();
        } catch (err) {
            setError(err.message || "Failed to save question");
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartEditQuestion = (q) => {
        setEditingQuestion(q);
        setNewQuestion({
            id: q._id,
            game: q.game,
            round: q.round,
            questionNumber: q.questionNumber,
            questionType: q.questionType || (q.round === 1 && q.game === 3 ? "code" : q.round === 4 && q.game === 1 ? "jumbled" : "mcq"),
            question: q.question,
            codeSnippet: q.codeSnippet || "",
            jumbledWord: q.jumbledWord || "",
            hint: q.hint || "",
            options: q.options || { A: "", B: "", C: "", D: "" },
            correctAnswer: q.correctAnswer || "",
            techCoins: q.techCoins || 20,
            timeLimit: q.timeLimit || 10,
        });
        const formEl = document.getElementById("question-editor-form");
        if (formEl) {
            formEl.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleCancelEditQuestion = () => {
        setEditingQuestion(null);
        setNewQuestion({
            game: contentSubTab === "r1g3" ? 3 : 1,
            round: contentSubTab === "r4g1" ? 4 : 1,
            questionNumber: 1,
            questionType: contentSubTab === "r1g3" ? "code" : contentSubTab === "r4g1" ? "jumbled" : "mcq",
            question: "",
            codeSnippet: "",
            jumbledWord: "",
            hint: "",
            options: { A: "", B: "", C: "", D: "" },
            correctAnswer: "",
            techCoins: 20,
            timeLimit: 10,
        });
    };

    const handleBatchUpdateTimeLimit = async () => {
        const timeVal = Number(batchTimeInput);
        if (!timeVal || timeVal <= 0) {
            setError("Please enter a valid positive time in seconds (e.g., 12)");
            return;
        }
        const currentList = questions.filter((q) => {
            if (contentSubTab === "r1g1") return q.round === 1 && q.game === 1;
            if (contentSubTab === "r1g3") return q.round === 1 && q.game === 3;
            if (contentSubTab === "r4g1") return q.round === 4 && q.game === 1;
            return true;
        });
        const currentFilteredIds = currentList.map((q) => q._id);
        const targetIds = selectedQuestionIds.filter((id) => currentFilteredIds.includes(id));

        if (targetIds.length === 0) {
            setError("Please select at least one question to update time limit");
            return;
        }

        try {
            setActionLoading(true);
            setError("");
            setMessage("");
            await api.batchUpdateQuestionsTimeLimit({ ids: targetIds, timeLimit: timeVal });
            setMessage(`⏱️ Successfully updated time limit to ${timeVal}s for ${targetIds.length} questions!`);
            await refreshQuestions();
        } catch (err) {
            setError(err.message || "Failed to batch update time limit");
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
            await refreshQuestions();
        } catch (err) {
            setError(err.message || "Failed to delete question");
        } finally {
            setActionLoading(false);
        }
    };

    // Multi-Question Coins & Difficulty Sync & Handlers
    useEffect(() => {
        const draft = {};
        questions.forEach((q) => {
            draft[q._id] = {
                techCoins: q.techCoins !== undefined ? q.techCoins : 20,
                timeLimit: q.timeLimit !== undefined ? q.timeLimit : 10,
            };
        });
        setBulkCoinsDraft(draft);
    }, [questions]);

    const handleBulkDraftChange = (qId, field, value) => {
        setBulkCoinsDraft((prev) => ({
            ...prev,
            [qId]: {
                ...(prev[qId] || { techCoins: 20, timeLimit: 10 }),
                [field]: Number(value),
            },
        }));
    };

    const handleSetAllCoinsInView = (filteredList, coinsVal) => {
        setBulkCoinsDraft((prev) => {
            const next = { ...prev };
            filteredList.forEach((q) => {
                next[q._id] = {
                    ...(next[q._id] || { timeLimit: 10 }),
                    techCoins: Number(coinsVal),
                };
            });
            return next;
        });
    };

    const handleAdjustAllCoinsInView = (filteredList, delta) => {
        setBulkCoinsDraft((prev) => {
            const next = { ...prev };
            filteredList.forEach((q) => {
                const current = (next[q._id]?.techCoins !== undefined ? next[q._id].techCoins : q.techCoins) || 20;
                next[q._id] = {
                    ...(next[q._id] || { timeLimit: 10 }),
                    techCoins: Math.max(0, current + delta),
                };
            });
            return next;
        });
    };

    const handleApplyEscalatingLadderInView = (filteredList) => {
        const ladder = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80];
        setBulkCoinsDraft((prev) => {
            const next = { ...prev };
            filteredList.forEach((q, idx) => {
                const coinsVal = idx < ladder.length ? ladder[idx] : 10 + idx * 5;
                next[q._id] = {
                    ...(next[q._id] || { timeLimit: 10 }),
                    techCoins: coinsVal,
                };
            });
            return next;
        });
    };

    const handleSetAllTimeInView = (filteredList, timeVal) => {
        const validTime = Math.max(3, Number(timeVal) || 10);
        setBulkCoinsDraft((prev) => {
            const next = { ...prev };
            filteredList.forEach((q) => {
                next[q._id] = {
                    ...(next[q._id] || { techCoins: q.techCoins || 20 }),
                    timeLimit: validTime,
                };
            });
            return next;
        });
    };

    const handleAdjustAllTimeInView = (filteredList, delta) => {
        setBulkCoinsDraft((prev) => {
            const next = { ...prev };
            filteredList.forEach((q) => {
                const current = (next[q._id]?.timeLimit !== undefined ? next[q._id].timeLimit : q.timeLimit) || 10;
                next[q._id] = {
                    ...(next[q._id] || { techCoins: q.techCoins || 20 }),
                    timeLimit: Math.max(3, current + delta),
                };
            });
            return next;
        });
    };

    const handleSaveSingleQuestionCoins = async (qId, qNum) => {
        try {
            setActionLoading(true);
            setError("");
            const draft = bulkCoinsDraft[qId] || {};
            await api.bulkUpdateQuestions([
                {
                    id: qId,
                    techCoins: draft.techCoins !== undefined ? draft.techCoins : 20,
                    timeLimit: draft.timeLimit !== undefined ? draft.timeLimit : 10,
                },
            ]);
            setSavedSuccessId(qId);
            setTimeout(() => setSavedSuccessId(null), 2500);
            setMessage(`🪙 Question Q${qNum} saved: ${draft.techCoins} Tech Coins (${draft.timeLimit}s timer)!`);
            await refreshQuestions();
        } catch (err) {
            setError(err.message || "Failed to update question coins");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveAllBulkCoins = async (filteredList) => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const updates = filteredList.map((q) => ({
                id: q._id,
                techCoins: bulkCoinsDraft[q._id]?.techCoins !== undefined ? bulkCoinsDraft[q._id].techCoins : q.techCoins,
                timeLimit: bulkCoinsDraft[q._id]?.timeLimit !== undefined ? bulkCoinsDraft[q._id].timeLimit : q.timeLimit,
            }));

            await api.bulkUpdateQuestions(updates);
            setMessage(`✨ Successfully calibrated and saved Tech Coins for all ${updates.length} questions!`);
            await refreshQuestions();
        } catch (err) {
            setError(err.message || "Failed to save questions in bulk");
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

            await refreshTechCards();
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
                    await refreshTechCards();
                } catch (err) {
                    setError(err.message || "Failed to delete Tech Card");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

    // -------------------------------------------------------------
    // TECH CARDS LIVE MARKET FLUCTUATION (Hike & Fall)
    // -------------------------------------------------------------
    useEffect(() => {
        const draft = {};
        cardsCatalog.forEach((c) => {
            draft[c._id] = c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50);
        });
        setMarketDraft(draft);
    }, [cardsCatalog]);

    const handleMarketDraftChange = (cardId, value) => {
        setMarketDraft((prev) => ({
            ...prev,
            [cardId]: Math.max(0, Number(value) || 0),
        }));
    };

    const handleAdjustSingleCardMarket = (card, delta) => {
        setMarketDraft((prev) => {
            const current = prev[card._id] !== undefined ? prev[card._id] : (card.marketValue !== undefined ? card.marketValue : (card.basePrice || 50));
            return {
                ...prev,
                [card._id]: Math.max(0, current + delta),
            };
        });
    };

    const handleResetSingleCardMarket = (card) => {
        setMarketDraft((prev) => ({
            ...prev,
            [card._id]: card.basePrice || 50,
        }));
    };

    const handleAdjustAllCardsMarket = (delta) => {
        setMarketDraft((prev) => {
            const next = { ...prev };
            cardsCatalog.forEach((c) => {
                const current = next[c._id] !== undefined ? next[c._id] : (c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50));
                next[c._id] = Math.max(0, current + delta);
            });
            return next;
        });
    };

    const handleResetAllCardsMarket = () => {
        setMarketDraft((prev) => {
            const next = {};
            cardsCatalog.forEach((c) => {
                next[c._id] = c.basePrice || 50;
            });
            return next;
        });
    };

    const handleSaveAllMarketValues = async () => {
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const updates = cardsCatalog.map((c) => ({
                id: c._id,
                name: c.name,
                marketValue: marketDraft[c._id] !== undefined ? marketDraft[c._id] : (c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50)),
            }));

            const res = await api.bulkUpdateTechCardsMarket(updates);
            setMessage(res.message || `Successfully updated market values for ${updates.length} Tech Cards and recalculated all team scores!`);
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to update market values");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleQuestionSelection = (id) => {
        setSelectedQuestionIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllQuestions = (currentList) => {
        const currentIds = currentList.map((q) => q._id);
        const allSelected = currentIds.every((id) => selectedQuestionIds.includes(id));
        if (allSelected) {
            setSelectedQuestionIds((prev) => prev.filter((id) => !currentIds.includes(id)));
        } else {
            setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...currentIds])));
        }
    };

    const handleDeleteSelectedQuestions = () => {
        if (selectedQuestionIds.length === 0) return;
        triggerConfirm({
            title: `Delete ${selectedQuestionIds.length} Questions`,
            message: `Are you sure you want to permanently delete the ${selectedQuestionIds.length} selected competition questions?`,
            itemHighlight: `${selectedQuestionIds.length} questions selected`,
            confirmText: `Delete ${selectedQuestionIds.length} Questions`,
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");
                    await Promise.all(selectedQuestionIds.map((id) => api.deleteQuestion(id)));
                    setMessage(`Successfully deleted ${selectedQuestionIds.length} questions!`);
                    setSelectedQuestionIds([]);
                    await refreshQuestions();
                } catch (err) {
                    setError(err.message || "Failed to delete selected questions");
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
                    setSelectedQuestionIds((prev) => prev.filter((item) => item !== id));
                    setMessage("Question deleted successfully!");
                    await refreshQuestions();
                } catch (err) {
                    setError(err.message || "Failed to delete question");
                } finally {
                    setActionLoading(false);
                }
            },
        });
    };

    const handleSaveProblemStatement = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            setError("");
            setMessage("");

            const payload = {
                id: editingProblemStatement?._id,
                statementNumber: Number(problemForm.statementNumber),
                description: problemForm.description.trim(),
                baseValue: Number(problemForm.baseValue || 50),
                totalCount: Number(problemForm.totalCount || 4),
            };

            await api.saveProblemStatement(payload);
            setMessage(editingProblemStatement ? `Problem Statement #${payload.statementNumber} updated successfully!` : `Problem Statement #${payload.statementNumber} created successfully!`);

            setEditingProblemStatement(null);
            setProblemForm({
                statementNumber: (problemCatalog.length + 1) || 1,
                baseValue: 50,
                totalCount: 4,
                description: "",
            });

            await refreshProblems();
            await loadAllData();
        } catch (err) {
            setError(err.message || "Failed to save Problem Statement");
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditProblemStatement = (p) => {
        setEditingProblemStatement(p);
        setProblemForm({
            statementNumber: p.statementNumber || 1,
            baseValue: p.minBid !== undefined ? p.minBid : (p.baseValue || 50),
            totalCount: p.totalCount !== undefined ? p.totalCount : 4,
            description: p.description || p.title || "",
        });
        setContentSubTab("problems");
        window.scrollTo({ top: 300, behavior: "smooth" });
    };

    const handleCancelEditProblemStatement = () => {
        setEditingProblemStatement(null);
        setProblemForm({
            statementNumber: (problemCatalog.length + 1) || 1,
            baseValue: 50,
            totalCount: 4,
            description: "",
        });
    };

    const toggleProblemSelection = (id) => {
        setSelectedProblemIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllProblems = (currentList) => {
        const currentIds = currentList.map((p) => p._id);
        const allSelected = currentIds.every((id) => selectedProblemIds.includes(id));
        if (allSelected) {
            setSelectedProblemIds((prev) => prev.filter((id) => !currentIds.includes(id)));
        } else {
            setSelectedProblemIds((prev) => Array.from(new Set([...prev, ...currentIds])));
        }
    };

    const handleDeleteSelectedProblems = () => {
        if (selectedProblemIds.length === 0) return;
        triggerConfirm({
            title: `Delete ${selectedProblemIds.length} Problem Statements`,
            message: `Are you sure you want to permanently delete the ${selectedProblemIds.length} selected problem statements from the catalog?`,
            itemHighlight: `${selectedProblemIds.length} statements selected`,
            confirmText: `Delete ${selectedProblemIds.length} Statements`,
            confirmType: "danger",
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    setError("");
                    setMessage("");
                    await api.bulkDeleteProblemStatements(selectedProblemIds);
                    setSelectedProblemIds([]);
                    setMessage("Selected problem statements deleted successfully!");
                    await refreshProblems();
                    await loadAllData();
                } catch (err) {
                    setError(err.message || "Failed to delete selected problem statements");
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
                    setSelectedProblemIds((prev) => prev.filter((item) => item !== id));
                    setMessage(`Problem statement "${title}" deleted successfully!`);
                    if (editingProblemStatement?._id === id) {
                        handleCancelEditProblemStatement();
                    }
                    await refreshProblems();
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
                )}

                {/* ========================================================================= */}
                {/* TAB 4: CONTENT & QUESTION MANAGER */}
                {/* ========================================================================= */}
                {activeTab === "content" && (
                    <div>
                        {/* Sub-tabs for content */}
                        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto" }}>
                            {[
                                { id: "r1g1", label: "📝 R1G1 Speed Quiz (10 Qs)" },
                                { id: "imagesets", label: "🖼️ R1G2 Image Sets Editor" },
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
                                                                style={{ width: "100%", height: "120px", objectFit: "contain", background: "#030712", borderRadius: "6px", marginBottom: "8px" }}
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

                                {/* Add / Edit Question Form */}
                                <div id="question-editor-form" className="glass-card" style={{ padding: "28px", border: editingQuestion ? "1px solid rgba(0, 240, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.1)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                        <h3 style={{ fontSize: "18px", margin: 0 }}>
                                            {editingQuestion ? (
                                                <>
                                                    <span style={{ color: "var(--primary)" }}>✏️ Editing Question Q{editingQuestion.questionNumber}</span>
                                                    <span style={{ fontSize: "12px", color: "var(--text-dim)", marginLeft: "8px" }}>({contentSubTab.toUpperCase()})</span>
                                                </>
                                            ) : (
                                                `Add New Question for ${contentSubTab.toUpperCase()}`
                                            )}
                                        </h3>
                                        {editingQuestion && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEditQuestion}
                                                className="btn-secondary"
                                                style={{ padding: "5px 12px", fontSize: "12px" }}
                                            >
                                                ✕ Cancel Edit
                                            </button>
                                        )}
                                    </div>

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

                                        {contentSubTab !== "r4g1" && (
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
                                                    required={contentSubTab !== "r4g1"}
                                                />
                                            </div>
                                        )}

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
                                            <div>
                                                <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>Jumbled Word Letters</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. ALGOIRTHM"
                                                    value={newQuestion.jumbledWord}
                                                    onChange={(e) => setNewQuestion({
                                                        ...newQuestion,
                                                        game: 1,
                                                        round: 4,
                                                        questionType: "jumbled",
                                                        jumbledWord: e.target.value,
                                                        question: e.target.value ? `Unscramble: ${e.target.value.toUpperCase()}` : "Unscramble the jumbled word",
                                                    })}
                                                    required
                                                />
                                            </div>
                                        )}

                                        {contentSubTab !== "r4g1" && (
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
                                        )}

                                        <div>
                                            <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                                {contentSubTab === "r4g1" ? "Correct Unscrambled Word (Case-Insensitive)" : "Correct Answer (A / B / C / D)"}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={contentSubTab === "r4g1" ? "e.g. ALGORITHM" : "e.g. A"}
                                                value={newQuestion.correctAnswer}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <button type="submit" className="btn-primary" disabled={actionLoading}>
                                                {editingQuestion ? "💾 Update Question →" : "Save Question →"}
                                            </button>
                                            {editingQuestion && (
                                                <button type="button" onClick={handleCancelEditQuestion} className="btn-secondary">
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>

                                {/* Filtered Questions List with Multi-Question Matrix & Difficulty Comparison */}
                                <div className="glass-card" style={{ padding: "28px" }}>
                                    {(() => {
                                        const filteredQuestionList = questions.filter((q) => {
                                            if (contentSubTab === "r1g1") return q.round === 1 && q.game === 1;
                                            if (contentSubTab === "r1g3") return q.round === 1 && q.game === 3;
                                            if (contentSubTab === "r4g1") return q.round === 4 && q.game === 1;
                                            return true;
                                        });
                                        const currentFilteredIds = filteredQuestionList.map((q) => q._id);
                                        const selectedInCurrentTab = selectedQuestionIds.filter((id) => currentFilteredIds.includes(id));
                                        const isAllSelected = currentFilteredIds.length > 0 && selectedInCurrentTab.length === currentFilteredIds.length;

                                        // Metrics calculation
                                        const totalCoins = filteredQuestionList.reduce((sum, q) => {
                                            const coins = bulkCoinsDraft[q._id]?.techCoins !== undefined ? bulkCoinsDraft[q._id].techCoins : q.techCoins;
                                            return sum + (Number(coins) || 0);
                                        }, 0);

                                        const currentTiming = filteredQuestionList.length > 0
                                            ? Math.round(
                                                filteredQuestionList.reduce((sum, q) => {
                                                    const t = bulkCoinsDraft[q._id]?.timeLimit !== undefined ? bulkCoinsDraft[q._id].timeLimit : q.timeLimit || 10;
                                                    return sum + (Number(t) || 10);
                                                }, 0) / filteredQuestionList.length
                                            )
                                            : 10;

                                        const hasUnsavedChanges = filteredQuestionList.some((q) => {
                                            const dCoins = bulkCoinsDraft[q._id]?.techCoins;
                                            const dTime = bulkCoinsDraft[q._id]?.timeLimit;
                                            return (dCoins !== undefined && dCoins !== q.techCoins) || (dTime !== undefined && dTime !== q.timeLimit);
                                        });

                                        return (
                                            <>
                                                {/* Header & View Mode Switcher */}
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                            <h3 style={{ fontSize: "20px", margin: 0, fontWeight: "800" }}>
                                                                Competition Questions ({filteredQuestionList.length})
                                                            </h3>
                                                            <span className="badge badge-cyan" style={{ fontSize: "11px" }}>
                                                                {contentSubTab.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                                            Compare questions side-by-side, adjust Tech Coins and synchronize timer limits across all questions.
                                                        </p>
                                                    </div>

                                                    {/* View Mode Toggle */}
                                                    <div style={{ display: "flex", gap: "6px", background: "rgba(255, 255, 255, 0.04)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuestionViewMode("matrix")}
                                                            style={{
                                                                padding: "8px 16px",
                                                                borderRadius: "8px",
                                                                fontSize: "12.5px",
                                                                fontWeight: "700",
                                                                cursor: "pointer",
                                                                background: questionViewMode === "matrix" ? "var(--primary)" : "transparent",
                                                                color: questionViewMode === "matrix" ? "#000" : "var(--text-muted)",
                                                                border: "none",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            📊 Multi-Question Matrix & Coins Editor
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuestionViewMode("list")}
                                                            style={{
                                                                padding: "8px 16px",
                                                                borderRadius: "8px",
                                                                fontSize: "12.5px",
                                                                fontWeight: "700",
                                                                cursor: "pointer",
                                                                background: questionViewMode === "list" ? "var(--primary)" : "transparent",
                                                                color: questionViewMode === "list" ? "#000" : "var(--text-muted)",
                                                                border: "none",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "6px",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            📋 Compact List
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Multi-Question Calibration Toolbar */}
                                                {filteredQuestionList.length > 0 && (
                                                    <div style={{
                                                        background: "rgba(0, 240, 255, 0.03)",
                                                        border: "1px solid rgba(0, 240, 255, 0.15)",
                                                        borderRadius: "14px",
                                                        padding: "18px 20px",
                                                        marginBottom: "24px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "14px",
                                                    }}>
                                                        {/* Top Stats & Save Action */}
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                                                <div style={{ padding: "6px 14px", background: "rgba(255, 215, 0, 0.1)", border: "1px solid rgba(255, 215, 0, 0.3)", borderRadius: "8px" }}>
                                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Total Pool</span>
                                                                    <strong style={{ fontSize: "16px", color: "var(--accent-gold)", fontFamily: "var(--font-mono)" }}>🪙 {totalCoins} Coins</strong>
                                                                </div>
                                                                <div style={{ padding: "6px 14px", background: "rgba(0, 240, 255, 0.08)", border: "1px solid rgba(0, 240, 255, 0.25)", borderRadius: "8px" }}>
                                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Active Timing</span>
                                                                    <strong style={{ fontSize: "16px", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>⏱️ {currentTiming}s / Question</strong>
                                                                </div>
                                                            </div>

                                                            {/* Save All Action */}
                                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveAllBulkCoins(filteredQuestionList)}
                                                                    className="btn-primary"
                                                                    disabled={actionLoading}
                                                                    style={{
                                                                        padding: "9px 22px",
                                                                        fontSize: "13px",
                                                                        fontWeight: "800",
                                                                        boxShadow: hasUnsavedChanges ? "0 0 18px rgba(0, 240, 255, 0.5)" : "none",
                                                                        border: hasUnsavedChanges ? "1px solid #ffffff" : "none",
                                                                    }}
                                                                >
                                                                    {actionLoading ? "Saving..." : hasUnsavedChanges ? "💾 Save All Changes (Coins & Timing)" : "💾 Save All Changes"}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Row 1: Quick Coins Helper Presets */}
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                                <span style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Quick Set Coins:</span>
                                                                {[15, 20, 25, 30, 40, 50].map((num) => (
                                                                    <button
                                                                        key={num}
                                                                        type="button"
                                                                        onClick={() => handleSetAllCoinsInView(filteredQuestionList, num)}
                                                                        className="btn-secondary"
                                                                        style={{ padding: "4px 9px", fontSize: "11px", fontWeight: "700" }}
                                                                        title={`Set all ${filteredQuestionList.length} questions to ${num} coins`}
                                                                    >
                                                                        🪙 {num}
                                                                    </button>
                                                                ))}

                                                                <span style={{ color: "rgba(255, 255, 255, 0.2)", margin: "0 4px" }}>|</span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjustAllCoinsInView(filteredQuestionList, 5)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: "4px 9px", fontSize: "11px", color: "#34d399", borderColor: "rgba(52, 211, 153, 0.3)" }}
                                                                    title="Add +5 coins to every question"
                                                                >
                                                                    +5 to All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjustAllCoinsInView(filteredQuestionList, -5)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: "4px 9px", fontSize: "11px", color: "#fb7185", borderColor: "rgba(251, 113, 133, 0.3)" }}
                                                                    title="Subtract 5 coins from every question"
                                                                >
                                                                    -5 to All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApplyEscalatingLadderInView(filteredQuestionList)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: "4px 9px", fontSize: "11px", color: "var(--accent-gold)", borderColor: "rgba(255, 215, 0, 0.3)" }}
                                                                    title="Set increasing difficulty ladder: 10, 15, 20, 25, 30, 35, 40, 45, 50, 60"
                                                                >
                                                                    📈 Escalating Ladder (10→50+)
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Row 2: Quick Timing Helper Presets */}
                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                                <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700" }}>⏱️ Quick Set Timing:</span>
                                                                {[10, 12, 15, 20, 25, 30, 45, 60].map((tSec) => (
                                                                    <button
                                                                        key={tSec}
                                                                        type="button"
                                                                        onClick={() => handleSetAllTimeInView(filteredQuestionList, tSec)}
                                                                        className="btn-secondary"
                                                                        style={{ padding: "4px 9px", fontSize: "11px", fontWeight: "700" }}
                                                                        title={`Set all ${filteredQuestionList.length} questions to ${tSec} seconds`}
                                                                    >
                                                                        ⏱️ {tSec}s
                                                                    </button>
                                                                ))}

                                                                <span style={{ color: "rgba(255, 255, 255, 0.2)", margin: "0 4px" }}>|</span>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjustAllTimeInView(filteredQuestionList, 2)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: "4px 9px", fontSize: "11px", color: "#67e8f9", borderColor: "rgba(103, 232, 249, 0.3)" }}
                                                                    title="Add +2s to every question"
                                                                >
                                                                    +2s to All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAdjustAllTimeInView(filteredQuestionList, -2)}
                                                                    className="btn-secondary"
                                                                    style={{ padding: "4px 9px", fontSize: "11px", color: "#fb7185", borderColor: "rgba(251, 113, 133, 0.3)" }}
                                                                    title="Subtract 2s from every question"
                                                                >
                                                                    -2s to All
                                                                </button>

                                                                <span style={{ color: "rgba(255, 255, 255, 0.2)", margin: "0 4px" }}>|</span>

                                                                {/* Custom Time Input & Apply */}
                                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>Custom:</span>
                                                                    <input
                                                                        type="number"
                                                                        min="3"
                                                                        max="300"
                                                                        value={bulkCustomTime}
                                                                        onChange={(e) => setBulkCustomTime(e.target.value)}
                                                                        style={{
                                                                            width: "60px",
                                                                            padding: "3px 6px",
                                                                            fontSize: "12px",
                                                                            fontWeight: "800",
                                                                            textAlign: "center",
                                                                            fontFamily: "var(--font-mono)",
                                                                        }}
                                                                    />
                                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>s</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetAllTimeInView(filteredQuestionList, bulkCustomTime)}
                                                                        className="btn-secondary"
                                                                        style={{ padding: "4px 10px", fontSize: "11px", fontWeight: "700", color: "var(--primary)", borderColor: "rgba(0, 240, 255, 0.3)" }}
                                                                    >
                                                                        Apply to All
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {hasUnsavedChanges && (
                                                                <span style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "600" }}>
                                                                    ⚠️ You have modified questions. Click "Save All Changes" to save!
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* VIEW 1: MULTI-QUESTION MATRIX & COMPARISON */}
                                                {questionViewMode === "matrix" && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                                        {filteredQuestionList.length === 0 ? (
                                                            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)", fontSize: "14px" }}>
                                                                No questions found for this round yet. Use the form above to add questions!
                                                            </div>
                                                        ) : (
                                                            filteredQuestionList.map((q) => {
                                                                const draftCoins = bulkCoinsDraft[q._id]?.techCoins !== undefined ? bulkCoinsDraft[q._id].techCoins : q.techCoins || 20;
                                                                const draftTime = bulkCoinsDraft[q._id]?.timeLimit !== undefined ? bulkCoinsDraft[q._id].timeLimit : q.timeLimit || 10;
                                                                const isSaved = savedSuccessId === q._id;

                                                                return (
                                                                    <div
                                                                        key={q._id}
                                                                        className="glass-card"
                                                                        style={{
                                                                            padding: "20px 24px",
                                                                            borderRadius: "14px",
                                                                            border: isSaved ? "1px solid #34d399" : "1px solid rgba(255, 255, 255, 0.08)",
                                                                            background: isSaved ? "rgba(52, 211, 153, 0.05)" : "rgba(255, 255, 255, 0.02)",
                                                                            transition: "all 0.25s ease",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: "14px",
                                                                        }}
                                                                    >
                                                                        {/* Card Top Row: Number, Type, Full Edit / Delete */}
                                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                                                <span className="badge badge-cyan" style={{ fontSize: "12px", fontWeight: "800", padding: "4px 10px" }}>
                                                                                    QUESTION {q.questionNumber}
                                                                                </span>
                                                                                <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                                                                                    Type: <strong style={{ color: "#fff" }}>{q.questionType || "MCQ"}</strong>
                                                                                </span>
                                                                            </div>

                                                                            <div style={{ display: "flex", gap: "6px" }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleStartEditQuestion(q)}
                                                                                    className="btn-secondary"
                                                                                    style={{ padding: "5px 12px", fontSize: "11.5px" }}
                                                                                    title="Edit question text and options"
                                                                                >
                                                                                    ✏️ Full Edit
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteQuestion(q._id, q.question)}
                                                                                    className="btn-danger"
                                                                                    style={{ padding: "5px 10px", fontSize: "11.5px" }}
                                                                                    title="Delete question"
                                                                                >
                                                                                    🗑️ Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Question Text */}
                                                                        <div style={{ fontSize: "15px", color: "#fff", fontWeight: "600", lineHeight: 1.5 }}>
                                                                            {q.question}
                                                                        </div>

                                                                        {/* Code Snippet Box for R1G3 */}
                                                                        {q.codeSnippet && (
                                                                            <div style={{ background: "#050b18", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                                                                                <div style={{ fontSize: "11px", color: "var(--primary)", fontWeight: "700", marginBottom: "6px", textTransform: "uppercase" }}>
                                                                                    💻 Code Snippet Under Inspection:
                                                                                </div>
                                                                                <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "13px", color: "#67e8f9", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                                                                                    {q.codeSnippet}
                                                                                </pre>
                                                                            </div>
                                                                        )}

                                                                        {/* Jumbled Word for R4G1 */}
                                                                        {q.jumbledWord && (
                                                                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "8px 12px", background: "rgba(168, 85, 247, 0.08)", borderRadius: "8px", border: "1px solid rgba(168, 85, 247, 0.25)" }}>
                                                                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Jumbled Letters:</span>
                                                                                <span style={{ fontSize: "16px", fontWeight: "800", color: "#c084fc", letterSpacing: "3px", fontFamily: "var(--font-mono)" }}>
                                                                                    {q.jumbledWord}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {/* Correct Word for Jumbled Words */}
                                                                        {(q.jumbledWord || contentSubTab === "r4g1") && (
                                                                            <div style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.3)", display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }}>
                                                                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Correct Unscrambled Word:</span>
                                                                                <strong style={{ fontSize: "15px", color: "#34d399", fontFamily: "var(--font-mono)", letterSpacing: "1px" }}>{q.correctAnswer}</strong>
                                                                            </div>
                                                                        )}

                                                                        {/* Options Grid with Correct Answer Tag (MCQs only) */}
                                                                        {!q.jumbledWord && contentSubTab !== "r4g1" && q.options && Object.values(q.options).some(Boolean) && (
                                                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
                                                                                {["A", "B", "C", "D"].map((optKey) => {
                                                                                    const isCorrect = String(q.correctAnswer).trim().toUpperCase() === optKey;
                                                                                    const optText = q.options[optKey];
                                                                                    if (!optText) return null;
                                                                                    return (
                                                                                        <div
                                                                                            key={optKey}
                                                                                            style={{
                                                                                                padding: "8px 12px",
                                                                                                borderRadius: "8px",
                                                                                                background: isCorrect ? "rgba(52, 211, 153, 0.12)" : "rgba(255, 255, 255, 0.02)",
                                                                                                border: isCorrect ? "1px solid rgba(52, 211, 153, 0.5)" : "1px solid rgba(255, 255, 255, 0.05)",
                                                                                                fontSize: "13px",
                                                                                                display: "flex",
                                                                                                alignItems: "center",
                                                                                                justifyContent: "space-between",
                                                                                                gap: "8px",
                                                                                            }}
                                                                                        >
                                                                                            <div>
                                                                                                <strong style={{ color: isCorrect ? "#34d399" : "var(--primary)", marginRight: "6px" }}>{optKey}:</strong>
                                                                                                <span style={{ color: isCorrect ? "#fff" : "var(--text-muted)" }}>{optText}</span>
                                                                                            </div>
                                                                                            {isCorrect && (
                                                                                                <span style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", background: "rgba(52, 211, 153, 0.2)", padding: "2px 6px", borderRadius: "4px" }}>
                                                                                                    ✓ Correct
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}

                                                                        {/* Bottom Row: Direct Inline Coin & Time Limit Calibration */}
                                                                        <div style={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "space-between",
                                                                            flexWrap: "wrap",
                                                                            gap: "12px",
                                                                            paddingTop: "12px",
                                                                            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                                                                            background: "rgba(0, 0, 0, 0.2)",
                                                                            margin: "0 -24px -20px",
                                                                            padding: "14px 24px",
                                                                            borderRadius: "0 0 14px 14px",
                                                                        }}>
                                                                            {/* Coin Calibration Controls */}
                                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                                                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                                                    🪙 Coins:
                                                                                </label>
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="500"
                                                                                    value={draftCoins}
                                                                                    onChange={(e) => handleBulkDraftChange(q._id, "techCoins", e.target.value)}
                                                                                    style={{
                                                                                        width: "80px",
                                                                                        padding: "6px 10px",
                                                                                        fontSize: "15px",
                                                                                        fontWeight: "800",
                                                                                        color: "var(--accent-gold)",
                                                                                        textAlign: "center",
                                                                                        fontFamily: "var(--font-mono)",
                                                                                    }}
                                                                                />

                                                                                {/* Quick preset buttons */}
                                                                                <div style={{ display: "flex", gap: "4px" }}>
                                                                                    {[10, 15, 20, 25, 30, 40, 50].map((pVal) => (
                                                                                        <button
                                                                                            key={pVal}
                                                                                            type="button"
                                                                                            onClick={() => handleBulkDraftChange(q._id, "techCoins", pVal)}
                                                                                            style={{
                                                                                                padding: "3px 7px",
                                                                                                borderRadius: "5px",
                                                                                                fontSize: "11px",
                                                                                                fontWeight: "700",
                                                                                                background: draftCoins === pVal ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.04)",
                                                                                                color: draftCoins === pVal ? "#000" : "var(--text-muted)",
                                                                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                                                                cursor: "pointer",
                                                                                            }}
                                                                                        >
                                                                                            {pVal}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            {/* Timer & Single Save Control */}
                                                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                                    <label style={{ fontSize: "12px", color: "var(--text-dim)" }}>⏱️ Time:</label>
                                                                                    <input
                                                                                        type="number"
                                                                                        min="3"
                                                                                        max="300"
                                                                                        value={draftTime}
                                                                                        onChange={(e) => handleBulkDraftChange(q._id, "timeLimit", e.target.value)}
                                                                                        style={{
                                                                                            width: "60px",
                                                                                            padding: "6px",
                                                                                            fontSize: "13px",
                                                                                            fontWeight: "700",
                                                                                            textAlign: "center",
                                                                                        }}
                                                                                    />
                                                                                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>s</span>
                                                                                </div>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleSaveSingleQuestionCoins(q._id, q.questionNumber)}
                                                                                    disabled={actionLoading}
                                                                                    className={isSaved ? "btn-emerald" : "btn-gold"}
                                                                                    style={{
                                                                                        padding: "7px 16px",
                                                                                        fontSize: "12px",
                                                                                        fontWeight: "700",
                                                                                        whiteSpace: "nowrap",
                                                                                    }}
                                                                                >
                                                                                    {isSaved ? "✅ Saved!" : `💾 Save Q${q.questionNumber}`}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}

                                                        {/* Bottom Save All Banner */}
                                                        {filteredQuestionList.length > 3 && (
                                                            <div style={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                padding: "16px 20px",
                                                                background: "rgba(0, 240, 255, 0.04)",
                                                                border: "1px solid rgba(0, 240, 255, 0.2)",
                                                                borderRadius: "12px",
                                                                marginTop: "12px",
                                                                flexWrap: "wrap",
                                                                gap: "12px",
                                                            }}>
                                                                <div>
                                                                    <strong style={{ fontSize: "14px", color: "#fff" }}>Ready to apply coin calibrations?</strong>
                                                                    <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>
                                                                        Saves all modified Tech Coins and timers for all {filteredQuestionList.length} questions.
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleSaveAllBulkCoins(filteredQuestionList)}
                                                                    className="btn-primary"
                                                                    disabled={actionLoading}
                                                                    style={{ padding: "10px 24px", fontSize: "13px", fontWeight: "800" }}
                                                                >
                                                                    💾 Save All {filteredQuestionList.length} Questions Coins
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* VIEW 2: COMPACT LIST VIEW */}
                                                {questionViewMode === "list" && (
                                                    <div>
                                                        {/* Bulk Selection Bar */}
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                                                            {filteredQuestionList.length > 0 && (
                                                                <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", userSelect: "none" }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isAllSelected}
                                                                        onChange={() => handleSelectAllQuestions(filteredQuestionList)}
                                                                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)", margin: 0 }}
                                                                    />
                                                                    Select All
                                                                </label>
                                                            )}

                                                            {selectedInCurrentTab.length > 0 && (
                                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                                                        {selectedInCurrentTab.length} selected
                                                                    </span>

                                                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.04)", padding: "4px 8px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                                                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Time:</span>
                                                                        <input
                                                                            type="number"
                                                                            min="1"
                                                                            max="300"
                                                                            value={batchTimeInput}
                                                                            onChange={(e) => setBatchTimeInput(e.target.value)}
                                                                            style={{ width: "52px", padding: "3px 6px", fontSize: "12px", textAlign: "center", height: "26px" }}
                                                                        />
                                                                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>s</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={handleBatchUpdateTimeLimit}
                                                                            className="btn-gold"
                                                                            style={{ padding: "4px 10px", fontSize: "11.5px", fontWeight: "700" }}
                                                                        >
                                                                            ⏱️ Set Time
                                                                        </button>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={handleDeleteSelectedQuestions}
                                                                        className="btn-danger"
                                                                        style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "700" }}
                                                                    >
                                                                        🗑️ Delete Selected ({selectedInCurrentTab.length})
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setSelectedQuestionIds([])}
                                                                        className="btn-secondary"
                                                                        style={{ padding: "6px 12px", fontSize: "12px" }}
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                                            {filteredQuestionList.length === 0 ? (
                                                                <div style={{ textAlign: "center", padding: "30px", color: "var(--text-dim)", fontSize: "14px" }}>
                                                                    No questions created for this round yet. Add one above!
                                                                </div>
                                                            ) : (
                                                                filteredQuestionList.map((q) => {
                                                                    const isSelected = selectedQuestionIds.includes(q._id);
                                                                    const draftCoins = bulkCoinsDraft[q._id]?.techCoins !== undefined ? bulkCoinsDraft[q._id].techCoins : q.techCoins || 20;

                                                                    return (
                                                                        <div
                                                                            key={q._id}
                                                                            style={{
                                                                                display: "flex",
                                                                                justifyContent: "space-between",
                                                                                alignItems: "center",
                                                                                padding: "12px 16px",
                                                                                borderRadius: "10px",
                                                                                background: isSelected ? "rgba(244, 63, 94, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                                                                border: isSelected ? "1px solid rgba(244, 63, 94, 0.35)" : "1px solid rgba(255, 255, 255, 0.06)",
                                                                                transition: "all 0.2s ease",
                                                                                gap: "14px",
                                                                            }}
                                                                        >
                                                                            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={() => toggleQuestionSelection(q._id)}
                                                                                    style={{
                                                                                        width: "18px",
                                                                                        height: "18px",
                                                                                        cursor: "pointer",
                                                                                        accentColor: "var(--primary)",
                                                                                        margin: 0,
                                                                                        flexShrink: 0,
                                                                                    }}
                                                                                />
                                                                                <div style={{ flex: 1 }}>
                                                                                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                                                                                        <span className="badge badge-cyan" style={{ fontSize: "10px" }}>Q{q.questionNumber}</span>
                                                                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255, 215, 0, 0.1)", padding: "2px 8px", borderRadius: "6px", border: "1px solid rgba(255, 215, 0, 0.25)" }}>
                                                                                            <span style={{ fontSize: "11px", color: "var(--accent-gold)" }}>🪙</span>
                                                                                            <input
                                                                                                type="number"
                                                                                                min="0"
                                                                                                max="500"
                                                                                                value={draftCoins}
                                                                                                onChange={(e) => handleBulkDraftChange(q._id, "techCoins", e.target.value)}
                                                                                                style={{ width: "45px", padding: "1px 4px", fontSize: "11.5px", fontWeight: "800", color: "var(--accent-gold)", textAlign: "center", height: "20px" }}
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleSaveSingleQuestionCoins(q._id, q.questionNumber)}
                                                                                                style={{ background: "none", border: "none", color: "#34d399", fontSize: "12px", cursor: "pointer", padding: "0 2px" }}
                                                                                                title="Save coin change"
                                                                                            >
                                                                                                💾
                                                                                            </button>
                                                                                        </div>
                                                                                        <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>⏱️ {q.timeLimit || 10}s | Correct: {q.correctAnswer}</span>
                                                                                    </div>
                                                                                    <div style={{ fontSize: "14px", color: "#fff", lineHeight: 1.5 }}>
                                                                                        {q.question}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleStartEditQuestion(q)}
                                                                                    className="btn-secondary"
                                                                                    style={{ padding: "6px 12px", fontSize: "11px" }}
                                                                                >
                                                                                    ✏️ Edit
                                                                                </button>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteQuestion(q._id, q.question)}
                                                                                    className="btn-danger"
                                                                                    style={{ padding: "6px 12px", fontSize: "11px" }}
                                                                                >
                                                                                    🗑️ Delete
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* SUBTAB 5: TECH CARDS & MARKET VALUATION */}
                        {contentSubTab === "cards" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                {/* Mode Toggle Bar */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                                    <div>
                                        <h3 style={{ fontSize: "20px", margin: 0, fontWeight: "800" }}>
                                            Tech Cards & Market Fluctuation
                                        </h3>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
                                            Manage card catalog inventory and calibrate post-auction Market Hike & Fall valuations.
                                        </p>
                                    </div>

                                    {/* Switcher */}
                                    <div style={{ display: "flex", gap: "6px", background: "rgba(255, 255, 255, 0.04)", padding: "4px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                        <button
                                            type="button"
                                            onClick={() => setTechCardsSubView("market")}
                                            style={{
                                                padding: "8px 18px",
                                                borderRadius: "8px",
                                                fontSize: "12.5px",
                                                fontWeight: "700",
                                                cursor: "pointer",
                                                background: techCardsSubView === "market" ? "var(--primary)" : "transparent",
                                                color: techCardsSubView === "market" ? "#000" : "var(--text-muted)",
                                                border: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            📈 Market Hike & Fall Hub
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTechCardsSubView("catalog")}
                                            style={{
                                                padding: "8px 18px",
                                                borderRadius: "8px",
                                                fontSize: "12.5px",
                                                fontWeight: "700",
                                                cursor: "pointer",
                                                background: techCardsSubView === "catalog" ? "var(--primary)" : "transparent",
                                                color: techCardsSubView === "catalog" ? "#000" : "var(--text-muted)",
                                                border: "none",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            🎴 Catalog & Inventory Manager
                                        </button>
                                    </div>
                                </div>

                                {/* VIEW 1: LIVE MARKET VALUATION & HIKE/FALL CENTER */}
                                {techCardsSubView === "market" && (() => {
                                    const hasUnsavedMarketChanges = cardsCatalog.some((c) => {
                                        const draft = marketDraft[c._id];
                                        const original = c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50);
                                        return draft !== undefined && draft !== original;
                                    });

                                    return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                            {/* Top Calibration Toolbar */}
                                            <div style={{
                                                background: "rgba(255, 215, 0, 0.04)",
                                                border: "1px solid rgba(255, 215, 0, 0.2)",
                                                borderRadius: "14px",
                                                padding: "20px 24px",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "14px",
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                                                    <div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span className="badge badge-gold" style={{ fontSize: "11px" }}>POST-AUCTION STAGE</span>
                                                            <strong style={{ fontSize: "16px", color: "#fff" }}>Live Market Valuation Matrix ({cardsCatalog.length} Tech Cards)</strong>
                                                        </div>
                                                        <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "4px 0 0" }}>
                                                            Adjust the market value of each Tech Card after the auction. Changes propagate directly to all team dashboards and recalculate scores.
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={handleSaveAllMarketValues}
                                                        className="btn-gold"
                                                        disabled={actionLoading}
                                                        style={{
                                                            padding: "10px 24px",
                                                            fontSize: "13px",
                                                            fontWeight: "800",
                                                            boxShadow: hasUnsavedMarketChanges ? "0 0 18px rgba(255, 215, 0, 0.5)" : "none",
                                                            border: hasUnsavedMarketChanges ? "1px solid #ffffff" : "none",
                                                        }}
                                                    >
                                                        {actionLoading ? "Recalculating..." : hasUnsavedMarketChanges ? "💾 Save Market Values & Recalculate (Unsaved)" : "💾 Save Market Values & Recalculate"}
                                                    </button>
                                                </div>

                                                {/* Tech Card Search Bar */}
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px", maxWidth: "520px" }}>
                                                        <div style={{ position: "relative", width: "100%" }}>
                                                            <input
                                                                type="text"
                                                                placeholder="🔍 Search tech card name (e.g. AI, LiDAR, Drone, NLP)..."
                                                                value={cardSearchQuery}
                                                                onChange={(e) => setCardSearchQuery(e.target.value)}
                                                                style={{
                                                                    width: "100%",
                                                                    padding: "10px 38px 10px 16px",
                                                                    fontSize: "13.5px",
                                                                    borderRadius: "10px",
                                                                    background: "rgba(0, 0, 0, 0.5)",
                                                                    border: cardSearchQuery ? "1px solid var(--accent-gold)" : "1px solid rgba(255, 215, 0, 0.25)",
                                                                    color: "#ffffff",
                                                                    boxShadow: cardSearchQuery ? "0 0 12px rgba(255, 215, 0, 0.2)" : "none",
                                                                }}
                                                            />
                                                            {cardSearchQuery && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCardSearchQuery("")}
                                                                    title="Clear search"
                                                                    style={{
                                                                        position: "absolute",
                                                                        right: "12px",
                                                                        top: "50%",
                                                                        transform: "translateY(-50%)",
                                                                        background: "transparent",
                                                                        border: "none",
                                                                        color: "var(--text-muted)",
                                                                        cursor: "pointer",
                                                                        fontSize: "14px",
                                                                        fontWeight: "700",
                                                                    }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                        {cardSearchQuery && (
                                                            <span style={{ fontSize: "12px", color: "var(--accent-gold)", whiteSpace: "nowrap", fontWeight: "700" }}>
                                                                {cardsCatalog.filter((c) => {
                                                                    const q = cardSearchQuery.trim().toLowerCase();
                                                                    return c.name?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
                                                                }).length} Found
                                                            </span>
                                                        )}
                                                    </div>

                                                    {hasUnsavedMarketChanges && (
                                                        <span style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "600" }}>
                                                            ⚠️ You have modified market values. Click "Save Market Values" to apply!
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Cards Grid with Direct Inline Market Value Calibrator */}
                                            {(() => {
                                                const filteredCards = cardsCatalog.filter((c) => {
                                                    if (!cardSearchQuery || !cardSearchQuery.trim()) return true;
                                                    const q = cardSearchQuery.trim().toLowerCase();
                                                    return (
                                                        c.name?.toLowerCase().includes(q) ||
                                                        c.category?.toLowerCase().includes(q) ||
                                                        c.description?.toLowerCase().includes(q)
                                                    );
                                                });

                                                if (cardsCatalog.length === 0) {
                                                    return (
                                                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                                            🎴 No Tech Cards in catalog. Switch to "Catalog & Inventory Manager" to create cards!
                                                        </div>
                                                    );
                                                }

                                                if (filteredCards.length === 0) {
                                                    return (
                                                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                                            <p style={{ margin: "0 0 12px 0", fontSize: "15px" }}>No Tech Cards matching "{cardSearchQuery}".</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => setCardSearchQuery("")}
                                                                className="btn-secondary"
                                                                style={{ padding: "6px 14px", fontSize: "12px" }}
                                                            >
                                                                Clear Search
                                                            </button>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                                                        {filteredCards.map((c, index) => {
                                                            const baseVal = Number(c.basePrice !== undefined ? c.basePrice : 50);
                                                            const currentDraft = marketDraft[c._id] !== undefined ? Number(marketDraft[c._id]) : Number(c.marketValue !== undefined ? c.marketValue : baseVal);
                                                            const diff = currentDraft - baseVal;
                                                            const allottedTeamsCount = (teams || []).reduce((acc, t) => {
                                                                const hasCard = (t.techCards || []).some((tc) => tc.name?.trim() === c.name?.trim());
                                                                return hasCard ? acc + 1 : acc;
                                                            }, 0);

                                                        return (
                                                            <div
                                                                key={c._id}
                                                                style={{
                                                                    padding: "20px",
                                                                    borderRadius: "14px",
                                                                    background: diff > 0
                                                                        ? "rgba(16, 185, 129, 0.05)"
                                                                        : diff < 0
                                                                            ? "rgba(239, 68, 68, 0.05)"
                                                                            : "rgba(255, 255, 255, 0.02)",
                                                                    border: diff > 0
                                                                        ? "1px solid rgba(52, 211, 153, 0.35)"
                                                                        : diff < 0
                                                                            ? "1px solid rgba(239, 68, 68, 0.35)"
                                                                            : "1px solid rgba(255, 255, 255, 0.08)",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    justifyContent: "space-between",
                                                                    gap: "14px",
                                                                    transition: "all 0.2s ease",
                                                                }}
                                                            >
                                                                {/* Top Info */}
                                                                <div>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                                                                        <span style={{ fontSize: "11px", color: "var(--text-dim)", fontWeight: "700" }}>
                                                                            CARD #{index + 1}
                                                                        </span>
                                                                        {/* Fluctuation Status Badge */}
                                                                        {diff > 0 ? (
                                                                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", background: "rgba(52, 211, 153, 0.15)", border: "1px solid rgba(52, 211, 153, 0.4)", padding: "2px 8px", borderRadius: "6px" }}>
                                                                                ▲ +{diff} Hike
                                                                            </span>
                                                                        ) : diff < 0 ? (
                                                                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#fb7185", background: "rgba(251, 113, 133, 0.15)", border: "1px solid rgba(251, 113, 133, 0.4)", padding: "2px 8px", borderRadius: "6px" }}>
                                                                                ▼ {diff} Fall
                                                                            </span>
                                                                        ) : (
                                                                            <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-dim)", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                                                                                ● Base Par
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <strong style={{ fontSize: "16px", color: "#ffffff", display: "block", marginBottom: "4px" }}>
                                                                        🎴 {c.name}
                                                                    </strong>

                                                                    <div style={{ display: "flex", gap: "10px", fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px" }}>
                                                                        <span>Base Value: <strong style={{ color: "var(--text-main)", fontFamily: "var(--font-mono)" }}>🪙 {baseVal}</strong></span>
                                                                        <span>•</span>
                                                                        <span>Allotted to: <strong style={{ color: allottedTeamsCount > 0 ? "var(--primary)" : "var(--text-dim)" }}>{allottedTeamsCount} Teams</strong></span>
                                                                    </div>
                                                                </div>

                                                                {/* Market Value Calibration Control */}
                                                                <div style={{
                                                                    padding: "12px 14px",
                                                                    background: "rgba(0, 0, 0, 0.3)",
                                                                    borderRadius: "10px",
                                                                    border: "1px solid rgba(255, 255, 255, 0.05)",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    gap: "10px",
                                                                }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                        <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-gold)" }}>
                                                                            Market Value:
                                                                        </label>
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                            <span style={{ fontSize: "14px", color: "var(--accent-gold)" }}>🪙</span>
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                max="1000"
                                                                                value={currentDraft}
                                                                                onChange={(e) => handleMarketDraftChange(c._id, e.target.value)}
                                                                                style={{
                                                                                    width: "85px",
                                                                                    padding: "5px 8px",
                                                                                    fontSize: "16px",
                                                                                    fontWeight: "900",
                                                                                    color: "#ffd700",
                                                                                    textAlign: "center",
                                                                                    fontFamily: "var(--font-mono)",
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {/* Quick Increments / Decrements */}
                                                                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "space-between" }}>
                                                                        <div style={{ display: "flex", gap: "4px" }}>
                                                                            {[10, 20, 30].map((inc) => (
                                                                                <button
                                                                                    key={inc}
                                                                                    type="button"
                                                                                    onClick={() => handleAdjustSingleCardMarket(c, inc)}
                                                                                    style={{
                                                                                        padding: "3px 6px",
                                                                                        fontSize: "10.5px",
                                                                                        fontWeight: "700",
                                                                                        background: "rgba(52, 211, 153, 0.12)",
                                                                                        color: "#34d399",
                                                                                        border: "1px solid rgba(52, 211, 153, 0.3)",
                                                                                        borderRadius: "4px",
                                                                                        cursor: "pointer",
                                                                                    }}
                                                                                    title={`Increase by ${inc} coins`}
                                                                                >
                                                                                    +{inc}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <div style={{ display: "flex", gap: "4px" }}>
                                                                            {[10, 20].map((dec) => (
                                                                                <button
                                                                                    key={dec}
                                                                                    type="button"
                                                                                    onClick={() => handleAdjustSingleCardMarket(c, -dec)}
                                                                                    style={{
                                                                                        padding: "3px 6px",
                                                                                        fontSize: "10.5px",
                                                                                        fontWeight: "700",
                                                                                        background: "rgba(251, 113, 133, 0.12)",
                                                                                        color: "#fb7185",
                                                                                        border: "1px solid rgba(251, 113, 133, 0.3)",
                                                                                        borderRadius: "4px",
                                                                                        cursor: "pointer",
                                                                                    }}
                                                                                    title={`Decrease by ${dec} coins`}
                                                                                >
                                                                                    -{dec}
                                                                                </button>
                                                                            ))}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleResetSingleCardMarket(c)}
                                                                                style={{
                                                                                    padding: "3px 6px",
                                                                                    fontSize: "10.5px",
                                                                                    background: "rgba(255, 255, 255, 0.05)",
                                                                                    color: "var(--text-dim)",
                                                                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                                                                    borderRadius: "4px",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                title="Reset to Base Value"
                                                                            >
                                                                                ↺
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}

                                            {/* Bottom Save Action Bar */}
                                            {cardsCatalog.length > 0 && (
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    padding: "18px 24px",
                                                    background: "rgba(255, 215, 0, 0.05)",
                                                    border: "1px solid rgba(255, 215, 0, 0.25)",
                                                    borderRadius: "14px",
                                                    marginTop: "10px",
                                                    flexWrap: "wrap",
                                                    gap: "14px",
                                                }}>
                                                    <div>
                                                        <strong style={{ fontSize: "15px", color: "#fff" }}>Ready to finalize Market Fluctuation?</strong>
                                                        <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--text-muted)" }}>
                                                            Saves updated valuations for all {cardsCatalog.length} Tech Cards and instantly recalculates all team scores and live leaderboard ranks.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveAllMarketValues}
                                                        className="btn-gold"
                                                        disabled={actionLoading}
                                                        style={{ padding: "10px 28px", fontSize: "13px", fontWeight: "800" }}
                                                    >
                                                        {actionLoading ? "Recalculating Ranks..." : "💾 Save All Market Values & Sync Scores"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* VIEW 2: CATALOG & INVENTORY MANAGER */}
                                {techCardsSubView === "catalog" && (
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
                                                    <h3 style={{ fontSize: "18px", margin: 0 }}>Tech Cards Catalog Overview</h3>
                                                    <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                                        Baseline assets for Round 2 live auction. Stock decreases upon assignment to teams.
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
                                                                                🪙 {c.basePrice !== undefined ? c.basePrice : 50}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                                                                            <span style={{ color: "var(--accent-gold)", fontWeight: "600" }}>Live Market Value:</span>
                                                                            <span style={{ color: "#ffd700", fontWeight: "900", fontSize: "15px", fontFamily: "var(--font-mono)" }}>
                                                                                🪙 {c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50)}
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
                            </div>
                        )}

                        {/* SUBTAB 6: PROBLEM STATEMENTS MANAGEMENT */}
                        {contentSubTab === "problems" && (() => {
                            const filteredProblems = problemCatalog.filter((p) => {
                                if (!problemSearchQuery || !problemSearchQuery.trim()) return true;
                                const q = problemSearchQuery.trim().toLowerCase();
                                return (
                                    p.title?.toLowerCase().includes(q) ||
                                    p.description?.toLowerCase().includes(q) ||
                                    p.category?.toLowerCase().includes(q) ||
                                    String(p.statementNumber)?.includes(q)
                                );
                            });

                            const isAllSelected = filteredProblems.length > 0 && filteredProblems.every((p) => selectedProblemIds.includes(p._id));
                            const hasSelected = selectedProblemIds.length > 0;

                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    {/* Form for Creating / Editing Problem Statement */}
                                    <div className="glass-card" style={{ padding: "28px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <span className="badge badge-gold">ROUND 3 & ROUND 5</span>
                                                <h3 style={{ fontSize: "18px", margin: 0 }}>
                                                    {editingProblemStatement ? `✏️ Edit Problem Statement #${problemForm.statementNumber}` : "➕ Create New Problem Statement"}
                                                </h3>
                                            </div>
                                            {editingProblemStatement && (
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEditProblemStatement}
                                                    className="btn-secondary"
                                                    style={{ padding: "6px 14px", fontSize: "12px" }}
                                                >
                                                    ✕ Cancel Edit
                                                </button>
                                            )}
                                        </div>

                                        <form onSubmit={handleSaveProblemStatement} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                                                <div>
                                                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
                                                        Challenge / Statement Number *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 1"
                                                        min="1"
                                                        value={problemForm.statementNumber}
                                                        onChange={(e) => setProblemForm({ ...problemForm, statementNumber: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: "12px", color: "var(--accent-gold)", display: "block", marginBottom: "6px", fontWeight: "700" }}>
                                                        Base Value (🪙 Tech Coins) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 50"
                                                        min="0"
                                                        value={problemForm.baseValue}
                                                        onChange={(e) => setProblemForm({ ...problemForm, baseValue: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: "12px", color: "var(--primary)", display: "block", marginBottom: "6px", fontWeight: "700" }}>
                                                        Total Copies / Stock *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="e.g. 4"
                                                        min="1"
                                                        value={problemForm.totalCount}
                                                        onChange={(e) => setProblemForm({ ...problemForm, totalCount: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: "13px", color: "#fff", display: "block", marginBottom: "6px", fontWeight: "700" }}>
                                                    Problem Statement *
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Enter full engineering problem statement prompt..."
                                                    value={problemForm.description}
                                                    onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                                                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "13.5px", lineHeight: 1.6 }}
                                                    required
                                                />
                                            </div>

                                            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                                <button type="submit" className="btn-primary" disabled={actionLoading} style={{ padding: "10px 24px" }}>
                                                    {actionLoading ? "Saving..." : editingProblemStatement ? "Update Problem Statement →" : "Create Problem Statement →"}
                                                </button>
                                                {editingProblemStatement && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEditProblemStatement}
                                                        className="btn-secondary"
                                                        style={{ padding: "10px 18px" }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>

                                    {/* Existing Problem Statements List & Bulk Control Toolbar */}
                                    <div className="glass-card" style={{ padding: "28px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                                            <div>
                                                <h3 style={{ fontSize: "18px", margin: 0 }}>Problem Statements Catalog</h3>
                                                <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                                                    Challenge prompts allocated to teams during Round 3 and evaluated in Round 5.
                                                </span>
                                            </div>
                                            <span className="badge badge-gold">{problemCatalog.length} Total Challenges</span>
                                        </div>

                                        {/* Search & Bulk Action Toolbar */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                            padding: "14px 18px",
                                            background: "rgba(255, 255, 255, 0.02)",
                                            border: "1px solid rgba(255, 255, 255, 0.06)",
                                            borderRadius: "12px",
                                            marginBottom: "20px",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "280px", maxWidth: "480px" }}>
                                                <div style={{ position: "relative", width: "100%" }}>
                                                    <input
                                                        type="text"
                                                        placeholder="🔍 Search problem statements (e.g. EV, Platooning, Thermal, V2G)..."
                                                        value={problemSearchQuery}
                                                        onChange={(e) => setProblemSearchQuery(e.target.value)}
                                                        style={{
                                                            width: "100%",
                                                            padding: "9px 36px 9px 14px",
                                                            fontSize: "13px",
                                                            borderRadius: "8px",
                                                            background: "rgba(0,0,0,0.4)",
                                                            border: problemSearchQuery ? "1px solid var(--accent-gold)" : "1px solid rgba(255,255,255,0.1)",
                                                            color: "#fff",
                                                        }}
                                                    />
                                                    {problemSearchQuery && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setProblemSearchQuery("")}
                                                            style={{
                                                                position: "absolute",
                                                                right: "10px",
                                                                top: "50%",
                                                                transform: "translateY(-50%)",
                                                                background: "transparent",
                                                                border: "none",
                                                                color: "var(--text-muted)",
                                                                cursor: "pointer",
                                                                fontSize: "13px",
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Select All & Bulk Delete Options */}
                                            {filteredProblems.length > 0 && (
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                    <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700", color: isAllSelected ? "var(--primary)" : "var(--text-main)" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllSelected}
                                                            onChange={() => handleSelectAllProblems(filteredProblems)}
                                                            style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--primary)" }}
                                                        />
                                                        <span>{isAllSelected ? "Deselect All" : `Select All (${filteredProblems.length})`}</span>
                                                    </label>

                                                    {hasSelected && (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <span style={{ fontSize: "12px", color: "var(--accent-gold)", fontWeight: "700" }}>
                                                                {selectedProblemIds.length} Selected
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={handleDeleteSelectedProblems}
                                                                className="btn-danger"
                                                                disabled={actionLoading}
                                                                style={{ padding: "6px 14px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                                            >
                                                                🗑️ Delete Selected ({selectedProblemIds.length})
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Problem Statements List */}
                                        {problemCatalog.length === 0 ? (
                                            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                                🎯 No problem statements in catalog yet. Use the form above to add one!
                                            </div>
                                        ) : filteredProblems.length === 0 ? (
                                            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-dim)", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                                                <p style={{ margin: "0 0 12px 0", fontSize: "15px" }}>No problem statements matching "{problemSearchQuery}".</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setProblemSearchQuery("")}
                                                    className="btn-secondary"
                                                    style={{ padding: "6px 14px", fontSize: "12px" }}
                                                >
                                                    Clear Search
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                {filteredProblems.map((p) => {
                                                    const isSelected = selectedProblemIds.includes(p._id);

                                                    return (
                                                        <div
                                                            key={p._id}
                                                            style={{
                                                                padding: "20px 24px",
                                                                borderRadius: "12px",
                                                                background: isSelected ? "rgba(0, 240, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
                                                                border: isSelected
                                                                    ? "1px solid rgba(0, 240, 255, 0.35)"
                                                                    : editingProblemStatement?._id === p._id
                                                                        ? "1px solid var(--accent-gold)"
                                                                        : "1px solid rgba(255, 255, 255, 0.08)",
                                                                display: "flex",
                                                                gap: "16px",
                                                                alignItems: "flex-start",
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            {/* Checkbox */}
                                                            <div style={{ paddingTop: "4px" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleProblemSelection(p._id)}
                                                                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--primary)" }}
                                                                />
                                                            </div>

                                                            {/* Main Details */}
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                                        <span className="badge badge-cyan" style={{ fontSize: "11px", fontWeight: "800" }}>
                                                                            CHALLENGE #{p.statementNumber}
                                                                        </span>
                                                                        <span style={{ fontSize: "11px", color: "var(--accent-gold)", background: "rgba(255, 215, 0, 0.1)", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                                                                            🪙 Base Value: {p.minBid !== undefined ? p.minBid : (p.baseValue || 50)}
                                                                        </span>
                                                                        <span
                                                                            className={
                                                                                (p.remainingCount !== undefined ? p.remainingCount : (p.totalCount || 4)) > 0
                                                                                    ? "badge badge-green"
                                                                                    : "badge badge-danger"
                                                                            }
                                                                            style={{ fontSize: "11px", fontWeight: "700" }}
                                                                        >
                                                                            📦 {p.remainingCount !== undefined ? p.remainingCount : (p.totalCount || 4)} / {p.totalCount || 4} Available
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: "6px" }}>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleEditProblemStatement(p)}
                                                                            className="btn-secondary"
                                                                            style={{ padding: "5px 12px", fontSize: "12px", fontWeight: "600" }}
                                                                        >
                                                                            ✏️ Edit
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleDeleteProblemStatement(p._id, p.description || p.title || `Challenge #${p.statementNumber}`)}
                                                                            className="btn-danger"
                                                                            style={{ padding: "5px 12px", fontSize: "12px", fontWeight: "600" }}
                                                                        >
                                                                            🗑️ Delete
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <p style={{ fontSize: "14px", color: "#fff", lineHeight: 1.6, margin: 0, fontWeight: "500" }}>
                                                                    {p.description || p.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

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
