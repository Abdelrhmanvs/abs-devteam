require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { encryptPassword } = require("../utils/encryption");

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email: "adham@admin.com" });
    if (existingUser) {
      console.log("Admin user 'adham' already exists!");
      process.exit(0);
    }

    // Admin user details
    const password = "adham123"; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedPassword = encryptPassword(password);

    // Create admin user
    const adminUser = await User.create({
      username: "adham",
      fullName: "Adham Admin",
      email: "adham@admin.com",
      password: hashedPassword,
      encryptedPassword: encryptedPassword,
      roles: ["admin"],
      active: true,
      phonenumber: "0000000000",
      country: "Egypt",
      city: "Cairo",
    });

    console.log("✅ Admin user created successfully!");
    console.log("Email: adham@admin.com");
    console.log("Password: adham123");
    console.log("Roles: admin");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
