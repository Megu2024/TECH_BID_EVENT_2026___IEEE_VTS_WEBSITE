import { useState, useEffect } from "react";
import api from "../../services/api";

function ContentManager({
    teams,
    imageSets,
    setImageSets,
    cardsCatalog,
    setCardsCatalog,
    problemCatalog,
    setProblemCatalog,
    questions,
    setQuestions,
    loading,
    actionLoading,
    setActionLoading,
    setError,
    setMessage,
    loadAllData,
    triggerConfirm,
    activeTab
}) {
        const [editingTechCard, setEditingTechCard] = useState(null);
    const [techCardForm, setTechCardForm] = useState({
        name: "",
        basePrice: 70,
        totalCount: 4,
        description: "",
    });
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
    const [cardSearchQuery, setCardSearchQuery] = useState('');
    const [marketDraft, setMarketDraft] = useState({});
    const [techCardsSubView, setTechCardsSubView] = useState('catalog');
    const [savedSuccessId, setSavedSuccessId] = useState(null);

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
            refreshImageSets();
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

    useEffect(() => {
        if (activeTab === "content" && contentSubTab === "imagesets") {
            const hasFullImages = imageSets.some((s) => s.questions?.some((q) => q.images && q.images.length > 0));
            if (!hasFullImages) {
                refreshImageSets();
            }
        }
    }, [activeTab, contentSubTab]);

    return (
        <div>
                            {/* ========================================================================= */}
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


            </div>
    );
}

export default ContentManager;
