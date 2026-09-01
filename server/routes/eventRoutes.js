const express = require("express");
const protectAdmin = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");

const {
    getEventSettings,
    updateEventSettings,
    getParticipantEventStatus,
    getPublicLeaderboard,
} = require("../controllers/eventController");

const router = express.Router();

// Admin
router.get("/", protectAdmin, getEventSettings);
router.put("/", protectAdmin, updateEventSettings);

// Participant / Public
router.get("/status", getParticipantEventStatus);
router.get("/leaderboard", getPublicLeaderboard);

module.exports = router;