const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema(
    {
        game: {
            type: Number,
            required: true,
        },

        round: {
            type: Number,
            required: true,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        totalQuestions: {
            type: Number,
            required: true,
        },

        currentQuestionNumber: {
            type: Number,
            default: 1,
        },

        questionDuration: {
            type: Number,
            default: 10,
        },

        questionStartedAt: {
            type: Date,
            default: null,
        },

        startedAt: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["waiting", "running", "completed"],
            default: "waiting",
        },

        version: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * One independent session per team for each game + round + session version.
 */
gameSessionSchema.index(
    {
        game: 1,
        round: 1,
        team: 1,
        version: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("GameSession", gameSessionSchema);