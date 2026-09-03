const mongoose = require("mongoose");

// Cache the connection promise across warm invocations in serverless
let cachedConnection = null;

const connectDB = async () => {
    // Already connected
    if (mongoose.connection.readyState === 1) {
        return;
    }

    // A connection attempt is already in progress — reuse it
    if (cachedConnection) {
        await cachedConnection;
        return;
    }

    try {
        cachedConnection = mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            // Smaller pool for serverless — each function instance is short-lived
            maxPoolSize: 5,
            minPoolSize: 1,
            // Aggressive timeouts so cold starts don't hang
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 5000,
            // Buffer commands while connecting so the first request doesn't fail
            bufferCommands: true,
        });

        await cachedConnection;
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
        cachedConnection = null;
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;