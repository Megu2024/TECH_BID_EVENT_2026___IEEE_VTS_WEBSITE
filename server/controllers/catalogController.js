const Question = require("../models/Question");
const ImageSet = require("../models/ImageSet");
const TechCard = require("../models/TechCard");
const ProblemStatement = require("../models/ProblemStatement");
const Team = require("../models/Team");
const { recalculateAllTeamRanks } = require("../services/scoringService");

// ============================================================
// QUESTIONS CRUD
// ============================================================
const getQuestionsList = async (req, res) => {
    try {
        const { game, round } = req.query;
        let query = {};
        if (game) query.game = Number(game);
        if (round) query.round = Number(round);

        const questions = await Question.find(query)
            .sort({ game: 1, round: 1, questionNumber: 1 })
            .lean();

        return res.status(200).json({
            count: questions.length,
            questions,
        });
    } catch (error) {
        console.error("Get questions error:", error);
        return res.status(500).json({ message: "Server error while fetching questions" });
    }
};

const createOrUpdateQuestion = async (req, res) => {
    try {
        const {
            id,
            game,
            round,
            questionNumber,
            questionType,
            question,
            codeSnippet,
            jumbledWord,
            hint,
            options,
            correctAnswer,
            techCoins,
            timeLimit,
        } = req.body;

        if (!game || !round || !questionNumber || !question || !correctAnswer) {
            return res.status(400).json({
                message: "game, round, questionNumber, question, and correctAnswer are required",
            });
        }

        let questionDoc;
        if (id) {
            questionDoc = await Question.findById(id);
        } else {
            questionDoc = await Question.findOne({
                game: Number(game),
                round: Number(round),
                questionNumber: Number(questionNumber),
            });
        }

        if (!questionDoc) {
            questionDoc = new Question({
                game: Number(game),
                round: Number(round),
                questionNumber: Number(questionNumber),
            });
        }

        questionDoc.questionType = questionType || "mcq";
        questionDoc.question = question.trim();
        questionDoc.codeSnippet = codeSnippet || "";
        questionDoc.jumbledWord = jumbledWord || "";
        questionDoc.hint = hint || "";
        questionDoc.options = options || { A: "", B: "", C: "", D: "" };
        questionDoc.correctAnswer = String(correctAnswer).trim();
        questionDoc.techCoins = Number(techCoins || 20);
        questionDoc.timeLimit = Number(timeLimit || 10);

        await questionDoc.save();

        return res.status(200).json({
            message: "Question saved successfully",
            question: questionDoc,
        });
    } catch (error) {
        console.error("Save question error:", error);
        return res.status(500).json({ message: "Server error while saving question" });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        await Question.findByIdAndDelete(id);
        return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Delete question error:", error);
        return res.status(500).json({ message: "Server error while deleting question" });
    }
};

const batchUpdateQuestionsTimeLimit = async (req, res) => {
    try {
        const { ids, timeLimit } = req.body;
        if (!Array.isArray(ids) || ids.length === 0 || !timeLimit) {
            return res.status(400).json({ message: "ids array and timeLimit are required" });
        }
        await Question.updateMany(
            { _id: { $in: ids } },
            { $set: { timeLimit: Number(timeLimit) } }
        );
        return res.status(200).json({ message: `Successfully updated time limit to ${timeLimit}s for ${ids.length} questions` });
    } catch (error) {
        console.error("Batch update questions time limit error:", error);
        return res.status(500).json({ message: "Server error while batch updating time limit" });
    }
};

const bulkUpdateQuestions = async (req, res) => {
    try {
        const { questions } = req.body;
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "questions array is required" });
        }

        const bulkOps = questions.map((q) => ({
            updateOne: {
                filter: { _id: q.id || q._id },
                update: {
                    $set: {
                        ...(q.techCoins !== undefined && { techCoins: Number(q.techCoins) }),
                        ...(q.timeLimit !== undefined && { timeLimit: Number(q.timeLimit) }),
                        ...(q.question !== undefined && { question: q.question.trim() }),
                        ...(q.correctAnswer !== undefined && { correctAnswer: String(q.correctAnswer).trim() }),
                    },
                },
            },
        }));

        await Question.bulkWrite(bulkOps);

        return res.status(200).json({
            message: `Successfully updated ${questions.length} questions!`,
        });
    } catch (error) {
        console.error("Bulk update questions error:", error);
        return res.status(500).json({ message: "Server error while bulk updating questions" });
    }
};

