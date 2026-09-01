const Team = require("../models/Team");

/**
 * Calculates the total Tech Coins balance and final score for a team.
 * 
 * Formula:
 * Total Earned Coins = (R1 G1 + R1 G2 + R1 G3) + (R4 G1 + R4 G2) + R5 Final Evaluation
 * Remaining Tech Coins = Total Earned Coins - R5 Auction Coins Spent
 * Tech Cards Total Value = Sum of possessed Tech Cards' market values
 * Final Score = Remaining Tech Coins + Tech Cards Total Value + R5 Final Evaluation Score
 */
const calculateTeamScore = (team) => {
    const r1g1 = Number(team.round1?.game1Score || 0);
    const r1g2 = Number(team.round1?.game2Score || 0);
    const r1g3 = Number(team.round1?.game3Score || 0);
    const round1Total = r1g1 + r1g2 + r1g3;

    const r4g1 = Number(team.round4?.game1Score || 0);
    const r4g2 = Number(team.round4?.game2Score || 0);
    const round4Total = r4g1 + r4g2;

    const finalEval = Number(team.round5?.finalEvaluationScore || 0);
    const auctionSpent = Number(team.round5?.auctionCoinsSpent || 0);

    // Sum of market values of all Tech Cards owned by the team
    const techCardsValue = (team.techCards || []).reduce(
        (sum, card) => sum + Number(card.marketValue || 0),
        0
    );

    // Tech Cards coin impact:
    // Reduced by bought value (purchase cost in auction) and increased by (marketValue - boughtValue)
    const techCardsCoinAdjustment = (team.techCards || []).reduce(
        (sum, card) => {
            const bought = Number(card.boughtPrice !== undefined && card.boughtPrice !== null ? card.boughtPrice : (card.basePrice || 0));
            const market = Number(card.marketValue !== undefined && card.marketValue !== null ? card.marketValue : bought);
            return sum - bought + (market - bought);
        },
        0
    );

    // Total earned tech coins across all competition rounds
    const totalEarnedCoins = round1Total + round4Total + finalEval;
    
    // Remaining tech coins balance (cannot drop below 0)
    const remainingTechCoins = Math.max(0, totalEarnedCoins - auctionSpent + techCardsCoinAdjustment);

    // Final score formula
    const finalScore = remainingTechCoins + techCardsValue + finalEval;

    return {
        round1Total,
        round4Total,
        techCardsValue,
        techCardsCoinAdjustment,
        remainingTechCoins,
        finalScore,
    };
};

/**
 * Recalculates and updates scores and deterministic rankings for all teams.
 */
const recalculateAllTeamRanks = async () => {
    try {
        const teams = await Team.find();

        for (const team of teams) {
            const calculated = calculateTeamScore(team);

            if (!team.round1) team.round1 = {};
            if (!team.round4) team.round4 = {};
            if (!team.round5) team.round5 = {};

            team.round1.totalScore = calculated.round1Total;
            team.round4.totalScore = calculated.round4Total;
            team.techCoins = calculated.remainingTechCoins;
            team.finalScore = calculated.finalScore;

            await team.save();
        }

        // Fetch refreshed teams and sort for deterministic ranking
        const updatedTeams = await Team.find().sort({
            finalScore: -1,
            techCoins: -1,
            "round1.totalScore": -1,
            createdAt: 1,
        });

        // Assign ranks (handle ties deterministically)
        for (let i = 0; i < updatedTeams.length; i++) {
            updatedTeams[i].rank = i + 1;
            await updatedTeams[i].save();
        }

        return updatedTeams;
    } catch (error) {
        console.error("Error in recalculateAllTeamRanks:", error);
        throw error;
    }
};

module.exports = {
    calculateTeamScore,
    recalculateAllTeamRanks,
};
