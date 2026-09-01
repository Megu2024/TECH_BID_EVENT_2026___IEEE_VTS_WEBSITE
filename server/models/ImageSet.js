const mongoose = require("mongoose");

const imageQuestionSchema = new mongoose.Schema({
    questionNumber: {
        type: Number,
        required: true,
    },
    technicalTerm: {
        type: String,
        required: true,
        trim: true,
    },
    images: [
        {
            type: String, // URL or base64 or descriptive path
            required: true,
        },
    ],
    hint: {
        type: String,
        default: "",
    },
});

const imageSetSchema = new mongoose.Schema(
    {
        setNumber: {
            type: Number,
            required: true,
            unique: true, // Set 1, 2, 3
        },
        setName: {
            type: String,
            default: "Image Set",
        },
        questions: [imageQuestionSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ImageSet", imageSetSchema);
