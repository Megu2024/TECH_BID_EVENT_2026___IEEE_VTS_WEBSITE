const mongoose = require("mongoose");

const eventSettingsSchema = new mongoose.Schema(
    {
        currentRound: {
            type: Number,
            default: 1,
        },

        currentGame: {
            type: Number,
            default: 1,
        },

        // Round 1 Game 1: Technical Quiz
        r1g1Enabled: {
            type: Boolean,
            default: false,
        },
        r1g1Pin: {
            type: String,
            default: "1234",
        },
        r1g1Version: {
            type: Number,
            default: 1,
        },

        // Round 1 Game 3: Code Output / Debugging
        r1g3Enabled: {
            type: Boolean,
            default: false,
        },
        r1g3Pin: {
            type: String,
            default: "5678",
        },
        r1g3Version: {
            type: Number,
            default: 1,
        },

        // Round 4 Game 1: Jumbled Technical Words
        r4g1Enabled: {
            type: Boolean,
            default: false,
        },
        r4g1Pin: {
            type: String,
            default: "9012",
        },
        r4g1Version: {
            type: Number,
            default: 1,
        },

        // Legacy aliases
        quizEnabled: {
            type: Boolean,
            default: false,
        },
        quizPin: {
            type: String,
            default: "1234",
        },

        // Leaderboard / Ranking visibility to participants
        leaderboardVisible: {
            type: Boolean,
            default: false,
        },

        // Allow participants to view correct answers for quizzes
        quizAnswersVisible: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("EventSettings", eventSettingsSchema);