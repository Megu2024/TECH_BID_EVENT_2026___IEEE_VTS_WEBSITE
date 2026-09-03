export const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
    }
    if (import.meta.env.PROD || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1")) {
        return "https://tech-bid-event-2026-ieee-vts-website.onrender.com";
    }
    return "http://localhost:5000";
};

export const API_BASE_URL = getApiBaseUrl();

const getHeaders = (includeAuth = true) => {
    const headers = {
        "Content-Type": "application/json",
    };
    if (includeAuth) {
        const token = localStorage.getItem("token");
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }
    return headers;
};

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
};

export const api = {
    // ----------------------------------------------------
    // AUTH & USER
    // ----------------------------------------------------
    register: (userData) =>
        fetch(`${API_BASE_URL}/api/users/register`, {
            method: "POST",
            headers: getHeaders(false),
            body: JSON.stringify(userData),
        }).then(handleResponse),

    login: (credentials) =>
        fetch(`${API_BASE_URL}/api/users/login`, {
            method: "POST",
            headers: getHeaders(false),
            body: JSON.stringify(credentials),
        }).then(handleResponse),

    getMe: () =>
        fetch(`${API_BASE_URL}/api/users/me`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    // ----------------------------------------------------
    // ADMIN AUTH & MANAGEMENT
    // ----------------------------------------------------
    adminLogin: (credentials) =>
        fetch(`${API_BASE_URL}/api/admin/login`, {
            method: "POST",
            headers: getHeaders(false),
            body: JSON.stringify(credentials),
        }).then(handleResponse),

    getAdminProfile: () =>
        fetch(`${API_BASE_URL}/api/admin/profile`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getAdminBootstrap: () =>
        fetch(`${API_BASE_URL}/api/admin/bootstrap`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getAllTeams: (search = "") =>
        fetch(`${API_BASE_URL}/api/admin/teams${search ? `?search=${encodeURIComponent(search)}` : ""}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    deleteTeam: (teamId) =>
        fetch(`${API_BASE_URL}/api/admin/teams/${teamId}`, {
            method: "DELETE",
            headers: getHeaders(true),
        }).then(handleResponse),

    scoreR1G2: (data) =>
        fetch(`${API_BASE_URL}/api/admin/score/round1-game2`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    assignTechCards: (data) =>
        fetch(`${API_BASE_URL}/api/admin/assign/tech-cards`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    scoreR4G2: (data) =>
        fetch(`${API_BASE_URL}/api/admin/score/round4-game2`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    assignAuctionStatement: (data) =>
        fetch(`${API_BASE_URL}/api/admin/assign/auction-statement`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    scoreRound5: (data) =>
        fetch(`${API_BASE_URL}/api/admin/score/round5`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    scoreFinalEvaluation: (data) =>
        fetch(`${API_BASE_URL}/api/admin/score/final-evaluation`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    recalculateRanks: () =>
        fetch(`${API_BASE_URL}/api/admin/recalculate-ranks`, {
            method: "POST",
            headers: getHeaders(true),
        }).then(handleResponse),

    toggleLeaderboard: (visible) =>
        fetch(`${API_BASE_URL}/api/admin/toggle-leaderboard`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ leaderboardVisible: visible }),
        }).then(handleResponse),

    // ----------------------------------------------------
    // TEAM
    // ----------------------------------------------------
    getMyTeam: () =>
        fetch(`${API_BASE_URL}/api/teams/my-team`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    createTeam: (data) =>
        fetch(`${API_BASE_URL}/api/teams`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(typeof data === "string" ? { teamName: data } : data),
        }).then(handleResponse),

    addTeamMember: (memberData) =>
        fetch(`${API_BASE_URL}/api/teams/members`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(memberData),
        }).then(handleResponse),

    inviteMember: (memberData) =>
        fetch(`${API_BASE_URL}/api/teams/members`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(memberData),
        }).then(handleResponse),

    removeTeamMember: (memberId) =>
        fetch(`${API_BASE_URL}/api/teams/members/${memberId}`, {
            method: "DELETE",
            headers: getHeaders(true),
        }).then(handleResponse),

    // ----------------------------------------------------
    // ONLINE GAMES
    // ----------------------------------------------------
    verifyGamePin: (game, round, pin) =>
        fetch(`${API_BASE_URL}/api/game/verify-pin`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ game, round, pin }),
        }).then(handleResponse),

    startGame: (game, round, pin) =>
        fetch(`${API_BASE_URL}/api/game/start`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ game, round, pin }),
        }).then(handleResponse),

    getCurrentQuestion: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/current-question?game=${game}&round=${round}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    startQuestionTimer: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/start-timer`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ game, round }),
        }).then(handleResponse),

    submitAnswer: (game, round, questionNumber, selectedAnswer) =>
        fetch(`${API_BASE_URL}/api/game/answer`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ game, round, questionNumber, selectedAnswer }),
        }).then(handleResponse),

    getTeamScore: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/score?game=${game}&round=${round}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getGameSessionStatus: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/session-status?game=${game}&round=${round}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getGameReviewAnswers: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/review-answers?game=${game}&round=${round}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    endGame: (game, round) =>
        fetch(`${API_BASE_URL}/api/game/end-game`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ game, round }),
        }).then(handleResponse),

    // ----------------------------------------------------
    // EVENT SETTINGS & STATUS
    // ----------------------------------------------------
    getEventSettings: () =>
        fetch(`${API_BASE_URL}/api/events`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    updateEventSettings: (settings) =>
        fetch(`${API_BASE_URL}/api/events`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(settings),
        }).then(handleResponse),

    getEventStatus: () =>
        fetch(`${API_BASE_URL}/api/events/status`, {
            method: "GET",
            headers: getHeaders(false),
        }).then(handleResponse),

    getPublicLeaderboard: () =>
        fetch(`${API_BASE_URL}/api/events/leaderboard`, {
            method: "GET",
            headers: getHeaders(false),
        }).then(handleResponse),

    // ----------------------------------------------------
    // CATALOG & QUESTIONS
    // ----------------------------------------------------
    getQuestions: (game, round) =>
        fetch(`${API_BASE_URL}/api/catalog/questions?game=${game || ""}&round=${round || ""}`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    saveQuestion: (questionData) =>
        fetch(`${API_BASE_URL}/api/catalog/questions`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(questionData),
        }).then(handleResponse),

    deleteQuestion: (id) =>
        fetch(`${API_BASE_URL}/api/catalog/questions/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        }).then(handleResponse),

    batchUpdateQuestionsTimeLimit: (data) =>
        fetch(`${API_BASE_URL}/api/catalog/questions/batch-time`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(data),
        }).then(handleResponse),

    bulkUpdateQuestions: (questions) =>
        fetch(`${API_BASE_URL}/api/catalog/questions/bulk`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ questions }),
        }).then(handleResponse),

    getImageSets: () =>
        fetch(`${API_BASE_URL}/api/catalog/image-sets`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    saveImageSet: (setData) =>
        fetch(`${API_BASE_URL}/api/catalog/image-sets`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(setData),
        }).then(handleResponse),

    getTechCardsCatalog: () =>
        fetch(`${API_BASE_URL}/api/catalog/tech-cards`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getPublicTechCards: () =>
        fetch(`${API_BASE_URL}/api/catalog/tech-cards/public`, {
            method: "GET",
            headers: getHeaders(false),
        }).then(handleResponse),

    saveTechCard: (cardData) =>
        fetch(`${API_BASE_URL}/api/catalog/tech-cards`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(cardData),
        }).then(handleResponse),

    bulkUpdateTechCardsMarket: (cards) =>
        fetch(`${API_BASE_URL}/api/catalog/tech-cards/bulk-market`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify({ cards }),
        }).then(handleResponse),

    deleteTechCard: (id) =>
        fetch(`${API_BASE_URL}/api/catalog/tech-cards/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        }).then(handleResponse),

    getProblemStatementsCatalog: () =>
        fetch(`${API_BASE_URL}/api/catalog/problem-statements`, {
            method: "GET",
            headers: getHeaders(true),
        }).then(handleResponse),

    getPublicProblemStatements: () =>
        fetch(`${API_BASE_URL}/api/catalog/problem-statements/public`, {
            method: "GET",
            headers: getHeaders(false),
        }).then(handleResponse),

    saveProblemStatement: (statementData) =>
        fetch(`${API_BASE_URL}/api/catalog/problem-statements`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(statementData),
        }).then(handleResponse),

    deleteProblemStatement: (id) =>
        fetch(`${API_BASE_URL}/api/catalog/problem-statements/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        }).then(handleResponse),

    bulkDeleteProblemStatements: (ids) =>
        fetch(`${API_BASE_URL}/api/catalog/problem-statements/bulk-delete`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify({ ids }),
        }).then(handleResponse),
};

export default api;
