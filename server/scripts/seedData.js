require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Admin = require("../models/Admin");
const EventSettings = require("../models/EventSettings");
const Question = require("../models/Question");
const TechCard = require("../models/TechCard");
const ProblemStatement = require("../models/ProblemStatement");
const ImageSet = require("../models/ImageSet");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            tls: true,
            maxPoolSize: 10,
        });
        console.log("Connected to MongoDB Atlas / Database");

        // 1. Create or Update Admin
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@techbid.com").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "megu2026";
        const adminName = process.env.ADMIN_NAME || "Tech Bid 2026 Event Admin";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await Admin.findOneAndUpdate(
            { email: adminEmail },
            {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            },
            { upsert: true, returnDocument: "after" }
        );

        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                registerNumber: "ADMIN001",
                role: "admin",
            },
            { upsert: true, returnDocument: "after" }
        );
        console.log(`✅ Admin account configured: ${adminEmail}`);

        // 2. Initialize Event Settings
        let settings = await EventSettings.findOne();
        if (!settings) {
            settings = await EventSettings.create({
                currentRound: 1,
                currentGame: 1,
                r1g1Enabled: true,
                r1g1Pin: "1234",
                r1g3Enabled: true,
                r1g3Pin: "2345",
                r4g1Enabled: true,
                r4g1Pin: "3456",
                leaderboardVisible: false,
            });
            console.log("✅ Event settings initialized");
        }

        // 3. Clear and Seed Questions for R1G1 (10 Questions, 10s timer)
        await Question.deleteMany({ game: 1, round: 1 });
        const r1g1Questions = [
            {
                game: 1,
                round: 1,
                questionNumber: 1,
                questionType: "mcq",
                question: "Which communication protocol is universally standard in automotive Electronic Control Units (ECUs)?",
                options: { A: "SPI", B: "CAN Bus", C: "I2C", D: "UART" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 2,
                questionType: "mcq",
                question: "What is the primary function of a Battery Management System (BMS) in Electric Vehicles?",
                options: { A: "Air Conditioning", B: "Cell Balancing & State-of-Charge (SoC)", C: "Headlight Control", D: "Radio Tuning" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 3,
                questionType: "mcq",
                question: "Which sensor provides 3D spatial point clouds for autonomous vehicle navigation?",
                options: { A: "LiDAR", B: "Thermistor", C: "Hall Effect Sensor", D: "Potentiometer" },
                correctAnswer: "A",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 4,
                questionType: "mcq",
                question: "What does V2X communication stand for in intelligent transportation systems?",
                options: { A: "Voltage to Xenon", B: "Vehicle-to-Everything", C: "Virtual 2D Exchange", D: "Vector to X-axis" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 5,
                questionType: "mcq",
                question: "Which type of electric motor is most widely used in modern high-performance EV powertrains?",
                options: { A: "Brushed DC Motor", B: "Permanent Magnet Synchronous Motor (PMSM)", C: "Shaded Pole Motor", D: "Universal Motor" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 6,
                questionType: "mcq",
                question: "In regenerative braking, what role does the traction motor serve?",
                options: { A: "Generator", B: "Capacitor", C: "Transformer", D: "Inductor" },
                correctAnswer: "A",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 7,
                questionType: "mcq",
                question: "Which wireless protocol is commonly used for short-range EV charging communication (ISO 15118)?",
                options: { A: "Zigbee", B: "Power-Line Communication (PLC) / Wi-Fi", C: "Infrared", D: "NFC Only" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 8,
                questionType: "mcq",
                question: "Which computing paradigm processes sensor data locally inside the vehicle instead of sending to the cloud?",
                options: { A: "Cloud Storage", B: "Edge Computing", C: "Quantum Teleportation", D: "Dial-up Networking" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 9,
                questionType: "mcq",
                question: "What does GNSS RTK stand for in precision vehicle centimeter-level localization?",
                options: { A: "Real-Time Kinematic", B: "Radio Transmission Key", C: "Remote Timing Kernel", D: "Relay Token Keeper" },
                correctAnswer: "A",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 1,
                round: 1,
                questionNumber: 10,
                questionType: "mcq",
                question: "Which ISO safety standard defines Functional Safety for road vehicles?",
                options: { A: "ISO 9001", B: "ISO 26262", C: "ISO 14001", D: "ISO 27001" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
        ];
        await Question.insertMany(r1g1Questions);
        console.log(`✅ Seeded ${r1g1Questions.length} Round 1 Game 1 Quiz questions`);

        // 4. Seed 10 Questions for R1G3 (Code Output & Debugging, 10s timer)
        await Question.deleteMany({ game: 3, round: 1 });
        const r1g3Questions = [
            {
                game: 3,
                round: 1,
                questionNumber: 1,
                questionType: "code",
                question: "What is the output of this C code for calculating motor speed PWM?",
                codeSnippet: "#include <stdio.h>\nint main() {\n    int pwm = 255;\n    int duty = (pwm >> 1) + 1;\n    printf(\"%d\", duty);\n    return 0;\n}",
                options: { A: "127", B: "128", C: "256", D: "64" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 2,
                questionType: "code",
                question: "Identify the output of this Python sensor threshold check:",
                codeSnippet: "sensors = [12, 45, 89, 23, 99]\nhigh = [x for x in sensors if x > 40]\nprint(len(high))",
                options: { A: "2", B: "3", C: "4", D: "5" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 3,
                questionType: "code",
                question: "What does this JavaScript bitwise mask output for CAN ID filtering?",
                codeSnippet: "const canId = 0x7E8;\nconst isDiagnostic = (canId & 0x7F0) === 0x7E0;\nconsole.log(isDiagnostic ? 'YES' : 'NO');",
                options: { A: "YES", B: "NO", C: "undefined", D: "Error" },
                correctAnswer: "A",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 4,
                questionType: "code",
                question: "What is printed by this recursive battery cell count?",
                codeSnippet: "def count_cells(n):\n    if n <= 1: return 1\n    return n + count_cells(n - 1)\nprint(count_cells(4))",
                options: { A: "4", B: "10", C: "14", D: "24" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 5,
                questionType: "code",
                question: "What is the final value of 'temp' in this thermal monitoring loop?",
                codeSnippet: "int temp = 25;\nfor(int i = 0; i < 3; i++) {\n    temp += (i * 5);\n}\nprintf(\"%d\", temp);",
                options: { A: "25", B: "35", C: "40", D: "55" },
                correctAnswer: "C",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 6,
                questionType: "code",
                question: "What is the output of this pointer arithmetic in C?",
                codeSnippet: "int arr[] = {10, 20, 30, 40};\nint *ptr = arr;\nprintf(\"%d\", *(ptr + 2));",
                options: { A: "10", B: "20", C: "30", D: "40" },
                correctAnswer: "C",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 7,
                questionType: "code",
                question: "What does this Python dictionary comprehension evaluate to?",
                codeSnippet: "nodes = {'CAN1': 500, 'CAN2': 250, 'LIN': 19.2}\nfast = sum(1 for k, v in nodes.items() if v >= 250)\nprint(fast)",
                options: { A: "1", B: "2", C: "3", D: "0" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 8,
                questionType: "code",
                question: "What is the output of this modulo check for vehicle telemetry frames?",
                codeSnippet: "int frameCount = 104;\nint isSync = (frameCount % 8 == 0);\nprintf(\"%d\", isSync);",
                options: { A: "0", B: "1", C: "8", D: "13" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 9,
                questionType: "code",
                question: "What will be printed by this ternary statement in C++?",
                codeSnippet: "int batterySoC = 18;\nstd::cout << (batterySoC < 20 ? \"CRITICAL\" : \"NORMAL\");",
                options: { A: "NORMAL", B: "CRITICAL", C: "18", D: "FALSE" },
                correctAnswer: "B",
                techCoins: 20,
                timeLimit: 10,
            },
            {
                game: 3,
                round: 1,
                questionNumber: 10,
                questionType: "code",
                question: "What is the output of this Python slice operation on a GPS NMEA sentence?",
                codeSnippet: "nmea = '$GPGGA,123519'\nprint(nmea[1:6])",
                options: { A: "GPGGA", B: "$GPGG", C: "GPGGA,", D: "GGA" },
                correctAnswer: "A",
                techCoins: 20,
                timeLimit: 10,
            },
        ];
        await Question.insertMany(r1g3Questions);
        console.log(`✅ Seeded ${r1g3Questions.length} Round 1 Game 3 Code Debugging questions`);

        // 5. Seed 10 Questions for R4G1 (Jumbled Technical Words, 15s timer)
        await Question.deleteMany({ game: 1, round: 4 });
        const r4g1Questions = [
            {
                game: 1,
                round: 4,
                questionNumber: 1,
                questionType: "jumbled",
                question: "Unscramble this passive two-terminal electrical component:",
                jumbledWord: "S R E T O S I R",
                hint: "Limits or regulates electric current flow",
                options: { A: "INDUCTOR", B: "RESISTOR", C: "TRANSISTOR", D: "VARISTOR" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 2,
                questionType: "jumbled",
                question: "Unscramble this essential autonomous vehicle optical sensor:",
                jumbledWord: "D I L A R",
                hint: "Uses laser light pulses to generate 3D point clouds",
                options: { A: "RADAR", B: "SONAR", C: "LIDAR", D: "CAMERA" },
                correctAnswer: "C",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 3,
                questionType: "jumbled",
                question: "Unscramble this core power electronic circuit component:",
                jumbledWord: "R E T R E V N I",
                hint: "Converts DC battery power into AC for electric motors",
                options: { A: "CONVERTER", B: "INVERTER", C: "RECTIFIER", D: "REGULATOR" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 4,
                questionType: "jumbled",
                question: "Unscramble this vehicle network communication protocol:",
                jumbledWord: "E T N E T H R E",
                hint: "High-bandwidth automotive backbone network standard",
                options: { A: "ETHERNET", B: "FLEXRAY", C: "BLUETOOTH", D: "WIRELESS" },
                correctAnswer: "A",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 5,
                questionType: "jumbled",
                question: "Unscramble this device used for kinetic energy harvesting:",
                jumbledWord: "E N E G R E T A O R",
                hint: "Converts mechanical energy into electrical energy during braking",
                options: { A: "ALTERNATOR", B: "GENERATOR", C: "REGULATOR", D: "COMPRESSOR" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 6,
                questionType: "jumbled",
                question: "Unscramble this microcontroller communication peripheral:",
                jumbledWord: "C I N R O T R O L E L",
                hint: "Embedded integrated circuit brain of automotive subsystems",
                options: { A: "MICROPROCESSOR", B: "MICROCONTROLLER", C: "SEMICONDUCTOR", D: "OSCILLATOR" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 7,
                questionType: "jumbled",
                question: "Unscramble this thermal management component in EVs:",
                jumbledWord: "D I R A A T O R",
                hint: "Dissipates heat from battery & inverter coolant loops",
                options: { A: "CONDENSER", B: "RADIATOR", C: "EVAPORATOR", D: "THERMOSTAT" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 8,
                questionType: "jumbled",
                question: "Unscramble this sensor measuring angular velocity:",
                jumbledWord: "S C O R E O P Y G",
                hint: "Critical component in Inertial Measurement Units (IMUs)",
                options: { A: "GYROSCOPE", B: "TACHOMETER", C: "BAROMETER", D: "ALTIMETER" },
                correctAnswer: "A",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 9,
                questionType: "jumbled",
                question: "Unscramble this battery chemistry type commonly used in EVs:",
                jumbledWord: "I U M H T I L",
                hint: "Lightweight alkali metal powering modern high-density batteries",
                options: { A: "NICKEL", B: "LITHIUM", C: "CADMIUM", D: "COBALT" },
                correctAnswer: "B",
                techCoins: 30,
                timeLimit: 15,
            },
            {
                game: 1,
                round: 4,
                questionNumber: 10,
                questionType: "jumbled",
                question: "Unscramble this wireless positioning standard:",
                jumbledWord: "T E T E L L I S A",
                hint: "Constellation of orbiters broadcasting GPS timing signals",
                options: { A: "SATELLITE", B: "TRANSMITTER", C: "TELEMETRY", D: "ANTENNA" },
                correctAnswer: "A",
                techCoins: 30,
                timeLimit: 15,
            },
        ];
        await Question.insertMany(r4g1Questions);
        console.log(`✅ Seeded ${r4g1Questions.length} Round 4 Game 1 Jumbled Word questions (15s timer)`);

        // 6. Seed Image Sets for Round 1 Game 2 (Set A, Set B, Set C)
        await ImageSet.deleteMany({});
        const defaultImageSets = [
            {
                setNumber: 1,
                setName: "Set A",
                questions: [
                    {
                        questionNumber: 1,
                        technicalTerm: "CAN BUS TRANSCEIVER",
                        hint: "Automotive Differential Serial Communication",
                        images: [
                            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 2,
                        technicalTerm: "LIDAR SENSOR",
                        hint: "Laser Optical 3D Perception System",
                        images: [
                            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 3,
                        technicalTerm: "BATTERY MANAGEMENT SYSTEM",
                        hint: "EV State-of-Charge and Cell Balancer",
                        images: [
                            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 4,
                        technicalTerm: "TRACTION INVERTER",
                        hint: "High-voltage DC to 3-Phase AC Motor Drive",
                        images: [
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                ],
            },
            {
                setNumber: 2,
                setName: "Set B",
                questions: [
                    {
                        questionNumber: 1,
                        technicalTerm: "REGENERATIVE BRAKING SYSTEM",
                        hint: "Kinetic Energy Recovery via Motor Drag",
                        images: [
                            "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 2,
                        technicalTerm: "EDGE AI VISION PROCESSOR",
                        hint: "Low-latency Neural Object Detection Unit",
                        images: [
                            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 3,
                        technicalTerm: "DUAL CHANNEL ROTARY ENCODER",
                        hint: "High-precision Angular Shaft Feedback",
                        images: [
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 4,
                        technicalTerm: "RTK GNSS LOCALIZATION MODULE",
                        hint: "Centimeter-precision Global Positioning",
                        images: [
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                ],
            },
            {
                setNumber: 3,
                setName: "Set C",
                questions: [
                    {
                        questionNumber: 1,
                        technicalTerm: "ISOLATED DC-DC CONVERTER",
                        hint: "High-to-Low Voltage Auxiliary Power Stepper",
                        images: [
                            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 2,
                        technicalTerm: "PMSM ELECTRIC MOTOR",
                        hint: "Permanent Magnet Synchronous Stator/Rotor",
                        images: [
                            "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 3,
                        technicalTerm: "V2X TELEMATICS UNIT",
                        hint: "Dedicated Short-Range DSRC & C-V2X Radio",
                        images: [
                            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                    {
                        questionNumber: 4,
                        technicalTerm: "PYROFUSE SAFETY DISCONNECT",
                        hint: "Ultra-fast Explosive Battery Isolation Switch",
                        images: [
                            "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=500&auto=format&fit=crop&q=60",
                            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
                        ],
                    },
                ],
            },
        ];
        await ImageSet.insertMany(defaultImageSets);
        console.log(`✅ Seeded ${defaultImageSets.length} Image Sets (Set A, Set B, Set C) with 4 questions & 4 images each`);

        // 7. Seed Tech Cards (Round 2)
        await TechCard.deleteMany({});
        const techCards = [
            { name: "Solid-State LiDAR 360", basePrice: 60, marketValue: 120, category: "Perception Hardware" },
            { name: "Edge AI Neural Vision Unit", basePrice: 50, marketValue: 100, category: "Perception Software" },
            { name: "Smart Battery Management (BMS)", basePrice: 40, marketValue: 90, category: "Powertrain / Energy" },
            { name: "Traction Motor Inverter (150kW)", basePrice: 55, marketValue: 110, category: "Powertrain / Energy" },
            { name: "RTK Centimeter GPS Receiver", basePrice: 45, marketValue: 95, category: "Localization" },
            { name: "V2X Telematics Control Unit", basePrice: 50, marketValue: 105, category: "Connected Vehicle" },
            { name: "Automotive Isolated CAN Transceiver", basePrice: 30, marketValue: 70, category: "Embedded Hardware" },
            { name: "Regenerative Braking Power Harvester", basePrice: 45, marketValue: 85, category: "Powertrain / Energy" },
        ];
        await TechCard.insertMany(techCards);
        console.log(`✅ Seeded ${techCards.length} Tech Cards for Round 2 Auction`);

        // 8. Seed Problem Statements (Round 3 & 5)
        await ProblemStatement.deleteMany({});
        const problemStatements = [
            {
                statementNumber: 1,
                title: "High-Speed Autonomous Lane-Merge & Collision Avoidance",
                category: "Autonomous Systems & Perception",
                description: "Design an intelligent ADAS perception and path-planning architecture capable of 120 km/h highway merging in severe fog and rain with zero false alarms.",
                requiredTechCards: ["Solid-State LiDAR 360", "Edge AI Neural Vision Unit", "RTK Centimeter GPS Receiver"],
                minBid: 80,
            },
            {
                statementNumber: 2,
                title: "Ultra-Fast EV Thermal Runaway Mitigation & Smart Grid V2G",
                category: "EV Powertrain & Energy Storage",
                description: "Architect a battery pack telemetry and active liquid cooling system that prevents thermal runaway under 350kW DC fast charging while enabling bidirectional V2G power transfer.",
                requiredTechCards: ["Smart Battery Management (BMS)", "Traction Motor Inverter (150kW)", "Automotive Isolated CAN Transceiver"],
                minBid: 75,
            },
            {
                statementNumber: 3,
                title: "Connected Multi-Vehicle Cooperative Platooning (V2X)",
                category: "Connected Mobility & V2X",
                description: "Develop a secure, ultra-low latency V2V platooning system for heavy commercial electric trucks to minimize aerodynamic drag and eliminate accordion traffic shockwaves.",
                requiredTechCards: ["V2X Telematics Control Unit", "Automotive Isolated CAN Transceiver", "RTK Centimeter GPS Receiver"],
                minBid: 70,
            },
            {
                statementNumber: 4,
                title: "High-Efficiency Regenerative Braking & Torque Vectoring Controller",
                category: "EV Powertrain & Dynamics",
                description: "Implement a sub-millisecond dual-motor torque vectoring and regenerative braking control algorithm maximizing kinetic energy recovery on icy serpentine race tracks.",
                requiredTechCards: ["Regenerative Braking Power Harvester", "Traction Motor Inverter (150kW)", "Smart Battery Management (BMS)"],
                minBid: 65,
            },
        ];
        await ProblemStatement.insertMany(problemStatements);
        console.log(`✅ Seeded ${problemStatements.length} Problem Statements for Round 3 & 5`);

        console.log("\n🎉 Database seeded and ready for IEEE VTS Tech Bid Event 2026!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    }
};

seedDatabase();
