const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const protectAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No admin token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const adminId = decoded.id || decoded.userId || decoded._id;

        if (!adminId) {
            return res.status(401).json({
                message: "Malformed token payload",
            });
        }

        // Check in Admin collection first
        let admin = null;
        try {
            if (adminId !== "admin_master_session") {
                admin = await Admin.findById(adminId).select("-password");
            }
        } catch (e) {}

        // If not found in Admin, check User collection for role === 'admin'
        if (!admin && adminId !== "admin_master_session") {
            try {
                const user = await User.findById(adminId).select("-password");
                if (user && user.role === "admin") {
                    admin = user;
                }
            } catch (e) {}
        }

        // Fallback for valid decoded admin token
        if (!admin && decoded.role === "admin") {
            admin = {
                _id: adminId,
                name: process.env.ADMIN_NAME || "Tech Bid Admin",
                email: decoded.email || process.env.ADMIN_EMAIL || "admin@techbid.com",
                role: "admin",
            };
        }

        if (!admin) {
            return res.status(403).json({
                message: "Admin authorization required",
            });
        }

        req.admin = admin;

        next();
    } catch (error) {
        console.error("Admin authentication error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired admin token",
        });
    }
};

module.exports = protectAdmin;