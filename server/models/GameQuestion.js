const mongoose = require("mongoose");

const gameQuestionSchema = new mongoose.Schema(
    {
        round: {
            type: Number,
            required: true,
        },

        game: {
            type: Number,
            required: true,
        },

        question: {
            type: String,
            required: true,
            trim: true,
        },

        options: {
            type: [String],
            default: [],
        },

        correctAnswer: {
            type: String,
            required: true,
            trim: true,
        },

        timeLimit: {
            type: Number,
            default: 10,
        },

        coinValue: {
            type: Number,
            default: 0,
        },

        questionOrder: {
            type: Number,
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("GameQuestion", gameQuestionSchema);