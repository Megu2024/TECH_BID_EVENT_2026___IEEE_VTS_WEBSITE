const express = require("express");

const protect = require("../middleware/authMiddleware");

const { getQuestions } = require("../controllers/questionController");

const router = express.Router();

router.get("/", protect, getQuestions);

module.exports = router;