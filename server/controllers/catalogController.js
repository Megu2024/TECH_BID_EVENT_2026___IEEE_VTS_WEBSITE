const Question = require("../models/Question");
const ImageSet = require("../models/ImageSet");
const TechCard = require("../models/TechCard");
const ProblemStatement = require("../models/ProblemStatement");

// ============================================================
// QUESTIONS CRUD
// ============================================================
const getQuestionsList = async (req, res) => {
    try {
        const { game, round } = req.query;
        let query = {};
        if (game) query.game = Number(game);
        if (round) query.round = Number(round);

        const questions = await Question.find(query).sort({ game: 1, round: 1, questionNumber: 1 });

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

// ============================================================
// IMAGE SETS (Round 1 Game 2)
// ============================================================
const getImageSets = async (req, res) => {
    try {
        const sets = await ImageSet.find().sort({ setNumber: 1 });
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
        const cards = await TechCard.find().sort({ name: 1 });
        return res.status(200).json({ cards });
    } catch (error) {
        console.error("Get tech cards error:", error);
        return res.status(500).json({ message: "Server error while fetching tech cards" });
    }
};

const createOrUpdateTechCard = async (req, res) => {
    try {
        const { id, name, basePrice, marketValue, category, description } = req.body;

        if (!name) {
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

        card.name = name.trim();
        card.basePrice = Number(basePrice || 50);
        card.marketValue = Number(marketValue || 100);
        card.category = category || "Hardware / Software";
        card.description = description || "";

        await card.save();

        return res.status(200).json({
            message: "Tech Card saved successfully",
            card,
        });
    } catch (error) {
        console.error("Save tech card error:", error);
        return res.status(500).json({ message: "Server error while saving tech card" });
    }
};

const deleteTechCard = async (req, res) => {
    try {
        const { id } = req.params;
        await TechCard.findByIdAndDelete(id);
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
        const statements = await ProblemStatement.find().sort({ statementNumber: 1 });
        return res.status(200).json({ statements });
    } catch (error) {
        console.error("Get problem statements error:", error);
        return res.status(500).json({ message: "Server error while fetching problem statements" });
    }
};

const createOrUpdateProblemStatement = async (req, res) => {
    try {
        const { id, statementNumber, title, description, category, requiredTechCards, minBid } = req.body;

        if (!statementNumber || !title || !description) {
            return res.status(400).json({
                message: "statementNumber, title, and description are required",
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

        statement.statementNumber = Number(statementNumber);
        statement.title = title.trim();
        statement.description = description.trim();
        statement.category = category || "Autonomous Systems / EV / Smart Mobility";
        statement.requiredTechCards = Array.isArray(requiredTechCards) ? requiredTechCards : [];
        statement.minBid = Number(minBid || 50);

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

module.exports = {
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
};
