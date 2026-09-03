const express = require("express");
const protectAdmin = require("../middleware/adminMiddleware");

const {
    adminLogin,
    getAdminProfile,
    getAllTeams,
    getAdminBootstrap,
    deleteTeam,
    scoreRound1Game2,
    assignTechCards,
    scoreRound4Game2,
    assignProblemStatementAuction,
    scoreRound5,
    scoreRound5FinalEvaluation,
    triggerRecalculateRanks,
    toggleLeaderboardVisibility,
    toggleQuizAnswersVisibility,
} = require("../controllers/adminController");

const router = express.Router();

// Public Admin Login
router.post("/login", adminLogin);

// Protected Admin Routes
router.get("/profile", protectAdmin, getAdminProfile);
router.get("/bootstrap", protectAdmin, getAdminBootstrap);
router.get("/teams", protectAdmin, getAllTeams);
router.delete("/teams/:id", protectAdmin, deleteTeam);

// Scoring & Assignment Portals
router.post("/score/round1-game2", protectAdmin, scoreRound1Game2);
router.post("/assign/tech-cards", protectAdmin, assignTechCards);
router.post("/score/round4-game2", protectAdmin, scoreRound4Game2);
router.post("/assign/auction-statement", protectAdmin, assignProblemStatementAuction);
router.post("/score/round5", protectAdmin, scoreRound5);
router.post("/score/final-evaluation", protectAdmin, scoreRound5FinalEvaluation);

// Rankings & Controls
router.post("/recalculate-ranks", protectAdmin, triggerRecalculateRanks);
router.post("/toggle-leaderboard", protectAdmin, toggleLeaderboardVisibility);
router.post("/toggle-quiz-answers", protectAdmin, toggleQuizAnswersVisibility);

module.exports = router;