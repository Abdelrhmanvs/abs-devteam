const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    employeeCode: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["WFH", "VACATION", "LATE_PERMISSION", "EARLY_LEAVE"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    selectedDates: {
      type: [Date],
      default: [],
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    source: {
      type: String,
      required: true,
      enum: ["EMPLOYEE_REQUEST", "ADMIN_DIRECT"],
      default: "EMPLOYEE_REQUEST",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
requestSchema.index({ employeeId: 1, createdAt: -1 });
requestSchema.index({ status: 1 });
requestSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Request", requestSchema);
