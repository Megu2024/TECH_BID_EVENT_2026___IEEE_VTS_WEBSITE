const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Team = require("../models/Team");
const EventSettings = require("../models/EventSettings");
const { calculateTeamScore, recalculateAllTeamRanks } = require("../services/scoringService");

// ============================================================
// ADMIN LOGIN
// ============================================================
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check Admin collection
        let admin = await Admin.findOne({ email: normalizedEmail });

        if (!admin) {
            // Also check User collection for role === 'admin'
            const userAdmin = await User.findOne({ email: normalizedEmail, role: "admin" });
            if (userAdmin) {
                admin = userAdmin;
            }
        }

        if (!admin) {
            return res.status(401).json({
                message: "Invalid admin credentials",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid admin credentials",
            });
        }

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: "admin",
            },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        return res.status(200).json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: "admin",
            },
        });
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            message: "Server error during admin login",
        });
    }
};

// ============================================================
// GET ADMIN PROFILE
// ============================================================
const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.admin._id || req.admin.id;
        let admin = await Admin.findById(adminId).select("-password");

        if (!admin) {
            admin = await User.findById(adminId).select("-password");
        }

        if (!admin) {
            return res.status(404).json({
                message: "Admin profile not found",
            });
        }

        return res.status(200).json({
            admin,
        });
    } catch (error) {
        console.error("Get admin profile error:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ============================================================
// GET ALL TEAMS (Search & Filterable)
// ============================================================
const getAllTeams = async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};
        if (search && search.trim()) {
            query.teamName = { $regex: search.trim(), $options: "i" };
        }

        const teams = await Team.find(query)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber")
            .sort({ rank: 1, finalScore: -1, createdAt: 1 });

        return res.status(200).json({
            totalTeams: teams.length,
            teams,
        });
    } catch (error) {
        console.error("Get all teams error:", error);
        return res.status(500).json({
            message: "Server error while fetching teams",
        });
    }
};

