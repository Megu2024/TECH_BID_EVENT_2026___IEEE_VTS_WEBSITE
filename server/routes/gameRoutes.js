const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    verifyGamePin,
    startGame,
    getCurrentQuestion,
    submitAnswer,
    getTeamScore,
    getGameSessionStatus,
    getGameAnswers,
    endGame,
    startQuestionTimer,
} = require("../controllers/gameController");

const router = express.Router();

router.post("/verify-pin", protect, verifyGamePin);
router.post("/start", protect, startGame);
router.get("/current-question", protect, getCurrentQuestion);
router.post("/start-timer", protect, startQuestionTimer);
router.post("/answer", protect, submitAnswer);
router.get("/score", protect, getTeamScore);
router.get("/session-status", protect, getGameSessionStatus);
router.get("/review-answers", protect, getGameAnswers);
router.post("/end-game", protect, endGame);

module.exports = router;