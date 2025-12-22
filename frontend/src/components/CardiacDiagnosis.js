import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useState, useEffect } from "react";
import { getRandomAnalysisResult } from "../utils/data";
import "./App.css";

const CardiacDiagnosis = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [scanType, setScanType] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [previousScans, setPreviousScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loadingScans, setLoadingScans] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // Fetch previous scans on component mount
  useEffect(() => {
    const fetchPreviousScans = async () => {
      try {
        setLoadingScans(true);
        const response = await axiosPrivate.get("/reports");

        if (response?.data?.reports) {
          // Format reports for display - take last 3
          const formattedScans = response.data.reports
            .slice(0, 3)
            .map((report) => ({
              date: new Date(report.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              diagnosis: report.diagnosis,
              confidence: `${report.confidence}%`,
              scanType: getScanTypeLabel(report.scanType),
              patientName: report.patientName,
            }));
          setPreviousScans(formattedScans);
        }
      } catch (error) {
        console.error("Error fetching previous scans:", error);
        setPreviousScans([]);
      } finally {
        setLoadingScans(false);
      }
    };

    fetchPreviousScans();
  }, [axiosPrivate]);

  const getScanTypeLabel = (type) => {
    const labels = {
      xray: "X-Ray",
      ct: "CT Scan",
      mri: "MRI",
      ecg: "Echocardiogram",
    };
    return labels[type] || type;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/tiff",
      "application/dicom",
    ];
    const fileExt = file.name.split(".").pop().toLowerCase();
    const validExts = ["png", "jpg", "jpeg", "tiff", "tif", "dcm", "dicom"];

    if (!validTypes.includes(file.type) && !validExts.includes(fileExt)) {
      setErrorMessage(
        "Invalid file type. Please upload a valid cardiac scan image (PNG, JPEG, TIFF, or DICOM format)."
      );
      setShowErrorModal(true);
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      setErrorMessage("Please upload a cardiac scan image before analyzing.");
      setShowErrorModal(true);
      return;
    }

    if (!patientName || !age || !gender || !scanType) {
      setErrorMessage(
        "Please fill in all required patient information fields (Name, Age, Gender, and Scan Type)."
      );
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      // Simulate AI analysis with dummy data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get random AI result
      const aiResult = getRandomAnalysisResult();

      // Save the report to backend
      const reportData = {
        patientName,
        age: parseInt(age),
        gender,
        scanType,
        clinicalNotes,
        diagnosis: aiResult.diagnosis,
        confidence: aiResult.confidence,
        status: aiResult.status,
        riskLevel: aiResult.riskLevel,
        details: aiResult.details,
        recommendations: aiResult.recommendations,
        imageUrl: imagePreview || "",
      };

      const response = await axiosPrivate.post("/reports", reportData);

      if (response?.data) {
        // Show the result in modal
        setDiagnosisResult(aiResult);
        setShowResultModal(true);

        // Refresh previous scans
        const scansResponse = await axiosPrivate.get("/reports");
        if (scansResponse?.data?.reports) {
          const formattedScans = scansResponse.data.reports
            .slice(0, 3)
            .map((report) => ({
              date: new Date(report.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              diagnosis: report.diagnosis,
              confidence: `${report.confidence}%`,
              scanType: getScanTypeLabel(report.scanType),
              patientName: report.patientName,
            }));
          setPreviousScans(formattedScans);
        }
      }
    } catch (error) {
      console.error("Error during diagnosis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: theme === "dark" ? "#0f172a" : "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
          >
            {t("cardiacDiagnosis.title")}
          </h1>
          <p
            className="text-lg"
            style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
          >
            {t("cardiacDiagnosis.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Upload Medical Image & Image Preview - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Medical Image */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  <i className="fas fa-cloud-upload-alt text-white"></i>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t("cardiacDiagnosis.uploadSection.title")}
                </h2>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-xl p-12 text-center transition-all"
                style={{
                  borderColor: dragActive
                    ? "#3b82f6"
                    : theme === "dark"
                    ? "#3b82f6"
                    : "#93c5fd",
                  background: dragActive
                    ? theme === "dark"
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(59, 130, 246, 0.05)"
                    : "transparent",
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <i
                      className="fas fa-file-medical text-5xl"
                      style={{ color: "#3b82f6" }}
                    ></i>
                  </div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {t("cardiacDiagnosis.uploadSection.dragDrop")}
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("cardiacDiagnosis.uploadSection.supportedFormats")}
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.dcm,.dicom"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div
                      className="px-6 py-3 rounded-lg text-white font-semibold transition-all"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      }}
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      {t("cardiacDiagnosis.uploadSection.browse")}
                    </div>
                  </label>
                  <p
                    className="text-xs mt-4"
                    style={{ color: theme === "dark" ? "#64748b" : "#94a3b8" }}
                  >
                    Max file size: 50MB
                  </p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
              >
                {t("cardiacDiagnosis.imagePreview.title")}
              </h3>
              <div
                className="rounded-xl p-12 flex items-center justify-center min-h-[300px]"
                style={{
                  background:
                    theme === "dark" ? "rgba(15, 23, 42, 0.5)" : "#f1f5f9",
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-[400px] rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <i
                      className="fas fa-image text-6xl mb-4"
                      style={{
                        color: theme === "dark" ? "#475569" : "#cbd5e1",
                      }}
                    ></i>
                    <p
                      style={{
                        color: theme === "dark" ? "#64748b" : "#94a3b8",
                      }}
                    >
                      {t("cardiacDiagnosis.imagePreview.noImage")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Information and Previous Scans Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  <i className="fas fa-user-injured text-white"></i>
                </div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t("cardiacDiagnosis.patientInfo.title")}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Patient Name */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  />
                </div>

                {/* Age */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("cardiacDiagnosis.patientInfo.age")}
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder={t(
                      "cardiacDiagnosis.patientInfo.agePlaceholder"
                    )}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("cardiacDiagnosis.patientInfo.gender")}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">
                      {t("cardiacDiagnosis.patientInfo.selectGender")}
                    </option>
                    <option value="male">
                      {t("cardiacDiagnosis.patientInfo.male")}
                    </option>
                    <option value="female">
                      {t("cardiacDiagnosis.patientInfo.female")}
                    </option>
                  </select>
                </div>

                {/* Scan Type */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("cardiacDiagnosis.patientInfo.scanType")}
                  </label>
                  <select
                    value={scanType}
                    onChange={(e) => setScanType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">
                      {t("cardiacDiagnosis.patientInfo.selectScanType")}
                    </option>
                    <option value="xray">
                      {t("cardiacDiagnosis.patientInfo.xRay")}
                    </option>
                    <option value="ct">
                      {t("cardiacDiagnosis.patientInfo.ctScan")}
                    </option>
                    <option value="mri">
                      {t("cardiacDiagnosis.patientInfo.mri")}
                    </option>
                    <option value="ecg">
                      {t("cardiacDiagnosis.patientInfo.ecg")}
                    </option>
                  </select>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("cardiacDiagnosis.patientInfo.clinicalNotes")}
                  </label>
                  <textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder={t(
                      "cardiacDiagnosis.patientInfo.clinicalNotesPlaceholder"
                    )}
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  />
                  <p
                    className="text-xs mt-2"
                    style={{ color: theme === "dark" ? "#64748b" : "#94a3b8" }}
                  >
                    Include symptoms, history, or other relevant information
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    background: loading
                      ? "#64748b"
                      : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {t("cardiacDiagnosis.uploadSection.analyzing")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain"></i>
                      {t("cardiacDiagnosis.patientInfo.analyzeButton")}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Previous Patient Scans */}
            <div
              className="rounded-2xl p-6 border"
              style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              }}
            >
              <div className="mb-6">
                <h2
                  className="text-xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t("cardiacDiagnosis.previousScans.title")}
                </h2>
              </div>

              <div className="space-y-4">
                {loadingScans ? (
                  <div className="text-center py-8">
                    <i
                      className="fas fa-spinner fa-spin text-3xl"
                      style={{ color: "#3b82f6" }}
                    ></i>
                    <p
                      className="mt-2"
                      style={{
                        color: theme === "dark" ? "#94a3b8" : "#64748b",
                      }}
                    >
                      Loading previous scans...
                    </p>
                  </div>
                ) : previousScans.length === 0 ? (
                  <div className="text-center py-8">
                    <i
                      className="fas fa-inbox text-4xl mb-3"
                      style={{
                        color: theme === "dark" ? "#475569" : "#cbd5e1",
                      }}
                    ></i>
                    <p
                      style={{
                        color: theme === "dark" ? "#94a3b8" : "#64748b",
                      }}
                    >
                      No previous scans found
                    </p>
                  </div>
                ) : (
                  previousScans.map((scan, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-4 border transition-all hover:shadow-lg cursor-pointer"
                      style={{
                        background:
                          theme === "dark"
                            ? "rgba(15, 23, 42, 0.5)"
                            : "#f8fafc",
                        borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {scan.date}
                        </p>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6",
                          }}
                        >
                          {scan.confidence}
                        </span>
                      </div>
                      <h3
                        className="font-bold mb-1"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {scan.diagnosis}
                      </h3>
                      <p
                        className="text-sm"
                        style={{
                          color: theme === "dark" ? "#64748b" : "#94a3b8",
                        }}
                      >
                        {scan.scanType} • {scan.patientName}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis Results Modal */}
          {showResultModal && diagnosisResult && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                animation: "fadeIn 0.3s ease-in-out",
              }}
              onClick={() => setShowResultModal(false)}
            >
              <div
                className="rounded-2xl p-6 border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{
                  background: theme === "dark" ? "#1e293b" : "#fff",
                  borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  animation: "scaleIn 0.3s ease-in-out",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      }}
                    >
                      <i className="fas fa-file-medical-alt text-white"></i>
                    </div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("cardiacDiagnosis.results.title")}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#f1f5f9",
                      color: theme === "dark" ? "#fff" : "#1e293b",
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div
                  className="rounded-xl p-6 mb-6"
                  style={{
                    background:
                      theme === "dark" ? "rgba(15, 23, 42, 0.5)" : "#f8fafc",
                  }}
                >
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {diagnosisResult.diagnosis}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        background:
                          diagnosisResult.riskLevel === "low"
                            ? "rgba(16, 185, 129, 0.1)"
                            : diagnosisResult.riskLevel === "moderate"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(239, 68, 68, 0.1)",
                        color:
                          diagnosisResult.riskLevel === "low"
                            ? "#10b981"
                            : diagnosisResult.riskLevel === "moderate"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {diagnosisResult.riskLevel.toUpperCase()} RISK
                    </span>
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold"
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#3b82f6",
                      }}
                    >
                      {diagnosisResult.confidence}%{" "}
                      {t("cardiacDiagnosis.results.confidence")}
                    </span>
                  </div>
                  <p
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {diagnosisResult.details}
                  </p>
                </div>

                <div
                  className="rounded-xl p-6"
                  style={{
                    background:
                      theme === "dark" ? "rgba(15, 23, 42, 0.5)" : "#f8fafc",
                  }}
                >
                  <h4
                    className="text-lg font-bold mb-4"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {t("cardiacDiagnosis.results.recommendations")}
                  </h4>
                  <ul className="space-y-3">
                    {diagnosisResult.recommendations?.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        <i className="fas fa-check-circle text-green-500 mt-1"></i>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Modal */}
          {showErrorModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
              style={{
                background: "rgba(0, 0, 0, 0.7)",
                animation: "fadeIn 0.3s ease-in-out",
              }}
              onClick={() => setShowErrorModal(false)}
            >
              <div
                className="rounded-2xl p-6 border max-w-md w-full animate-scaleIn"
                style={{
                  background: theme === "dark" ? "#1e293b" : "#fff",
                  borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  animation: "scaleIn 0.3s ease-in-out",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                    }}
                  >
                    <i
                      className="fas fa-exclamation-triangle text-2xl"
                      style={{ color: "#ef4444" }}
                    ></i>
                  </div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    Missing Information
                  </h3>
                </div>
                <p
                  className="mb-6"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {errorMessage}
                </p>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="w-full py-3 rounded-lg text-white font-semibold transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardiacDiagnosis;
