const GameSession = require("../models/GameSession");
const Question = require("../models/Question");
const GameAnswer = require("../models/GameAnswer");
const User = require("../models/User");
const Team = require("../models/Team");
const EventSettings = require("../models/EventSettings");
const { calculateTeamScore, recalculateAllTeamRanks } = require("../services/scoringService");

// Helper to check if a specific game is enabled and verify pin
const checkGameStatusAndPin = async (game, round, pin) => {
    let settings = await EventSettings.findOne();
    if (!settings) {
        settings = await EventSettings.create({});
    }

    let isEnabled = false;
    let expectedPin = "";
    let version = 1;

    if (round === 1 && game === 1) {
        isEnabled = settings.r1g1Enabled ?? settings.quizEnabled ?? false;
        expectedPin = settings.r1g1Pin || settings.quizPin || "1234";
        version = settings.r1g1Version || 1;
    } else if (round === 1 && game === 3) {
        isEnabled = settings.r1g3Enabled ?? false;
        expectedPin = settings.r1g3Pin || "5678";
        version = settings.r1g3Version || 1;
    } else if (round === 4 && game === 1) {
        isEnabled = settings.r4g1Enabled ?? false;
        expectedPin = settings.r4g1Pin || "9012";
        version = settings.r4g1Version || 1;
    } else {
        isEnabled = false;
        expectedPin = "";
        version = 1;
    }

    const pinMatches = pin && pin.toString().trim() === expectedPin.toString().trim();

    return {
        isEnabled,
        pinMatches,
        expectedPin,
        version,
    };
};

// ============================================================
// VERIFY PIN
// ============================================================
const verifyGamePin = async (req, res) => {
    try {
        const { game, round, pin } = req.body;

        if (!game || !round || !pin) {
            return res.status(400).json({
                message: "Game, round, and PIN code are required",
            });
        }

        const { isEnabled, pinMatches } = await checkGameStatusAndPin(
            Number(game),
            Number(round),
            pin
        );

        if (!isEnabled) {
            return res.status(403).json({
                valid: false,
                message: `Round ${round} Game ${game} is currently disabled by Admin`,
            });
        }

        if (!pinMatches) {
            return res.status(400).json({
                valid: false,
                message: "Invalid PIN code for this game",
            });
        }

        return res.status(200).json({
            valid: true,
            message: "PIN verified successfully",
        });
    } catch (error) {
        console.error("Verify PIN error:", error);
        return res.status(500).json({
            message: "Server error while verifying PIN",
        });
    }
};

