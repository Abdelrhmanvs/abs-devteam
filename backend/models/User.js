const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Legacy fields (kept for backward compatibility)
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  roles: {
    type: [String],
    default: ["user"],
  },
  active: {
    type: Boolean,
    default: true,
  },
  phonenumber: {
    type: String,
    default: "123",
  },
  encryptedPassword: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "country",
  },
  city: {
    type: String,
    default: "city",
  },
  location: {
    type: String,
    default: "",
  },
  platformUsageCount: {
    type: Number,
    default: 0,
  },

  // New Employee-specific fields
  fullName: {
    type: String,
    required: function () {
      // Only required if employeeCode exists (i.e., this is an employee)
      return !!this.employeeCode;
    },
    trim: true,
  },
  fullNameArabic: {
    type: String,
    trim: true,
    default: "",
  },
  employeeCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined while maintaining uniqueness for non-null values
    trim: true,
  },
  fingerprintCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  jobPosition: {
    type: String,
    trim: true,
  },
  branch: {
    type: String,
    default: "المركز الرئيسي",
    trim: true,
  },
  title: {
    type: String,
    enum: [
      "Frontend Lead",
      "Backend Lead",
      "Frontend Developer",
      "Backend Developer",
      "UI/UX",
      "RA",
    ],
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
userSchema.index({ employeeCode: 1 });
userSchema.index({ email: 1 });
userSchema.index({ fingerprintCode: 1 });

module.exports = mongoose.model("User", userSchema);
