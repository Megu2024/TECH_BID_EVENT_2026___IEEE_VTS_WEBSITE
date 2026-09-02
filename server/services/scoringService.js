const Team = require("../models/Team");
const TechCard = require("../models/TechCard");

/**
 * Calculates the total Tech Coins balance and final score for a team.
 * 
 * Transparent Mathematical Formula:
 * 1. Total Earned Coins = (R1 G1 + R1 G2 + R1 G3) + (R4 G1 + R4 G2) + R5 Final Defense Score
 * 2. Total Auction Spent = (Sum of Tech Cards Purchase Costs) + (R5 Problem Statement Auction Cost)
 * 3. Remaining Tech Coins (Wallet) = Max(0, Total Earned Coins - Total Auction Spent)
 * 4. Tech Cards Portfolio Market Value = Sum of market values of all owned Tech Cards
 * 5. Grand Final Score = Remaining Tech Coins + Tech Cards Portfolio Market Value
 */
const calculateTeamScore = (team) => {
    const r1g1 = Number(team.round1?.game1Score || 0);
    const r1g2 = Number(team.round1?.game2Score || 0);
    const r1g3 = Number(team.round1?.game3Score || 0);
    const round1Total = r1g1 + r1g2 + r1g3;

    const r4g1 = Number(team.round4?.game1Score || 0);
    const r4g2 = Number(team.round4?.game2Score || 0);
    const round4Total = r4g1 + r4g2;

    const round5Eval = Number(team.round5?.finalEvaluationScore || 0);
    const r5AuctionSpent = Number(team.round5?.auctionCoinsSpent || 0);

    // Sum of auction purchase prices paid by the team for Tech Cards
    const cardsBoughtCost = (team.techCards || []).reduce(
        (sum, card) => {
            const bought = Number(card.boughtPrice !== undefined && card.boughtPrice !== null ? card.boughtPrice : (card.basePrice || 0));
            return sum + bought;
        },
        0
    );

    // Sum of current market values of all Tech Cards owned by the team
    const cardsMarketValue = (team.techCards || []).reduce(
        (sum, card) => {
            const market = Number(card.marketValue !== undefined && card.marketValue !== null ? card.marketValue : (card.boughtPrice || card.basePrice || 0));
            return sum + market;
        },
        0
    );

    // Total gross coins earned across all rounds (unattended games default to 0)
    const totalEarnedCoins = round1Total + round4Total + round5Eval;

    // Total coins spent across Round 2 & Round 5 auctions
    const totalAuctionSpent = cardsBoughtCost + r5AuctionSpent;

    // Liquid remaining Tech Coins in team wallet (without card market value added into liquid coins)
    const remainingTechCoins = Math.max(0, totalEarnedCoins - totalAuctionSpent);

    // Grand final total score combining remaining liquid coins and tech card portfolio market value
    const finalScore = remainingTechCoins + cardsMarketValue;

    return {
        round1Total,
        round4Total,
        round5Eval,
        totalEarnedCoins,
        cardsBoughtCost,
        cardsMarketValue,
        techCardsValue: cardsMarketValue,
        r5AuctionSpent,
        totalAuctionSpent,
        remainingTechCoins,
        finalScore,
    };
};

/**
 * Recalculates and updates scores and deterministic rankings for all teams.
 * Synchronizes each team's owned Tech Cards with the latest market values from the catalog.
 */
const recalculateAllTeamRanks = async () => {
    try {
        const [teams, catalogCards] = await Promise.all([
            Team.find(),
            TechCard.find().lean(),
        ]);

        const cardMarketMap = {};
        catalogCards.forEach((c) => {
            if (c.name) {
                cardMarketMap[c.name.trim().toLowerCase()] = Number(c.marketValue !== undefined ? c.marketValue : (c.basePrice || 50));
            }
        });

        for (const team of teams) {
            // Synchronize the marketValue on each owned techCard with the latest global catalog valuation!
            if (team.techCards && team.techCards.length > 0) {
                team.techCards.forEach((card) => {
                    const cKey = card.name?.trim().toLowerCase();
                    if (cKey && cardMarketMap[cKey] !== undefined) {
                        card.marketValue = cardMarketMap[cKey];
                    }
                });
            }

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
