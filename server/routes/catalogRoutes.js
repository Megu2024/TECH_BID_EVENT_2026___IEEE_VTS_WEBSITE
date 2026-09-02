const express = require("express");
const protectAdmin = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");

const {
    getQuestionsList,
    createOrUpdateQuestion,
    deleteQuestion,
    batchUpdateQuestionsTimeLimit,
    bulkUpdateQuestions,
    getImageSets,
    saveImageSet,
    getTechCardsCatalog,
    createOrUpdateTechCard,
    bulkUpdateTechCardsMarketValues,
    deleteTechCard,
    getProblemStatementsCatalog,
    createOrUpdateProblemStatement,
    deleteProblemStatement,
    bulkDeleteProblemStatements,
} = require("../controllers/catalogController");

const router = express.Router();

// Questions
router.get("/questions", protectAdmin, getQuestionsList);
router.post("/questions", protectAdmin, createOrUpdateQuestion);
router.put("/questions/batch-time", protectAdmin, batchUpdateQuestionsTimeLimit);
router.put("/questions/bulk", protectAdmin, bulkUpdateQuestions);
router.delete("/questions/:id", protectAdmin, deleteQuestion);

// Image Sets (R1G2)
router.get("/image-sets", protectAdmin, getImageSets);
router.post("/image-sets", protectAdmin, saveImageSet);

// Tech Cards
router.get("/tech-cards", protect, getTechCardsCatalog); // Accessible to authenticated participants & admins
router.get("/tech-cards/public", getTechCardsCatalog); // For public projector presentation screen
router.post("/tech-cards", protectAdmin, createOrUpdateTechCard);
router.put("/tech-cards/bulk-market", protectAdmin, bulkUpdateTechCardsMarketValues);
router.delete("/tech-cards/:id", protectAdmin, deleteTechCard);

// Problem Statements (Available to admin & projector screen)
router.get("/problem-statements", protectAdmin, getProblemStatementsCatalog);
router.get("/problem-statements/public", getProblemStatementsCatalog); // For public projector presentation screen
router.post("/problem-statements", protectAdmin, createOrUpdateProblemStatement);
router.post("/problem-statements/bulk-delete", protectAdmin, bulkDeleteProblemStatements);
router.delete("/problem-statements/:id", protectAdmin, deleteProblemStatement);

module.exports = router;
