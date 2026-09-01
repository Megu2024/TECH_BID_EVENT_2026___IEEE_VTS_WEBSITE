const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        registerNumber: {
            type: String,
            trim: true,
            default: "",
        },

        role: {
            type: String,
            enum: ["participant", "admin"],
            default: "participant",
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);