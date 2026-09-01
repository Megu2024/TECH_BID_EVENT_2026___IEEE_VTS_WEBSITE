const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
    registerUser,
    loginUser,
    getCurrentUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

module.exports = router;