// ============================================================
// START GAME
// ============================================================
const startGame = async (req, res) => {
    try {
        const { game, round, pin } = req.body;

        if (!game || !round) {
            return res.status(400).json({
                message: "Game and round are required",
            });
        }

        const currentUser = await User.findById(req.user._id);

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!currentUser.team) {
            return res.status(400).json({
                message: "You must be part of a team to play",
            });
        }

        const teamId = currentUser.team;

        // Check game active status and PIN
        const { isEnabled, pinMatches, version } = await checkGameStatusAndPin(
            Number(game),
            Number(round),
            pin
        );

        if (!isEnabled) {
            return res.status(403).json({
                message: `This game is not currently active. Please wait for the Admin to enable it.`,
            });
        }

        if (pin && !pinMatches) {
            return res.status(400).json({
                message: "Invalid game PIN",
            });
        }

        // Count total questions for this game and round
        const totalQuestions = await Question.countDocuments({
            game: Number(game),
            round: Number(round),
        });

        if (!totalQuestions) {
            return res.status(404).json({
                message: "No questions configured for this game round yet",
            });
        }

        const firstQuestion = await Question.findOne({
            game: Number(game),
            round: Number(round),
            questionNumber: 1,
        });
        const initialDuration = Number(firstQuestion?.timeLimit) || 10;

        const now = new Date();

        // Find existing session for THIS TEAM for (game, round)
        let session = await GameSession.findOne({
            game: Number(game),
            round: Number(round),
            team: teamId,
        });

        if (session) {
            // If already completed for current active version, return completed status
            if (session.version === version && session.status === "completed") {
                return res.status(200).json({
                    message: "Quiz session already completed",
                    game: session.game,
                    round: session.round,
                    team: session.team,
                    startedAt: session.startedAt,
                    currentQuestionNumber: session.currentQuestionNumber,
                    totalQuestions: session.totalQuestions,
                    status: "completed",
                });
            }

            // Otherwise, reset or resume for active version
            const isResumingSameVersion = session.version === version && session.status === "running";

            session.version = version;
            session.totalQuestions = totalQuestions;
            session.currentQuestionNumber = isResumingSameVersion ? session.currentQuestionNumber : 1;
            session.questionDuration = isResumingSameVersion ? (session.questionDuration || initialDuration) : initialDuration;
            session.startedAt = isResumingSameVersion ? session.startedAt : now;
            session.questionStartedAt = isResumingSameVersion ? session.questionStartedAt : null;
            session.status = "running";
            await session.save();

            // Reset game score in team model for new version attempt
            if (!isResumingSameVersion) {
                const team = await Team.findById(teamId);
                if (team) {
                    if (!team.round1) team.round1 = {};
                    if (!team.round4) team.round4 = {};

                    if (Number(round) === 1 && Number(game) === 1) {
                        team.round1.game1Score = 0;
                    } else if (Number(round) === 1 && Number(game) === 3) {
                        team.round1.game3Score = 0;
                    } else if (Number(round) === 4 && Number(game) === 1) {
                        team.round4.game1Score = 0;
                    }

                    const calculated = calculateTeamScore(team);
                    team.round1.totalScore = calculated.round1Total;
                    team.round4.totalScore = calculated.round4Total;
                    team.techCoins = calculated.remainingTechCoins;
                    team.finalScore = calculated.finalScore;
                    await team.save();
                    await recalculateAllTeamRanks();
                }
            }
        } else {
            try {
                session = await GameSession.create({
                    game: Number(game),
                    round: Number(round),
                    team: teamId,
                    totalQuestions,
                    currentQuestionNumber: 1,
                    questionDuration: 10,
                    startedAt: now,
                    questionStartedAt: null,
                    status: "running",
                    version,
                });
            } catch (createErr) {
                if (createErr.code === 11000) {
                    session = await GameSession.findOne({
                        game: Number(game),
                        round: Number(round),
                        team: teamId,
                    });
                } else {
                    throw createErr;
                }
            }

            const team = await Team.findById(teamId);
            if (team) {
                if (!team.round1) team.round1 = {};
                if (!team.round4) team.round4 = {};

                if (Number(round) === 1 && Number(game) === 1) {
                    team.round1.game1Score = 0;
                } else if (Number(round) === 1 && Number(game) === 3) {
                    team.round1.game3Score = 0;
                } else if (Number(round) === 4 && Number(game) === 1) {
                    team.round4.game1Score = 0;
                }

                const calculated = calculateTeamScore(team);
                team.round1.totalScore = calculated.round1Total;
                team.round4.totalScore = calculated.round4Total;
                team.techCoins = calculated.remainingTechCoins;
                team.finalScore = calculated.finalScore;
                await team.save();
                await recalculateAllTeamRanks();
            }
        }

        return res.status(200).json({
            message: "Game session started",
            game: session.game,
            round: session.round,
            team: session.team,
            startedAt: session.startedAt,
            questionStartedAt: session.questionStartedAt,
            currentQuestionNumber: session.currentQuestionNumber,
            totalQuestions: session.totalQuestions,
            questionDuration: session.questionDuration,
            status: session.status,
        });
    } catch (error) {
        console.error("Start game error:", error);
        return res.status(500).json({
            message: "Server error while starting game",
        });
    }
};

