const mongoose = require("mongoose");

const gameAnswerSchema = new mongoose.Schema(
    {
        game: {
            type: Number,
            required: true,
        },

        round: {
            type: Number,
            required: true,
        },

        questionNumber: {
            type: Number,
            required: true,
        },

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

        selectedAnswer: {
            type: String,
            required: true,
        },

        isCorrect: {
            type: Boolean,
            required: true,
        },

        techCoins: {
            type: Number,
            default: 0,
        },

        version: {
            type: Number,
            default: 1,
        },

        answeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

gameAnswerSchema.index(
    {
        game: 1,
        round: 1,
        questionNumber: 1,
        team: 1,
        version: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("GameAnswer", gameAnswerSchema);