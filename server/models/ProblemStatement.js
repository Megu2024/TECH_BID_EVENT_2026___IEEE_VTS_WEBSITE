const mongoose = require("mongoose");

const problemStatementSchema = new mongoose.Schema(
    {
        statementNumber: {
            type: Number,
            required: true,
            unique: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            trim: true,
            default: "Autonomous Systems / EV / Smart Mobility",
        },
        requiredTechCards: [
            {
                type: String,
                trim: true,
            },
        ],
        minBid: {
            type: Number,
            default: 50,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProblemStatement", problemStatementSchema);
