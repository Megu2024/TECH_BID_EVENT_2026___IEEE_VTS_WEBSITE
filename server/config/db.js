const mongoose = require("mongoose");

let isConnecting = false;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return; // Already connected
    }
    if (isConnecting) {
        return;
    }

    try {
        isConnecting = true;
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 8000,
        });

        console.log("MongoDB connected successfully");

        // Synchronize indexes in background without blocking
        setTimeout(async () => {
            try {
                const GameSession = require("../models/GameSession");
                const GameAnswer = require("../models/GameAnswer");
                await GameSession.syncIndexes();
                await GameAnswer.syncIndexes();
                console.log("Database indexes synchronized successfully");
            } catch (indexErr) {
                // Ignore index sync warnings
            }
        }, 1000);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    } finally {
        isConnecting = false;
    }
};

module.exports = connectDB;