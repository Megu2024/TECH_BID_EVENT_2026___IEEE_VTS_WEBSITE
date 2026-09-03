const EventSettings = require("../models/EventSettings");
const Team = require("../models/Team");

const getEventSettings = async (req, res) => {
    try {
        let settings = await EventSettings.findOne();

        if (!settings) {
            settings = await EventSettings.create({});
        }

        res.status(200).json({
            settings,
        });
    } catch (error) {
        console.error("Get event settings error:", error);
        res.status(500).json({
            message: "Server error while fetching event settings",
        });
    }
};

const updateEventSettings = async (req, res) => {
    try {
        const {
            currentRound,
            currentGame,
            r1g1Enabled,
            r1g1Pin,
            r1g3Enabled,
            r1g3Pin,
            r4g1Enabled,
            r4g1Pin,
            quizEnabled,
            quizPin,
            leaderboardVisible,
            quizAnswersVisible,
        } = req.body;

        let settings = await EventSettings.findOne();

        if (!settings) {
            settings = new EventSettings();
        }

        const prevR1G1Enabled = settings.r1g1Enabled;
        const prevR1G1Pin = settings.r1g1Pin;
        const prevR1G3Enabled = settings.r1g3Enabled;
        const prevR1G3Pin = settings.r1g3Pin;
        const prevR4G1Enabled = settings.r4g1Enabled;
        const prevR4G1Pin = settings.r4g1Pin;

        if (currentRound !== undefined) settings.currentRound = Number(currentRound);
        if (currentGame !== undefined) settings.currentGame = Number(currentGame);

        if (r1g1Enabled !== undefined) {
            settings.r1g1Enabled = Boolean(r1g1Enabled);
            settings.quizEnabled = Boolean(r1g1Enabled);
        } else if (quizEnabled !== undefined) {
            settings.r1g1Enabled = Boolean(quizEnabled);
            settings.quizEnabled = Boolean(quizEnabled);
        }

        if (r1g1Pin !== undefined) {
            settings.r1g1Pin = String(r1g1Pin).trim();
            settings.quizPin = String(r1g1Pin).trim();
        } else if (quizPin !== undefined) {
            settings.r1g1Pin = String(quizPin).trim();
            settings.quizPin = String(quizPin).trim();
        }

        // If R1G1 is newly enabled OR pin changed while enabled, increment r1g1Version
        if ((!prevR1G1Enabled && settings.r1g1Enabled) || (settings.r1g1Enabled && prevR1G1Pin !== settings.r1g1Pin)) {
            settings.r1g1Version = (settings.r1g1Version || 1) + 1;
        }

        if (r1g3Enabled !== undefined) settings.r1g3Enabled = Boolean(r1g3Enabled);
        if (r1g3Pin !== undefined) settings.r1g3Pin = String(r1g3Pin).trim();

        if ((!prevR1G3Enabled && settings.r1g3Enabled) || (settings.r1g3Enabled && prevR1G3Pin !== settings.r1g3Pin)) {
            settings.r1g3Version = (settings.r1g3Version || 1) + 1;
        }

        if (r4g1Enabled !== undefined) settings.r4g1Enabled = Boolean(r4g1Enabled);
        if (r4g1Pin !== undefined) settings.r4g1Pin = String(r4g1Pin).trim();

        if ((!prevR4G1Enabled && settings.r4g1Enabled) || (settings.r4g1Enabled && prevR4G1Pin !== settings.r4g1Pin)) {
            settings.r4g1Version = (settings.r4g1Version || 1) + 1;
        }

        if (leaderboardVisible !== undefined) settings.leaderboardVisible = Boolean(leaderboardVisible);
        if (quizAnswersVisible !== undefined) settings.quizAnswersVisible = Boolean(quizAnswersVisible);

        await settings.save();

        res.status(200).json({
            message: "Event settings updated successfully",
            settings,
        });
    } catch (error) {
        console.error("Update event settings error:", error);
        res.status(500).json({
            message: "Server error while updating event settings",
        });
    }
};

const getParticipantEventStatus = async (req, res) => {
    try {
        let settings = await EventSettings.findOne();

        if (!settings) {
            settings = await EventSettings.create({});
        }

        res.status(200).json({
            currentRound: settings.currentRound,
            currentGame: settings.currentGame,
            r1g1Enabled: settings.r1g1Enabled ?? settings.quizEnabled,
            r1g1Version: settings.r1g1Version || 1,
            r1g3Enabled: settings.r1g3Enabled,
            r1g3Version: settings.r1g3Version || 1,
            r4g1Enabled: settings.r4g1Enabled,
            r4g1Version: settings.r4g1Version || 1,
            leaderboardVisible: settings.leaderboardVisible,
            quizAnswersVisible: settings.quizAnswersVisible,
        });
    } catch (error) {
        console.error("Get participant event status error:", error);
        res.status(500).json({
            message: "Server error while fetching event status",
        });
    }
};

const { recalculateAllTeamRanks } = require("../services/scoringService");

const getPublicLeaderboard = async (req, res) => {
    try {
        let settings = await EventSettings.findOne();
        if (!settings) {
            settings = await EventSettings.create({});
        }

        if (!settings.leaderboardVisible) {
            return res.status(403).json({
                visible: false,
                message: "Rankings are not enabled by Admin at this time",
            });
        }

        const teams = await Team.find()
            .select("teamName techCoins round1 round4 round5 techCards finalScore rank")
            .populate("leader", "name")
            .sort({ finalScore: -1, techCoins: -1, "round1.totalScore": -1, createdAt: 1 })
            .lean();

        return res.status(200).json({
            visible: true,
            leaderboard: teams,
        });
    } catch (error) {
        console.error("Get leaderboard error:", error);
        return res.status(500).json({
            message: "Server error while fetching leaderboard",
        });
    }
};

module.exports = {
    getEventSettings,
    updateEventSettings,
    getParticipantEventStatus,
    getPublicLeaderboard,
};