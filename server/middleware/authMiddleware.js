const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const userId = decoded.id || decoded.userId || decoded._id;

        if (!userId) {
            return res.status(401).json({
                message: "Malformed token payload",
            });
        }

        let user = await User.findById(userId).select("-password");

        if (!user) {
            const Admin = require("../models/Admin");
            user = await Admin.findById(userId).select("-password");
            if (user) {
                user = { ...user.toObject(), role: "admin" };
            }
        }

        if (!user) {
            return res.status(401).json({
                message: "User not found",
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = protect;