// ============================================================
// GET CURRENT QUESTION
// ============================================================
const getCurrentQuestion = async (req, res) => {
    try {
        const game = Number(req.query.game);
        const round = Number(req.query.round);

        if (!game || !round) {
            return res.status(400).json({
                message: "Game and round are required",
            });
        }

        const currentUser = await User.findById(req.user._id);

        if (!currentUser || !currentUser.team) {
            return res.status(400).json({
                message: "You are not part of a team",
            });
        }

        const { version } = await checkGameStatusAndPin(game, round);

        const session = await GameSession.findOne({
            game,
            round,
            team: currentUser.team,
            version,
        });

        if (!session) {
            return res.status(404).json({
                message: "Game session not found for your team",
            });
        }

        if (session.status === "waiting") {
            return res.status(200).json({
                status: "waiting",
                message: "Game has not started yet",
            });
        }

        if (session.status === "completed") {
            return res.status(200).json({
                status: "completed",
                message: "Game round completed",
            });
        }

        // Check if question number exceeds total questions
        if (session.currentQuestionNumber > session.totalQuestions) {
            session.status = "completed";
            await session.save();
            return res.status(200).json({
                status: "completed",
                message: "Game round completed",
            });
        }

        // Fetch question without sending the correct answer to frontend!
        const question = await Question.findOne({
            game,
            round,
            questionNumber: session.currentQuestionNumber,
        }).select("-correctAnswer");

        if (!question) {
            // If question not found, mark completed or fallback
            session.status = "completed";
            await session.save();
            return res.status(200).json({
                status: "completed",
                message: "Game round completed",
            });
        }

        // Use question's custom time limit or fallback to session/10s
        const duration = Number(question.timeLimit) || Number(session.questionDuration) || 10;
        if (session.questionDuration !== duration) {
            session.questionDuration = duration;
            await session.save();
        }

        // Calculate elapsed time for this team's current question
        let remainingSeconds = duration;
        
        if (session.questionStartedAt) {
            const questionStartTime = session.questionStartedAt;
            const elapsedSeconds = (Date.now() - new Date(questionStartTime).getTime()) / 1000;
            remainingSeconds = Math.max(0, Math.ceil(duration - elapsedSeconds));

            // Auto-advance if time has expired
            if (remainingSeconds <= 0) {
                if (session.currentQuestionNumber >= session.totalQuestions) {
                    session.currentQuestionNumber = session.totalQuestions + 1;
                    session.status = "completed";
                    await session.save();

                    return res.status(200).json({
                        status: "completed",
                        message: "Game round completed",
                    });
                }

                session.currentQuestionNumber += 1;
                session.questionStartedAt = null;
                await session.save();

                // Re-run for the new question
                return getCurrentQuestion(req, res);
            }
        }

        return res.status(200).json({
            status: "running",
            question,
            currentQuestionNumber: session.currentQuestionNumber,
            totalQuestions: session.totalQuestions,
            remainingSeconds,
            questionDuration: duration,
        });
    } catch (error) {
        console.error("Get current question error:", error);
        return res.status(500).json({
            message: "Server error while fetching current question",
        });
    }
};