// ============================================================
// SCORE ROUND 1 GAME 2 (Image / Technical Term Game)
// 1 word = 100, 2 words = 75, 3 words = 50, 4 words = 25, 0 = 0
// ============================================================
const scoreRound1Game2 = async (req, res) => {
    try {
        const { teamId, setNumber, wordsUsed, coinsEarned, term } = req.body;

        if (!teamId) {
            return res.status(400).json({
                message: "Team ID is required",
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        let coins = Number(coinsEarned);
        if (isNaN(coins) || coins === undefined) {
            // Default scoring rules based on words needed
            const words = Number(wordsUsed);
            if (words === 1) coins = 100;
            else if (words === 2) coins = 75;
            else if (words === 3) coins = 50;
            else if (words === 4) coins = 25;
            else coins = 0;
        }

        if (!team.round1) team.round1 = {};
        team.round1.game2Score = coins;
        team.round1.game2Details = {
            setNumber: setNumber ? Number(setNumber) : 1,
            wordsUsed: wordsUsed !== undefined ? Number(wordsUsed) : 0,
            term: term || "",
        };

        const calculated = calculateTeamScore(team);
        team.round1.totalScore = calculated.round1Total;
        team.techCoins = calculated.remainingTechCoins;
        team.finalScore = calculated.finalScore;

        await team.save();
        await recalculateAllTeamRanks();

        const updatedTeam = await Team.findById(teamId)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber");

        return res.status(200).json({
            message: "Round 1 Game 2 score recorded successfully",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Score Round 1 Game 2 error:", error);
        return res.status(500).json({
            message: "Server error while scoring Game 2",
        });
    }
};

// ============================================================
// ASSIGN TECH CARDS (Round 2)
// ============================================================
const assignTechCards = async (req, res) => {
    try {
        const { teamId, techCards } = req.body;

        if (!teamId || !Array.isArray(techCards)) {
            return res.status(400).json({
                message: "Team ID and techCards array are required",
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        team.techCards = techCards.map((card) => ({
            name: card.name,
            basePrice: Number(card.basePrice || 0),
            marketValue: Number(card.marketValue || 0),
            category: card.category || "Hardware / Software",
        }));

        const calculated = calculateTeamScore(team);
        team.finalScore = calculated.finalScore;

        await team.save();
        await recalculateAllTeamRanks();

        const updatedTeam = await Team.findById(teamId)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber");

        return res.status(200).json({
            message: "Tech Cards assigned successfully",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Assign tech cards error:", error);
        return res.status(500).json({
            message: "Server error while assigning tech cards",
        });
    }
};

// ============================================================
// SCORE ROUND 4 GAME 2 (Resistance Challenge)
// ============================================================
const scoreRound4Game2 = async (req, res) => {
    try {
        const { teamId, q1Score, q2Score, q3Score, q4Score, totalScore } = req.body;

        if (!teamId) {
            return res.status(400).json({
                message: "Team ID is required",
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        const q1 = Number(q1Score || 0);
        const q2 = Number(q2Score || 0);
        const q3 = Number(q3Score || 0);
        const q4 = Number(q4Score || 0);
        const total = totalScore !== undefined ? Number(totalScore) : (q1 + q2 + q3 + q4);

        if (!team.round4) team.round4 = {};
        team.round4.game2Score = total;
        team.round4.game2Details = {
            q1Score: q1,
            q2Score: q2,
            q3Score: q3,
            q4Score: q4,
        };

        const calculated = calculateTeamScore(team);
        team.round4.totalScore = calculated.round4Total;
        team.techCoins = calculated.remainingTechCoins;
        team.finalScore = calculated.finalScore;

        await team.save();
        await recalculateAllTeamRanks();

        const updatedTeam = await Team.findById(teamId)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber");

        return res.status(200).json({
            message: "Round 4 Game 2 Resistor score recorded successfully",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Score Round 4 Game 2 error:", error);
        return res.status(500).json({
            message: "Server error while scoring resistance challenge",
        });
    }
};

// ============================================================
// ASSIGN ROUND 5 AUCTION PROBLEM STATEMENT
// ============================================================
const assignProblemStatementAuction = async (req, res) => {
    try {
        const { teamId, problemStatement, auctionCoinsSpent } = req.body;

        if (!teamId || !problemStatement) {
            return res.status(400).json({
                message: "Team ID and problem statement are required",
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        const spent = Number(auctionCoinsSpent || 0);

        if (!team.round5) team.round5 = {};
        team.round5.problemStatement = problemStatement;
        team.round5.auctionCoinsSpent = spent;
        team.problemStatement = problemStatement;

        const calculated = calculateTeamScore(team);
        team.techCoins = calculated.remainingTechCoins;
        team.finalScore = calculated.finalScore;

        await team.save();
        await recalculateAllTeamRanks();

        const updatedTeam = await Team.findById(teamId)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber");

        return res.status(200).json({
            message: "Problem statement assigned to team successfully",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Assign problem statement error:", error);
        return res.status(500).json({
            message: "Server error while assigning problem statement",
        });
    }
};

// ============================================================
// SCORE ROUND 5 FINAL PHYSICAL EVALUATION
// 3/3 cards match = 100, 2/3 = 50, 1/3 = 25, 0 = 0
// ============================================================
const scoreRound5FinalEvaluation = async (req, res) => {
    try {
        const { teamId, matchedCardsCount, finalEvaluationScore } = req.body;

        if (!teamId) {
            return res.status(400).json({
                message: "Team ID is required",
            });
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        let score = Number(finalEvaluationScore);
        const matched = Number(matchedCardsCount || 0);

        if (isNaN(score) || finalEvaluationScore === undefined) {
            if (matched >= 3) score = 100;
            else if (matched === 2) score = 50;
            else if (matched === 1) score = 25;
            else score = 0;
        }

        if (!team.round5) team.round5 = {};
        team.round5.matchedCardsCount = matched;
        team.round5.finalEvaluationScore = score;
        team.finalRoundCoins = score;

        const calculated = calculateTeamScore(team);
        team.techCoins = calculated.remainingTechCoins;
        team.finalScore = calculated.finalScore;

        await team.save();
        await recalculateAllTeamRanks();

        const updatedTeam = await Team.findById(teamId)
            .populate("leader", "name email registerNumber")
            .populate("members", "name email registerNumber");

        return res.status(200).json({
            message: "Final Evaluation score recorded successfully",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Score final evaluation error:", error);
        return res.status(500).json({
            message: "Server error while scoring final evaluation",
        });
    }
};

// ============================================================
// RECALCULATE RANKS & SCORES
// ============================================================
const triggerRecalculateRanks = async (req, res) => {
    try {
        const updatedTeams = await recalculateAllTeamRanks();

        return res.status(200).json({
            message: "All team scores and ranks recalculated successfully",
            teams: updatedTeams,
        });
    } catch (error) {
        console.error("Recalculate ranks error:", error);
        return res.status(500).json({
            message: "Server error while recalculating ranks",
        });
    }
};

// ============================================================
// TOGGLE LEADERBOARD / RANKING VISIBILITY
// ============================================================
const toggleLeaderboardVisibility = async (req, res) => {
    try {
        const { leaderboardVisible } = req.body;

        let settings = await EventSettings.findOne();
        if (!settings) {
            settings = new EventSettings();
        }

        if (leaderboardVisible !== undefined) {
            settings.leaderboardVisible = Boolean(leaderboardVisible);
        } else {
            settings.leaderboardVisible = !settings.leaderboardVisible;
        }

        await settings.save();

        return res.status(200).json({
            message: `Ranking visibility updated to ${settings.leaderboardVisible ? "Visible" : "Hidden"}`,
            leaderboardVisible: settings.leaderboardVisible,
        });
    } catch (error) {
        console.error("Toggle leaderboard error:", error);
        return res.status(500).json({
            message: "Server error while updating ranking visibility",
        });
    }
};

module.exports = {
    adminLogin,
    getAdminProfile,
    getAllTeams,
    scoreRound1Game2,
    assignTechCards,
    scoreRound4Game2,
    assignProblemStatementAuction,
    scoreRound5FinalEvaluation,
    triggerRecalculateRanks,
    toggleLeaderboardVisibility,
};