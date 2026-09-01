const mongoose = require("mongoose");

const techCardSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        basePrice: {
            type: Number,
            required: true,
            default: 50,
        },
        marketValue: {
            type: Number,
            required: true,
            default: 50,
        },
        totalCount: {
            type: Number,
            default: 4,
        },
        category: {
            type: String,
            trim: true,
            default: "Hardware / Software",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("TechCard", techCardSchema);