// ============================================================
// START QUESTION TIMER
// ============================================================
const startQuestionTimer = async (req, res) => {
    try {
        const { game, round } = req.body;
        const currentUser = await User.findById(req.user._id);

        if (!currentUser || !currentUser.team) {
            return res.status(400).json({ message: "You are not part of a team" });
        }

        const { version } = await checkGameStatusAndPin(game, round);
        const session = await GameSession.findOne({
            game,
            round,
            team: currentUser.team,
            version,
        });

        if (!session || session.status !== "running") {
            return res.status(400).json({ message: "Game session not running" });
        }

        // Only set it if it hasn't been set yet for this question
        if (!session.questionStartedAt) {
            session.questionStartedAt = new Date();
            await session.save();
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Start question timer error:", error);
        return res.status(500).json({ message: "Server error while starting timer" });
    }
};

// ============================================================
// SUBMIT ANSWER
// ============================================================
const submitAnswer = async (req, res) => {
    try {
        const { game, round, questionNumber, selectedAnswer } = req.body;

        if (!game || !round || !questionNumber || selectedAnswer === undefined) {
            return res.status(400).json({
                message: "Missing answer data",
            });
        }

        const currentUser = await User.findById(req.user._id);

        if (!currentUser || !currentUser.team) {
            return res.status(400).json({
                message: "You are not part of a team",
            });
        }

        const teamId = currentUser.team;

        const { version } = await checkGameStatusAndPin(Number(game), Number(round));

        const session = await GameSession.findOne({
            game: Number(game),
            round: Number(round),
            team: teamId,
            version,
        });

        if (!session || session.status !== "running") {
            return res.status(400).json({
                message: "Game session is not active",
            });
        }

        // Enforce answering only the current active question
        if (Number(questionNumber) !== session.currentQuestionNumber) {
            return res.status(400).json({
                message: "This question is no longer active",
            });
        }

        const question = await Question.findOne({
            game: Number(game),
            round: Number(round),
            questionNumber: Number(questionNumber),
        });

        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            });
        }

        // Verify Server Timer using question's specific time limit
        const duration = Number(question.timeLimit) || Number(session.questionDuration) || 10;
        const questionStartTime =
            session.questionStartedAt || session.startedAt || new Date();
        const elapsedSeconds =
            (Date.now() - new Date(questionStartTime).getTime()) / 1000;

        if (elapsedSeconds > duration + 2.0) {
            return res.status(400).json({
                message: "Time limit expired for this question",
            });
        }

        // Validate answer (case-insensitive trimming & text matching)
        const normalizedSelected = String(selectedAnswer).trim().toUpperCase();
        const normalizedCorrect = String(question.correctAnswer).trim().toUpperCase();

        let isCorrect = normalizedSelected === normalizedCorrect;

        // If not directly matching, check if option text matches
        if (!isCorrect && question.options) {
            const correctOptionText = question.options[normalizedCorrect]
                ? String(question.options[normalizedCorrect]).trim().toUpperCase()
                : "";
            if (correctOptionText && normalizedSelected === correctOptionText) {
                isCorrect = true;
            }
        }

        const techCoins = isCorrect ? (question.techCoins || 20) : 0;

        // Save answer record with version scope
        try {
            await GameAnswer.create({
                game: Number(game),
                round: Number(round),
                questionNumber: Number(questionNumber),
                team: teamId,
                user: currentUser._id,
                selectedAnswer: String(selectedAnswer),
                isCorrect,
                techCoins,
                version,
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    message: "Your team has already answered this question",
                });
            }
            throw error;
        }

        // Calculate total coins earned for the ACTIVE VERSION session
        const activeAnswers = await GameAnswer.find({
            game: Number(game),
            round: Number(round),
            team: teamId,
            version,
        });

        const activeVersionScore = activeAnswers.reduce(
            (sum, a) => sum + (a.techCoins || 0),
            0
        );

        // Update team score in Team model with active version score (latest attempt score)
        const team = await Team.findById(teamId);
        if (team) {
            if (!team.round1) team.round1 = {};
            if (!team.round4) team.round4 = {};

            if (Number(round) === 1 && Number(game) === 1) {
                team.round1.game1Score = activeVersionScore;
            } else if (Number(round) === 1 && Number(game) === 3) {
                team.round1.game3Score = activeVersionScore;
            } else if (Number(round) === 4 && Number(game) === 1) {
                team.round4.game1Score = activeVersionScore;
            }

            const calculated = calculateTeamScore(team);
            team.round1.totalScore = calculated.round1Total;
            team.round4.totalScore = calculated.round4Total;
            team.techCoins = calculated.remainingTechCoins;
            team.finalScore = calculated.finalScore;
            await team.save();
            // Run rank recalculation in the background to prevent UI blocking
            recalculateAllTeamRanks().catch(err => console.error("Rank recalc error:", err));
        }

        // Advance to next question immediately
        if (session.currentQuestionNumber >= session.totalQuestions) {
            session.currentQuestionNumber = session.totalQuestions + 1;
            session.status = "completed";
            await session.save();

            return res.status(201).json({
                message: "Answer submitted successfully",
                isCorrect,
                techCoins,
                roundCompleted: true,
                nextQuestionNumber: null,
            });
        }

        session.currentQuestionNumber += 1;
        session.questionStartedAt = null;
        await session.save();

        return res.status(201).json({
            message: "Answer submitted successfully",
            isCorrect,
            techCoins,
            roundCompleted: false,
            nextQuestionNumber: session.currentQuestionNumber,
        });
    } catch (error) {
        console.error("Submit answer error:", error);
        return res.status(500).json({
            message: "Server error while submitting answer",
        });
    }
};

