require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const compression = require("compression");
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

app.use(compression());

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

// Simple ping to test function boot without DB
app.get("/api/ping", (req, res) => res.status(200).send("pong"));

// =========================================================
// DB CONNECTION MIDDLEWARE — MUST be BEFORE all API routes
// This ensures MongoDB is connected before any route handler
// runs, which is critical for Vercel serverless cold starts.
// =========================================================
app.use("/api", async (req, res, next) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            await connectDB();
        }
    } catch (err) {
        console.error("DB connection error in middleware:", err.message);
        return res.status(503).json({ message: "Database temporarily unavailable. Please retry." });
    }
    next();
});

// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "online",
        event: "IEEE VTS Tech Bid Event 2026",
        dbState: mongoose.connection.readyState,
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
        console.error("⚠️ Initial MongoDB Atlas connection failed.");
        
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

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    startServer();
}

module.exports = app;