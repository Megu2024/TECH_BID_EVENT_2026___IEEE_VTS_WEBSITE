const express = require("express");
const protectAdmin = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");

const {
    getQuestionsList,
    createOrUpdateQuestion,
    deleteQuestion,
    getImageSets,
    saveImageSet,
    getTechCardsCatalog,
    createOrUpdateTechCard,
    deleteTechCard,
    getProblemStatementsCatalog,
    createOrUpdateProblemStatement,
    deleteProblemStatement,
} = require("../controllers/catalogController");

const router = express.Router();

// Questions
router.get("/questions", protectAdmin, getQuestionsList);
router.post("/questions", protectAdmin, createOrUpdateQuestion);
router.delete("/questions/:id", protectAdmin, deleteQuestion);

// Image Sets (R1G2)
router.get("/image-sets", protectAdmin, getImageSets);
router.post("/image-sets", protectAdmin, saveImageSet);

// Tech Cards
router.get("/tech-cards", protect, getTechCardsCatalog); // Accessible to authenticated participants & admins
router.post("/tech-cards", protectAdmin, createOrUpdateTechCard);
router.delete("/tech-cards/:id", protectAdmin, deleteTechCard);

// Problem Statements (Available to admin & projector screen)
router.get("/problem-statements", protectAdmin, getProblemStatementsCatalog);
router.get("/problem-statements/public", getProblemStatementsCatalog); // For public projector presentation screen
router.post("/problem-statements", protectAdmin, createOrUpdateProblemStatement);
router.delete("/problem-statements/:id", protectAdmin, deleteProblemStatement);

module.exports = router;
