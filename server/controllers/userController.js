const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const { name, email, password, registerNumber } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (existingUser) {
            return res.status(400).json({
                message: "An account with this email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            registerNumber: registerNumber ? registerNumber.trim() : "",
            role: "participant",
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registerNumber: user.registerNumber,
                role: user.role,
                team: user.team,
            },
        });
    } catch (error) {
        console.error("User registration error:", error);

        res.status(500).json({
            message: "Server error during registration",
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registerNumber: user.registerNumber,
                role: user.role,
                team: user.team,
            },
        });
    } catch (error) {
        console.error("User login error:", error);

        res.status(500).json({
            message: "Server error during login",
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate("team");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                registerNumber: user.registerNumber,
                role: user.role,
                team: user.team,
            },
        });
    } catch (error) {
        console.error("Get user profile error:", error);

        res.status(500).json({
            message: "Server error while fetching user",
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
};