// ============================================================
// IMAGE SETS (Round 1 Game 2)
// ============================================================
const getImageSets = async (req, res) => {
    try {
        const sets = await ImageSet.find().sort({ setNumber: 1 }).lean();
        return res.status(200).json({ sets });
    } catch (error) {
        console.error("Get image sets error:", error);
        return res.status(500).json({ message: "Server error while fetching image sets" });
    }
};

const saveImageSet = async (req, res) => {
    try {
        const { setNumber, setName, questions } = req.body;

        if (!setNumber || !questions) {
            return res.status(400).json({ message: "setNumber and questions are required" });
        }

        let imageSet = await ImageSet.findOne({ setNumber: Number(setNumber) });

        if (!imageSet) {
            imageSet = new ImageSet({ setNumber: Number(setNumber) });
        }

        imageSet.setName = setName || `Image Set ${setNumber}`;
        imageSet.questions = questions;

        await imageSet.save();

        return res.status(200).json({
            message: "Image set saved successfully",
            set: imageSet,
        });
    } catch (error) {
        console.error("Save image set error:", error);
        return res.status(500).json({ message: "Server error while saving image set" });
    }
};

// ============================================================
// TECH CARDS CATALOG (Round 2)
// ============================================================
const getTechCardsCatalog = async (req, res) => {
    try {
        const cards = await TechCard.find().sort({ name: 1 }).lean();
        const teams = await Team.find({}, "techCards").lean();

        // Count how many times each card is allotted across all teams
        const cardAllotmentCounts = {};
        teams.forEach((team) => {
            (team.techCards || []).forEach((c) => {
                const cName = c.name?.trim();
                if (cName) {
                    cardAllotmentCounts[cName] = (cardAllotmentCounts[cName] || 0) + 1;
                }
            });
        });

        const cardsWithCounts = cards.map((card) => {
            const total = card.totalCount !== undefined ? Number(card.totalCount) : 4;
            const allotted = cardAllotmentCounts[card.name?.trim()] || 0;
            const remaining = Math.max(0, total - allotted);
            return {
                ...card,
                totalCount: total,
                allottedCount: allotted,
                remainingCount: remaining,
            };
        });

        return res.status(200).json({ cards: cardsWithCounts, techCards: cardsWithCounts });
    } catch (error) {
        console.error("Get tech cards error:", error);
        return res.status(500).json({ message: "Server error while fetching tech cards" });
    }
};

const createOrUpdateTechCard = async (req, res) => {
    try {
        const { id, name, basePrice, marketValue, totalCount, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Card name is required" });
        }

        let card;
        if (id) {
            card = await TechCard.findById(id);
        } else {
            card = await TechCard.findOne({ name: name.trim() });
        }

        if (!card) {
            card = new TechCard({ name: name.trim() });
        }

        const price = Number(basePrice !== undefined ? basePrice : (marketValue !== undefined ? marketValue : 50));

        card.name = name.trim();
        card.basePrice = price;
        card.marketValue = Number(marketValue !== undefined ? marketValue : price);
        card.totalCount = Number(totalCount !== undefined ? totalCount : (card.totalCount !== undefined ? card.totalCount : 4));
        card.description = description ? description.trim() : "";

        await card.save();

        // Recalculate all team scores and sync card market values
        await recalculateAllTeamRanks();

        return res.status(200).json({
            message: "Tech Card saved successfully",
            card,
        });
    } catch (error) {
        console.error("Save tech card error:", error);
        return res.status(500).json({ message: error.message || "Server error while saving tech card" });
    }
};

// ============================================================
// BULK UPDATE TECH CARDS MARKET VALUES & SYNC ALL TEAMS
// Used during the Post-Auction Market Hike & Fall stage
// ============================================================
const bulkUpdateTechCardsMarketValues = async (req, res) => {
    try {
        const { cards } = req.body;
        if (!Array.isArray(cards) || cards.length === 0) {
            return res.status(400).json({ message: "cards array is required" });
        }

        const bulkOps = cards.map((c) => ({
            updateOne: {
                filter: { _id: c.id || c._id },
                update: {
                    $set: {
                        marketValue: Number(c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50)),
                    },
                },
            },
        }));

        await TechCard.bulkWrite(bulkOps);

        // Recalculate all team ranks and sync their cards' market values!
        const updatedTeams = await recalculateAllTeamRanks();
        const updatedCards = await TechCard.find().sort({ name: 1 }).lean();

        return res.status(200).json({
            message: `Successfully updated market values for ${cards.length} Tech Cards and recalculated all team scores!`,
            cards: updatedCards,
            totalTeamsRecalculated: updatedTeams.length,
        });
    } catch (error) {
        console.error("Bulk update tech cards error:", error);
        return res.status(500).json({ message: error.message || "Server error while updating tech cards" });
    }
};

