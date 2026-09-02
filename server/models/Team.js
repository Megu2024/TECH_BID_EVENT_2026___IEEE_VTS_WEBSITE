const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                name: {
                    type: String,
                    required: true,
                },
                email: {
                    type: String,
                    required: true,
                    trim: true,
                },
                isLeader: {
                    type: Boolean,
                    default: false,
                },
            },
        ],

        // Current available Tech Coins for auction / event
        techCoins: {
            type: Number,
            default: 0,
            min: 0,
        },

        round1: {
            game1Score: {
                type: Number,
                default: 0,
            },
            game2Score: {
                type: Number,
                default: 0,
            },
            game3Score: {
                type: Number,
                default: 0,
            },
            totalScore: {
                type: Number,
                default: 0,
            },
            game2Details: {
                setNumber: { type: Number, default: null },
                wordsUsed: { type: Number, default: null },
                term: { type: String, default: "" },
            },
        },

        // Round 2 Tech Cards possessed
        techCards: [
            {
                name: {
                    type: String,
                    required: true,
                },
                basePrice: {
                    type: Number,
                    default: 0,
                },
                boughtPrice: {
                    type: Number,
                    default: 0,
                },
                marketValue: {
                    type: Number,
                    default: 0,
                },
                category: {
                    type: String,
                    default: "",
                },
            },
        ],

        round4: {
            game1Score: {
                type: Number,
                default: 0,
            },
            game2Score: {
                type: Number,
                default: 0,
            },
            totalScore: {
                type: Number,
                default: 0,
            },
            game2Details: {
                q1Score: { type: Number, default: 0 },
                q2Score: { type: Number, default: 0 },
                q3Score: { type: Number, default: 0 },
                q4Score: { type: Number, default: 0 },
            },
        },

        // Round 5 Final Auction & Evaluation
        round5: {
            problemStatement: {
                type: String,
                default: null,
            },
            auctionCoinsSpent: {
                type: Number,
                default: 0,
            },
            matchedCardsCount: {
                type: Number,
                default: 0,
            },
            explanationScore: {
                type: Number,
                default: 0,
            },
            finalEvaluationScore: {
                type: Number,
                default: 0,
            },
        },

        // Problem statement (assigned in round 5 auction)
        problemStatement: {
            type: String,
            default: null,
        },

        finalRoundCoins: {
            type: Number,
            default: 0,
        },

        finalScore: {
            type: Number,
            default: 0,
        },

        rank: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

teamSchema.index({ rank: 1, finalScore: -1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ teamName: 1 });

module.exports = mongoose.model("Team", teamSchema);