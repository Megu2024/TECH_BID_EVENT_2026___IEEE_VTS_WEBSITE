const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    getMyTeam,
    createTeam,
    addMember,
    removeMember,
} = require("../controllers/teamController");

const router = express.Router();

router.get("/my-team", protect, getMyTeam);
router.post("/", protect, createTeam);
router.post("/members", protect, addMember);
router.post("/invite", protect, addMember);
router.delete("/members/:memberId", protect, removeMember);

module.exports = router;