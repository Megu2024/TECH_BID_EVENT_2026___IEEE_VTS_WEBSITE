const mongoose = require("mongoose");
require("dotenv").config();
const Team = require("../models/Team");
const User = require("../models/User");

async function fixTeams() {
    await mongoose.connect(process.env.MONGO_URI, { tls: true });
    
    const teams = await Team.find();
    for (const t of teams) {
        const leader = await User.findById(t.leader);
        const newMembers = [];
        if (leader) {
            newMembers.push({
                name: leader.name,
                email: leader.email,
                isLeader: true,
            });
        }
        t.members = newMembers;
        t.pendingInvites = undefined;
        await t.save();
        console.log("Fixed team schema for:", t.teamName);
    }

    console.log("✅ All teams successfully migrated to direct member schema");
    await mongoose.disconnect();
}

fixTeams().catch(console.error);
