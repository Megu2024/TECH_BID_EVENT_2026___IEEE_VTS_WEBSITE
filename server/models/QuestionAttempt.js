const mongoose = require("mongoose");

const questionAttemptSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GameQuestion",
            required: true,
        },

        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },

        submittedAt: {
            type: Date,
            default: null,
        },

        isCorrect: {
            type: Boolean,
            default: false,
        },

        coinsEarned: {
            type: Number,
            default: 0,
        },

        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

questionAttemptSchema.index(
    { team: 1, question: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "QuestionAttempt",
    questionAttemptSchema
);