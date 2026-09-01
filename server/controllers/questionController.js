const Question = require("../models/Question");

const getQuestions = async (req, res) => {
    try {
        const { game, round } = req.query;

        if (!game || !round) {
            return res.status(400).json({
                message: "Game and round are required",
            });
        }

        const questions = await Question.find({
            game: Number(game),
            round: Number(round),
        })
            .select("-correctAnswer")
            .sort({ questionNumber: 1 });

        if (!questions.length) {
            return res.status(404).json({
                message: "No questions found for this game and round",
            });
        }

        return res.status(200).json({
            game: Number(game),
            round: Number(round),
            totalQuestions: questions.length,
            questions,
        });
    } catch (error) {
        console.error("Get questions error:", error);

        return res.status(500).json({
            message: "Server error while fetching questions",
        });
    }
};

module.exports = {
    getQuestions,
};