require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        const name = process.env.ADMIN_NAME || "Event Admin";

        if (!email || !password) {
            console.error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be present in .env"
            );
            process.exit(1);
        }

        const existingAdmin = await Admin.findOne({
            email: email.toLowerCase(),
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await Admin.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        console.log("Admin created successfully");

        process.exit(0);
    } catch (error) {
        console.error("Admin creation error:", error);
        process.exit(1);
    }
};

createAdmin();