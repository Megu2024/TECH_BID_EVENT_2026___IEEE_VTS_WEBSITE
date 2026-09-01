const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            maxPoolSize: 10,
        });

        console.log("MongoDB connected successfully");

        // Synchronize indexes to drop obsolete unique constraints in MongoDB Atlas
        try {
            const GameSession = require("../models/GameSession");
            const GameAnswer = require("../models/GameAnswer");
            await GameSession.syncIndexes();
            await GameAnswer.syncIndexes();
            console.log("Database indexes synchronized successfully");
        } catch (indexErr) {
            console.warn("Index sync warning:", indexErr.message);
        }
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;