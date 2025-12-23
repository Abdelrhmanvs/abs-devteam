require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: "adham" });
    if (existingAdmin) {
      console.log("Admin user 'adham' already exists!");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("adham123", 10);

    // Create admin user
    const adminUser = await User.create({
      username: "adham",
      password: hashedPassword,
      plainPassword: "adham123",
      fullName: "Adham Admin",
      email: "adham@admin.com",
      roles: ["admin", "user"],
      active: true,
      employeeCode: "ADMIN001",
      fingerprintCode: "FP-ADMIN001",
      jobPosition: "System Administrator",
      branch: "المركز الرئيسي",
      phoneNumber: "1234567890",
    });

    console.log("✅ Admin user created successfully!");
    console.log("Username: adham");
    console.log("Password: adham123");
    console.log("Roles:", adminUser.roles);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();
