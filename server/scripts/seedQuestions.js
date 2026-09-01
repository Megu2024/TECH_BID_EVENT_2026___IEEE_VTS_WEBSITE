require("dotenv").config();

const mongoose = require("mongoose");
const Question = require("../models/Question");

const questions = [
    {
        game: 1,
        round: 1,
        questionNumber: 1,
        question: "Which component is used to limit current in a circuit?",
        options: {
            A: "Capacitor",
            B: "Resistor",
            C: "Diode",
            D: "Transistor",
        },
        correctAnswer: "B",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 2,
        question: "What is the unit of electrical resistance?",
        options: {
            A: "Volt",
            B: "Ampere",
            C: "Ohm",
            D: "Watt",
        },
        correctAnswer: "C",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 3,
        question: 'Which device is commonly called the "brain" of a computer?',
        options: {
            A: "RAM",
            B: "CPU",
            C: "Hard disk",
            D: "Monitor",
        },
        correctAnswer: "B",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 4,
        question: "Which memory is volatile?",
        options: {
            A: "ROM",
            B: "RAM",
            C: "SSD",
            D: "Hard disk",
        },
        correctAnswer: "B",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 5,
        question: "Which symbol is used for a comment in Python?",
        options: {
            A: "//",
            B: "#",
            C: "/*",
            D: "$",
        },
        correctAnswer: "B",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 6,
        question: "Which keyword is used to define a function in Python?",
        options: {
            A: "function",
            B: "define",
            C: "def",
            D: "fun",
        },
        correctAnswer: "C",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 7,
        question: "Which of these is NOT a programming language?",
        options: {
            A: "Python",
            B: "Java",
            C: "HTML",
            D: "C++",
        },
        correctAnswer: "C",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 8,
        question: "A diode normally allows current to flow in how many directions?",
        options: {
            A: "One",
            B: "Two",
            C: "Three",
            D: "None",
        },
        correctAnswer: "A",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 9,
        question: "Which sensor changes its resistance according to light intensity?",
        options: {
            A: "LDR",
            B: "LED",
            C: "Diode",
            D: "Relay",
        },
        correctAnswer: "A",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 10,
        question: "Which component is mainly used to store electrical charge?",
        options: {
            A: "Transistor",
            B: "LED",
            C: "Resistor",
            D: "Capacitor",
        },
        correctAnswer: "D",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 11,
        question: "Which component is commonly used to convert AC to DC?",
        options: {
            A: "Transformer",
            B: "Rectifier",
            C: "Transistor",
            D: "Capacitor",
        },
        correctAnswer: "B",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 12,
        question: "A camera captures an image and software analyzes it to detect a vehicle. Which combination is being used?",
        options: {
            A: "Hardware only",
            B: "Software only",
            C: "Hardware + Software",
            D: "None",
        },
        correctAnswer: "C",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 13,
        question:
            "An ultrasonic sensor detects an obstacle and sends the distance to a microcontroller. What is the sensor's role?",
        options: {
            A: "Data input",
            B: "Data output",
            C: "Power supply",
            D: "Data storage",
        },
        correctAnswer: "A",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 14,
        question: "What does GPS stand for?",
        options: {
            A: "Global Positioning System",
            B: "General Positioning Service",
            C: "Global Processing System",
            D: "Geographic Positioning Service",
        },
        correctAnswer: "A",
    },
    {
        game: 1,
        round: 1,
        questionNumber: 15,
        question: "Which device is used to measure temperature electronically?",
        options: {
            A: "Thermistor",
            B: "Resistor",
            C: "Capacitor",
            D: "Transformer",
        },
        correctAnswer: "A",
    },
];

const seedQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        // Remove existing Game 1 Round 1 questions
        await Question.deleteMany({
            game: 1,
            round: 1,
        });

        // Insert the 15 questions
        await Question.insertMany(questions);

        console.log("15 Game 1 Round 1 questions inserted successfully");

        await mongoose.disconnect();

        console.log("MongoDB disconnected");
        process.exit(0);
    } catch (error) {
        console.error("Question seeding error:", error);

        await mongoose.disconnect();
        process.exit(1);
    }
};

seedQuestions();