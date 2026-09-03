import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../services/api";
import "./Game1Round1.css";

const API_URL = `${API_BASE_URL}/api`;

function Game1Round1() {
    const [gameStarted, setGameStarted] = useState(false);
    const [question, setQuestion] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(15);

    const [timeLeft, setTimeLeft] = useState(0);
    const [score, setScore] = useState(0);

    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const timerRef = useRef(null);
    const token = localStorage.getItem("token");

    // --------------------------------
    // HEADERS
    // --------------------------------

    const getHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    });

    // --------------------------------
    // START GAME
    // --------------------------------

    const startGame = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/game/start`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    game: 1,
                    round: 1,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to start game"
                );
            }

            setGameStarted(true);
            setSelectedAnswer(null);

            await fetchCurrentQuestion();
            await fetchScore();
        } catch (error) {
            console.error("Start game error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // GET CURRENT QUESTION
    // --------------------------------

    const fetchCurrentQuestion = async () => {
        try {
            const response = await fetch(
                `${API_URL}/game/current-question?game=1&round=1`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch question"
                );
            }

            // ----------------------------
            // ROUND COMPLETED
            // ----------------------------

            if (data.status === "completed") {
                setQuestion(null);
                setTimeLeft(0);
                setSelectedAnswer(null);
                setSubmitting(false);

                await fetchScore();

                return;
            }

            // ----------------------------
            // GAME WAITING
            // ----------------------------

            if (data.status === "waiting") {
                return;
            }

            // ----------------------------
            // RUNNING
            // ----------------------------

            if (data.question) {
                setQuestion(data.question);
                setCurrentQuestion(
                    data.question.questionNumber
                );

                setTotalQuestions(data.totalQuestions);

                setTimeLeft(data.remainingSeconds);

                setSelectedAnswer(null);
                setSubmitting(false);
            }
        } catch (error) {
            console.error(
                "Fetch question error:",
                error
            );

            setError(error.message);
        }
    };

    // --------------------------------
    // SUBMIT ANSWER
    // --------------------------------

    // --------------------------------
    // SUBMIT ANSWER
    // --------------------------------

    const submitAnswer = async (answer) => {
        if (!question || selectedAnswer) return;

        const questionNumber = question.questionNumber;

        // Highlight immediately
        setSelectedAnswer(answer);

        try {
            const response = await fetch(`${API_URL}/game/answer`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify({
                    game: 1,
                    round: 1,
                    questionNumber,
                    selectedAnswer: answer,
                }),
            });

            const data = await response.json();

            // Server rejected answer
            if (!response.ok) {
                console.log(data.message);

                await fetchCurrentQuestion();

                return;
            }

            // Update score
            await fetchScore();

            // Last question
            if (data.roundCompleted) {
                setQuestion(null);
                setTimeLeft(0);
                return;
            }

            // IMPORTANT:
            // Immediately move to next question
            await fetchCurrentQuestion();

        } catch (error) {
            console.error("Submit answer error:", error);

            setSelectedAnswer(null);

            setError(
                "Unable to submit answer. Please try again."
            );
        }
    };

    // --------------------------------
    // GET TEAM SCORE
    // --------------------------------

    const fetchScore = async () => {
        try {
            const response = await fetch(
                `${API_URL}/game/score?game=1&round=1`,
                {
                    method: "GET",
                    headers: getHeaders(),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to fetch score"
                );
            }

            setScore(data.totalTechCoins || 0);
        } catch (error) {
            console.error(
                "Score error:",
                error
            );
        }
    };

    // --------------------------------
    // TIMER
    // --------------------------------

    useEffect(() => {
        if (!gameStarted || !question) return;

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [gameStarted, question?.questionNumber]);

    // --------------------------------
    // TIMER EXPIRED
    // --------------------------------

    useEffect(() => {
        if (!gameStarted || !question || timeLeft > 0) {
            return;
        }

        const moveToNextQuestion = async () => {
            await fetchCurrentQuestion();
        };

        moveToNextQuestion();
    }, [timeLeft, gameStarted, question]);

    // --------------------------------
    // INITIAL SCORE
    // --------------------------------

    useEffect(() => {
        if (!gameStarted) {
            return;
        }

        fetchScore();
    }, [gameStarted]);

    // --------------------------------
    // START SCREEN
    // --------------------------------

    if (!gameStarted) {
        return (
            <div className="game-page">
                <div className="start-screen">
                    <h1>
                        TECH BID EVENT 2026
                    </h1>

                    <h2>
                        Game 1 — Round 1
                    </h2>

                    <p>
                        15 Technical Questions
                    </p>

                    <p>
                        20 Tech Coins per correct
                        answer
                    </p>

                    <p>
                        10 seconds per question
                    </p>

                    {error && (
                        <p className="error-message">
                            {error}
                        </p>
                    )}

                    <button
                        className="start-button"
                        onClick={startGame}
                        disabled={loading}
                    >
                        {loading
                            ? "STARTING..."
                            : "START GAME"}
                    </button>
                </div>
            </div>
        );
    }

    // --------------------------------
    // ROUND COMPLETE
    // --------------------------------

    if (!question) {
        return (
            <div className="game-page">
                <div className="complete-screen">
                    <div className="complete-icon">
                        🏆
                    </div>

                    <h1>
                        Round Complete!
                    </h1>

                    <p>
                        Game 1 — Round 1
                    </p>

                    <div className="final-score-card">
                        <span>
                            Your Team Score
                        </span>

                        <strong>
                            🪙 {score}
                        </strong>

                        <small>
                            Tech Coins
                        </small>
                    </div>

                    <p className="completion-message">
                        Great job! Your Round 1
                        score has been recorded.
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------
    // GAME SCREEN
    // --------------------------------

    return (
        <div className="game-page">
            <div className="game-header">
                <h1>
                    TECH BID EVENT 2026
                </h1>

                <div className="round-info">
                    Game 1 • Round 1
                </div>

                <div className="score-display">
                    🪙 {score}
                </div>
            </div>

            <div className="game-container">
                <div className="question-top">
                    <span>
                        Question{" "}
                        {currentQuestion} /{" "}
                        {totalQuestions}
                    </span>

                    <span
                        className={
                            timeLeft <= 3
                                ? "timer danger"
                                : "timer"
                        }
                    >
                        {timeLeft}s
                    </span>
                </div>

                <div className="question-card">
                    <h2>
                        {question.question}
                    </h2>

                    <div className="options">
                        {Object.entries(
                            question.options
                        ).map(
                            ([key, value]) => (
                                <button
                                    key={key}
                                    className={
                                        selectedAnswer ===
                                            key
                                            ? "option selected"
                                            : "option"
                                    }
                                    onClick={() =>
                                        submitAnswer(
                                            key
                                        )
                                    }
                                    disabled={
                                        submitting ||
                                        selectedAnswer !==
                                        null
                                    }
                                >
                                    <span className="option-key">
                                        {key}
                                    </span>

                                    <span>
                                        {value}
                                    </span>
                                </button>
                            )
                        )}
                    </div>

                    <div className="coins">
                        🪙 20 Tech Coins
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game1Round1;