// ============================================================
// GET TEAM SCORE FOR GAME
// ============================================================
const getTeamScore = async (req, res) => {
    try {
        const game = Number(req.query.game);
        const round = Number(req.query.round);

        const currentUser = await User.findById(req.user._id);

        if (!currentUser || !currentUser.team) {
            return res.status(400).json({
                message: "You are not part of a team",
            });
        }

        const { version } = await checkGameStatusAndPin(game, round);

        const answers = await GameAnswer.find({
            game,
            round,
            team: currentUser.team,
            version,
        });

        const totalTechCoins = answers.reduce((sum, ans) => sum + (ans.techCoins || 0), 0);
        const correctAnswers = answers.filter((ans) => ans.isCorrect).length;

        return res.status(200).json({
            game,
            round,
            totalTechCoins,
            answeredQuestions: answers.length,
            correctAnswers,
        });
    } catch (error) {
        console.error("Get team score error:", error);
        return res.status(500).json({
            message: "Server error while fetching score",
        });
    }
};

// ============================================================
// GET GAME SESSION STATUS (For Participant Dashboard)
// ============================================================
const getGameSessionStatus = async (req, res) => {
    try {
        const game = Number(req.query.game);
        const round = Number(req.query.round);

        const currentUser = await User.findById(req.user._id);
        if (!currentUser || !currentUser.team) {
            return res.status(400).json({ message: "You are not part of a team" });
        }

        const { isEnabled, version } = await checkGameStatusAndPin(game, round);

        const session = await GameSession.findOne({
            game,
            round,
            team: currentUser.team,
            version,
        });

        const status = session ? session.status : "not_started";

        // Count total answers for team across all versions
        const totalAnswersCount = await GameAnswer.countDocuments({
            game,
            round,
            team: currentUser.team,
        });

        // Fetch answers for current version
        const answers = await GameAnswer.find({
            game,
            round,
            team: currentUser.team,
            version,
        });

        const versionTechCoins = answers.reduce((sum, a) => sum + (a.techCoins || 0), 0);

        return res.status(200).json({
            game,
            round,
            isEnabled,
            version,
            status,
            versionTechCoins,
            answeredQuestionsCount: answers.length,
            hasPreviousAnswers: totalAnswersCount > 0,
        });
    } catch (error) {
        console.error("Get game session status error:", error);
        return res.status(500).json({ message: "Server error checking session status" });
    }
};

