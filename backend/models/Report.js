const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  scanType: {
    type: String,
    required: true,
    enum: ["xray", "ct", "mri", "ecg"],
  },
  clinicalNotes: {
    type: String,
    default: "",
  },
  diagnosis: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    required: true,
    enum: ["normal", "abnormal", "critical"],
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ["Low", "Moderate", "High"],
  },
  details: {
    type: String,
    default: "",
  },
  recommendations: {
    type: [String],
    default: [],
  },
  imageUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportSchema);
