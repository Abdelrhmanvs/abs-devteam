const Report = require("../models/Report");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const { getAIModel } = require("../utils/aiModel");
const imageProcessor = require("../utils/imageProcessor");

//@desc Analyze X-ray with AI
//@route POST /reports/analyze
//@access Private
const analyzeXray = asyncHandler(async (req, res) => {
  const username = req.user;

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }

  try {
    // Validate image
    await imageProcessor.validateImage(req.file);

    // Get patient data from request
    const { patientName, age, gender, scanType, clinicalNotes, history } =
      req.body;

    // Validate required fields
    if (!patientName || !age || !gender || !scanType) {
      return res.status(400).json({
        message: "Patient name, age, gender, and scan type are required",
      });
    }

    // Process image
    const { processedImage, metadata } =
      await imageProcessor.processForAnalysis(req.file.buffer);

    // Save original image
    const filename = `xray_${Date.now()}_${req.file.originalname}`;
    const savedImage = await imageProcessor.saveImage(
      req.file.buffer,
      filename,
      "uploads"
    );

    // Prepare patient data for AI
    const patientData = {
      age: parseInt(age),
      gender,
      scanType,
      history: history ? history.split(",").map((h) => h.trim()) : [],
    };

    // Add realistic processing delay (2-4 seconds)
    const delay = 2000 + Math.random() * 2000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Get AI model and analyze
    const aiModel = getAIModel();
    const analysisResult = await aiModel.analyzeXray(
      processedImage,
      patientData
    );

    // Return analysis results
    res.json({
      success: true,
      analysis: analysisResult.analysis,
      imageUrl: savedImage.url,
      imageMetadata: metadata,
      patientInfo: {
        patientName,
        age: parseInt(age),
        gender,
        scanType,
      },
    });
  } catch (error) {
    console.error("Error analyzing X-ray:", error);
    res.status(500).json({
      message: "Failed to analyze X-ray",
      error: error.message,
    });
  }
});

//@desc Create new report (Save AI Analysis)
//@route POST /reports
//@access Private
const createReport = asyncHandler(async (req, res) => {
  const username = req.user;
  const {
    patientName,
    age,
    gender,
    scanType,
    clinicalNotes,
    diagnosis,
    confidence,
    status,
    riskLevel,
    details,
    recommendations,
    imageUrl,
  } = req.body;

  // Validate required fields
  if (
    !patientName ||
    !age ||
    !gender ||
    !scanType ||
    !diagnosis ||
    !confidence ||
    !status ||
    !riskLevel
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  // Find user
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Increment platform usage count
  user.platformUsageCount = (user.platformUsageCount || 0) + 1;
  await user.save();

  // Create report
  const report = await Report.create({
    userId: user._id,
    patientName,
    age,
    gender,
    scanType,
    clinicalNotes,
    diagnosis,
    confidence,
    status,
    riskLevel,
    details,
    recommendations,
    imageUrl,
  });

  res.status(201).json({
    message: "Report created successfully",
    report,
  });
});

//@desc Get all reports for current user
//@route GET /reports
//@access Private
const getUserReports = asyncHandler(async (req, res) => {
  const username = req.user;

  // Find user
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Get all reports for this user
  const reports = await Report.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  res.json({ reports });
});

//@desc Get single report
//@route GET /reports/:id
//@access Private
const getReport = asyncHandler(async (req, res) => {
  const username = req.user;
  const { id } = req.params;

  // Find user
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Get report
  const report = await Report.findOne({ _id: id, userId: user._id })
    .lean()
    .exec();
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json({ report });
});

//@desc Delete report
//@route DELETE /reports/:id
//@access Private
const deleteReport = asyncHandler(async (req, res) => {
  const username = req.user;
  const { id } = req.params;

  // Find user
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Delete report
  const report = await Report.findOneAndDelete({
    _id: id,
    userId: user._id,
  }).exec();
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  res.json({ message: "Report deleted successfully" });
});

//@desc Get user statistics
//@route GET /reports/stats
//@access Private
const getUserStats = asyncHandler(async (req, res) => {
  const username = req.user;

  // Find user
  const user = await User.findOne({ username }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Get all reports for this user
  const reports = await Report.find({ userId: user._id }).lean().exec();

  // Calculate stats
  const totalReports = reports.length;
  const averageAccuracy =
    totalReports > 0
      ? reports.reduce((sum, report) => sum + report.confidence, 0) /
        totalReports
      : 0;

  // Count unique patients
  const uniquePatients = new Set(
    reports.map((r) => r.patientName.toLowerCase())
  ).size;

  // Platform usage
  const platformUsage = user.platformUsageCount || 0;

  // Count by status
  const normalCount = reports.filter((r) => r.status === "normal").length;
  const abnormalCount = reports.filter((r) => r.status === "abnormal").length;
  const criticalCount = reports.filter((r) => r.status === "critical").length;

  res.json({
    stats: {
      totalReports,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      uniquePatients,
      platformUsage,
      normalCount,
      abnormalCount,
      criticalCount,
    },
  });
});

module.exports = {
  analyzeXray,
  createReport,
  getUserReports,
  getReport,
  deleteReport,
  getUserStats,
};
