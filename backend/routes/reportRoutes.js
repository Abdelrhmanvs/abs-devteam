const express = require("express");
const router = express.Router();
const multer = require("multer");
const reportsController = require("../controllers/reports");
const verifyJwt = require("../middleware/verifyJwt");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (increased to handle large medical images)
  },
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.use(verifyJwt);

// AI Analysis endpoint with file upload
router.post(
  "/analyze",
  upload.single("xrayImage"),
  reportsController.analyzeXray
);

router
  .route("/")
  .get(reportsController.getUserReports)
  .post(reportsController.createReport);

router.route("/stats").get(reportsController.getUserStats);

router
  .route("/:id")
  .get(reportsController.getReport)
  .delete(reportsController.deleteReport);

module.exports = router;