// ============================================================
// GET GAME ANSWERS REVIEW (For Check Quiz Answers Modal)
// ============================================================
const getGameAnswers = async (req, res) => {
    try {
        const game = Number(req.query.game);
        const round = Number(req.query.round);

        const currentUser = await User.findById(req.user._id);
        if (!currentUser || !currentUser.team) {
            return res.status(400).json({ message: "You are not part of a team" });
        }

        const { version } = await checkGameStatusAndPin(game, round);

        // Determine target version (active event version or highest version attempted)
        const latestAnswerDoc = await GameAnswer.findOne({
            game,
            round,
            team: currentUser.team,
        }).sort({ version: -1 }).lean();

        const targetVersion = latestAnswerDoc ? Math.max(version, latestAnswerDoc.version) : version;

        // Security Check: Block answers inspection if quiz session is still active
        const session = await GameSession.findOne({
            game,
            round,
            team: currentUser.team,
            version: targetVersion,
        }).lean();

        if (session && session.status !== "completed" && session.currentQuestionNumber <= session.totalQuestions) {
            return res.status(403).json({
                message: "Answers review is only unlocked after completing the quiz round.",
            });
        }

        // Fetch questions using lean query
        const questions = await Question.find({ game, round }).sort({ questionNumber: 1 }).lean();

        // Fetch user's answers strictly for the target version
        const answers = await GameAnswer.find({
            game,
            round,
            team: currentUser.team,
            version: targetVersion,
        }).lean();

        const answerMap = {};
        answers.forEach((ans) => {
            answerMap[ans.questionNumber] = ans;
        });

        const reviewData = questions.map((q) => {
            const userAns = answerMap[q.questionNumber];
            return {
                questionNumber: q.questionNumber,
                question: q.question,
                options: q.options,
                jumbledWord: q.jumbledWord,
                codeSnippet: q.codeSnippet,
                hint: q.hint,
                correctAnswer: q.correctAnswer,
                techCoins: q.techCoins || 20,
                userAnswer: userAns ? userAns.selectedAnswer : null,
                isCorrect: userAns ? userAns.isCorrect : false,
                earnedCoins: userAns ? userAns.techCoins : 0,
                answered: Boolean(userAns),
            };
        });

        const totalEarnedCoins = answers.reduce((sum, a) => sum + (a.techCoins || 0), 0);
        const correctCount = answers.filter((a) => a.isCorrect).length;

        return res.status(200).json({
            game,
            round,
            questions: reviewData,
            totalEarnedCoins,
            correctCount,
            totalQuestions: questions.length,
        });
    } catch (error) {
        console.error("Get game answers error:", error);
        return res.status(500).json({ message: "Server error fetching quiz review data" });
    }
};

// ============================================================
// END GAME SESSION EARLY (Participant Early Exit)
// ============================================================
const endGame = async (req, res) => {
    try {
        const game = Number(req.body.game);
        const round = Number(req.body.round);

        if (!game || !round) {
            return res.status(400).json({ message: "Game and round are required" });
        }

        const currentUser = await User.findById(req.user._id);
        if (!currentUser || !currentUser.team) {
            return res.status(400).json({ message: "You are not part of a team" });
        }

        const teamId = currentUser.team;
        const { version } = await checkGameStatusAndPin(game, round);

        // Find and complete active session
        let session = await GameSession.findOne({
            game,
            round,
            team: teamId,
        });

        if (session) {
            session.status = "completed";
            await session.save();
        }

        // Calculate total coins earned for the ACTIVE VERSION session so far
        const activeAnswers = await GameAnswer.find({
            game,
            round,
            team: teamId,
            version,
        });

        const activeVersionScore = activeAnswers.reduce(
            (sum, a) => sum + (a.techCoins || 0),
            0
        );

        // Update team score in Team model
        const team = await Team.findById(teamId);
        if (team) {
            if (!team.round1) team.round1 = {};
            if (!team.round4) team.round4 = {};

            if (round === 1 && game === 1) {
                team.round1.game1Score = activeVersionScore;
            } else if (round === 1 && game === 3) {
                team.round1.game3Score = activeVersionScore;
            } else if (round === 4 && game === 1) {
                team.round4.game1Score = activeVersionScore;
            }

            const calculated = calculateTeamScore(team);
            team.round1.totalScore = calculated.round1Total;
            team.round4.totalScore = calculated.round4Total;
            team.techCoins = calculated.remainingTechCoins;
            team.finalScore = calculated.finalScore;
            await team.save();
            await recalculateAllTeamRanks();
        }

        return res.status(200).json({
            message: "Game session completed early",
            roundCompleted: true,
            totalEarnedCoins: activeVersionScore,
        });
    } catch (error) {
        console.error("End game error:", error);
        return res.status(500).json({ message: "Server error while ending game" });
    }
};

module.exports = {
    verifyGamePin,
    startGame,
    getCurrentQuestion,
    submitAnswer,
    getTeamScore,
    getGameSessionStatus,
    getGameAnswers,
    endGame,
    startQuestionTimer,
};