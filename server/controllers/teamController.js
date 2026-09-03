const Team = require("../models/Team");
const User = require("../models/User");
const EventSettings = require("../models/EventSettings");

// -------------------------------------------------------------
// GET MY TEAM DETAILS
// -------------------------------------------------------------
const getMyTeam = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);

        if (!currentUser || !currentUser.team) {
            return res.status(200).json({
                team: null,
                message: "You are not part of any team yet",
                leaderboardVisible: false,
                quizAnswersVisible: false,
            });
        }

        const team = await Team.findById(currentUser.team).populate("leader", "name email role");

        if (!team) {
            currentUser.team = null;
            await currentUser.save();
            return res.status(200).json({
                team: null,
                message: "No team registered yet",
                leaderboardVisible: false,
                quizAnswersVisible: false,
            });
        }

        const settings = await EventSettings.findOne();
        const leaderboardVisible = settings ? settings.leaderboardVisible : false;
        const quizAnswersVisible = settings ? settings.quizAnswersVisible : false;

        const teamObj = team.toObject();
        if (!leaderboardVisible) {
            teamObj.rank = null;
        }

        return res.status(200).json({
            team: teamObj,
            leaderboardVisible,
            quizAnswersVisible,
        });
    } catch (error) {
        console.error("Get team error:", error);
        return res.status(500).json({
            message: "Server error while fetching team details",
        });
    }
};

// -------------------------------------------------------------
// CREATE TEAM WITH MEMBERS (INSTANT - NO INVITE LINKS / EMAILS)
// -------------------------------------------------------------
const createTeam = async (req, res) => {
    try {
        const { teamName, members } = req.body;

        if (!teamName || !teamName.trim()) {
            return res.status(400).json({
                message: "Team name is required",
            });
        }

        const currentUser = await User.findById(req.user._id);

        if (currentUser.team) {
            const teamExists = await Team.findById(currentUser.team);
            if (teamExists) {
                return res.status(400).json({
                    message: "You are already registered in a team",
                });
            } else {
                currentUser.team = null;
                await currentUser.save();
            }
        }

        const existingTeam = await Team.findOne({
            teamName: teamName.trim(),
        });

        if (existingTeam) {
            return res.status(409).json({
                message: `A team named "${teamName.trim()}" already exists`,
            });
        }

        // Prepare full members roster: Leader + Teammates
        const fullRoster = [
            {
                name: currentUser.name,
                email: currentUser.email.toLowerCase().trim(),
                isLeader: true,
            },
        ];

        const emailsToCheck = [currentUser.email.toLowerCase().trim()];

        if (Array.isArray(members)) {
            for (const m of members.slice(0, 3)) {
                if (m && m.name && m.email && m.email.trim()) {
                    const normalizedEmail = m.email.toLowerCase().trim();

                    if (emailsToCheck.includes(normalizedEmail)) {
                        return res.status(400).json({
                            message: `Duplicate email "${normalizedEmail}" entered in team roster`,
                        });
                    }

                    emailsToCheck.push(normalizedEmail);
                    fullRoster.push({
                        name: m.name.trim(),
                        email: normalizedEmail,
                        isLeader: false,
                    });
                }
            }
        }

        // Verify that none of the teammate emails already belong to another team
        const conflictTeam = await Team.findOne({
            "members.email": { $in: emailsToCheck },
        });

        if (conflictTeam) {
            return res.status(400).json({
                message: `One of the entered emails is already registered under team "${conflictTeam.teamName}"`,
            });
        }

        const team = await Team.create({
            teamName: teamName.trim(),
            leader: currentUser._id,
            members: fullRoster,
            techCoins: 0,
            round1: { game1Score: 0, game2Score: 0, game3Score: 0, totalScore: 0 },
            round4: { game1Score: 0, game2Score: 0, totalScore: 0 },
            round5: { auctionCoinsSpent: 0, finalEvaluationScore: 0 },
            finalScore: 0,
        });

        currentUser.team = team._id;
        await currentUser.save();

        const populatedTeam = await Team.findById(team._id).populate("leader", "name email role");

        return res.status(201).json({
            message: `Team "${teamName}" created successfully!`,
            team: populatedTeam,
        });
    } catch (error) {
        console.error("Team creation error:", error);
        return res.status(500).json({
            message: error.message || "Server error while creating team",
        });
    }
};

// -------------------------------------------------------------
// ADD MEMBER DIRECTLY TO TEAM (NO CONFIRMATION REQUIRED)
// -------------------------------------------------------------
const addMember = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !name.trim() || !email || !email.trim()) {
            return res.status(400).json({
                message: "Teammate name and email are both required",
            });
        }

        const currentUser = await User.findById(req.user._id);
        if (!currentUser || !currentUser.team) {
            return res.status(400).json({
                message: "Please create a team first",
            });
        }

        const team = await Team.findById(currentUser.team);
        if (!team) {
            currentUser.team = null;
            await currentUser.save();
            return res.status(400).json({ message: "Team record not found" });
        }

        if (team.leader.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ message: "Only the team leader can add members" });
        }

        if (team.members.length >= 4) {
            return res.status(400).json({ message: "Team capacity reached (maximum 4 members)" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already in another team
        const conflictTeam = await Team.findOne({
            "members.email": normalizedEmail,
        });

        if (conflictTeam) {
            return res.status(400).json({
                message: `Email "${normalizedEmail}" is already part of team "${conflictTeam.teamName}"`,
            });
        }

        team.members.push({
            name: name.trim(),
            email: normalizedEmail,
            isLeader: false,
        });

        await team.save();

        const updatedTeam = await Team.findById(team._id).populate("leader", "name email role");

        return res.status(200).json({
            message: `Teammate ${name.trim()} added to roster!`,
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Add member error:", error);
        return res.status(500).json({ message: error.message || "Failed to add team member" });
    }
};

// -------------------------------------------------------------
// REMOVE MEMBER FROM TEAM
// -------------------------------------------------------------
const removeMember = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser || !currentUser.team) {
            return res.status(400).json({ message: "You are not part of a team" });
        }

        const team = await Team.findById(currentUser.team);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        if (team.leader.toString() !== currentUser._id.toString()) {
            return res.status(403).json({ message: "Only the team leader can remove members" });
        }

        const memberIndexOrId = req.params.memberId;

        // Prevent removing the leader
        team.members = team.members.filter((m, idx) => {
            if (m.isLeader) return true;
            return m._id?.toString() !== memberIndexOrId && idx.toString() !== memberIndexOrId;
        });

        await team.save();

        const updatedTeam = await Team.findById(team._id).populate("leader", "name email role");

        return res.status(200).json({
            message: "Member removed from team roster",
            team: updatedTeam,
        });
    } catch (error) {
        console.error("Remove member error:", error);
        return res.status(500).json({ message: "Server error while removing team member" });
    }
};

module.exports = {
    getMyTeam,
    createTeam,
    addMember,
    removeMember,
};