const deleteTechCard = async (req, res) => {
    try {
        const { id } = req.params;
        await TechCard.findByIdAndDelete(id);
        await recalculateAllTeamRanks();
        return res.status(200).json({ message: "Tech Card deleted successfully" });
    } catch (error) {
        console.error("Delete tech card error:", error);
        return res.status(500).json({ message: "Server error while deleting tech card" });
    }
};

// ============================================================
// PROBLEM STATEMENTS CATALOG (Round 3 & Round 5)
// ============================================================
const getProblemStatementsCatalog = async (req, res) => {
    try {
        const [rawStatements, teams] = await Promise.all([
            ProblemStatement.find().sort({ statementNumber: 1 }).lean(),
            Team.find().select("problemStatement round5").lean(),
        ]);

        const statements = (rawStatements || []).map((p) => {
            const total = p.totalCount !== undefined ? Number(p.totalCount) : 4;
            const descKey = (p.description || "").trim().toLowerCase();
            const titleKey = (p.title || "").trim().toLowerCase();
            const numKey = `challenge #${p.statementNumber}`;

            let allotted = 0;
            teams.forEach((team) => {
                const tStmt = (team.problemStatement || team.round5?.problemStatement || "").trim().toLowerCase();
                if (tStmt && (tStmt === descKey || tStmt === titleKey || (descKey && tStmt.includes(descKey)) || (descKey && descKey.includes(tStmt)) || tStmt === numKey)) {
                    allotted++;
                }
            });

            const remaining = Math.max(0, total - allotted);
            return {
                ...p,
                totalCount: total,
                allottedCount: allotted,
                remainingCount: remaining,
            };
        });

        return res.status(200).json({ statements });
    } catch (error) {
        console.error("Get problem statements error:", error);
        return res.status(500).json({ message: "Server error while fetching problem statements" });
    }
};

const createOrUpdateProblemStatement = async (req, res) => {
    try {
        const { id, statementNumber, title, description, category, requiredTechCards, minBid, baseValue, totalCount } = req.body;

        if (!statementNumber || !description) {
            return res.status(400).json({
                message: "Challenge number and problem statement description are required",
            });
        }

        let statement;
        if (id) {
            statement = await ProblemStatement.findById(id);
        } else {
            statement = await ProblemStatement.findOne({ statementNumber: Number(statementNumber) });
        }

        if (!statement) {
            statement = new ProblemStatement({ statementNumber: Number(statementNumber) });
        }

        const trimmedDesc = description.trim();
        statement.statementNumber = Number(statementNumber);
        statement.title = (title && title.trim()) ? title.trim() : (trimmedDesc.length > 70 ? trimmedDesc.slice(0, 70) + "..." : trimmedDesc);
        statement.description = trimmedDesc;
        statement.category = category ? category.trim() : "Domain Challenge";
        statement.requiredTechCards = Array.isArray(requiredTechCards) ? requiredTechCards : [];
        statement.minBid = Number(baseValue !== undefined ? baseValue : (minBid !== undefined ? minBid : 50));
        statement.totalCount = Number(totalCount !== undefined && totalCount !== null ? totalCount : (statement.totalCount || 4));

        await statement.save();

        return res.status(200).json({
            message: "Problem Statement saved successfully",
            statement,
        });
    } catch (error) {
        console.error("Save problem statement error:", error);
        return res.status(500).json({ message: "Server error while saving problem statement" });
    }
};

const deleteProblemStatement = async (req, res) => {
    try {
        const { id } = req.params;
        await ProblemStatement.findByIdAndDelete(id);
        return res.status(200).json({ message: "Problem Statement deleted successfully" });
    } catch (error) {
        console.error("Delete problem statement error:", error);
        return res.status(500).json({ message: "Server error while deleting problem statement" });
    }
};

const bulkDeleteProblemStatements = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "No problem statement IDs provided" });
        }
        await ProblemStatement.deleteMany({ _id: { $in: ids } });
        return res.status(200).json({
            message: `Successfully deleted ${ids.length} Problem Statements`,
            deletedCount: ids.length,
        });
    } catch (error) {
        console.error("Bulk delete problem statements error:", error);
        return res.status(500).json({ message: "Server error while bulk deleting problem statements" });
    }
};

module.exports = {
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
};
