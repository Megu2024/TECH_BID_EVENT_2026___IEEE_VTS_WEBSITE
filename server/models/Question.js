const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
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

        questionType: {
            type: String,
            enum: ["mcq", "code", "jumbled"],
            default: "mcq",
        },

        question: {
            type: String,
            required: true,
            trim: true,
        },

        codeSnippet: {
            type: String,
            default: "",
        },

        jumbledWord: {
            type: String,
            default: "",
        },

        hint: {
            type: String,
            default: "",
        },

        options: {
            A: {
                type: String,
                default: "",
            },
            B: {
                type: String,
                default: "",
            },
            C: {
                type: String,
                default: "",
            },
            D: {
                type: String,
                default: "",
            },
        },

        correctAnswer: {
            type: String,
            required: true,
            trim: true,
        },

        techCoins: {
            type: Number,
            default: 20,
        },

        timeLimit: {
            type: Number,
            default: 10,
        },
    },
    {
        timestamps: true,
    }
);

questionSchema.index(
    {
        game: 1,
        round: 1,
        questionNumber: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model("Question", questionSchema);