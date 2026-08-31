const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "TECH BID EVENT API is running",
    });
});

module.exports = app;