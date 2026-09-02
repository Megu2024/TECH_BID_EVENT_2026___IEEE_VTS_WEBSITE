require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRoutes = require("./routes/eventRoutes");
const questionRoutes = require("./routes/questionRoutes");
const gameRoutes = require("./routes/gameRoutes");
const catalogRoutes = require("./routes/catalogRoutes");

const app = express();

// Flexible CORS for local development and public production URLs
const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:3000"]
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps, curl, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
                return callback(null, true);
            }
            return callback(null, true); // Permissive in deployment if dynamic subdomains used
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "online",
        event: "IEEE VTS Tech Bid Event 2026",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/catalog", catalogRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const server = app.listen(PORT, () => {
        console.log(`🚀 IEEE VTS Tech Bid 2026 Server running on port ${PORT}`);
    });

    try {
        await connectDB();
    } catch (error) {
        console.error("⚠️ Initial MongoDB Atlas connection failed (likely IP whitelist or network issue).");
        console.error("💡 If your IP changed, add your IP in MongoDB Atlas -> Network Access -> Add Current IP Address (or 0.0.0.0/0).");
        
        // Auto-retry connection in background every 10 seconds
        const retryInterval = setInterval(async () => {
            try {
                if (mongoose.connection.readyState === 1) {
                    clearInterval(retryInterval);
                    return;
                }
                await connectDB();
                clearInterval(retryInterval);
            } catch (err) {
                // Keep retrying quietly
            }
        }, 10000);
    }
};

startServer();