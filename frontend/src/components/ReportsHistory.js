import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import "./App.css";

const ReportsHistory = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const axiosPrivate = useAxiosPrivate();

  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scanTypeFilter, setScanTypeFilter] = useState("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState("all");

  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, scanTypeFilter, timePeriodFilter]);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get("/reports");

        if (response?.data?.reports) {
          // Format reports for display
          const formattedReports = response.data.reports.map((report) => ({
            id: report._id,
            patientName: report.patientName,
            age: report.age,
            gender:
              report.gender.charAt(0).toUpperCase() + report.gender.slice(1),
            scanType: getScanTypeLabel(report.scanType),
            diagnosis: report.diagnosis,
            status: report.status,
            riskLevel: report.riskLevel,
            confidence: report.confidence,
            details: report.details,
            recommendations: report.recommendations,
            imageUrl: report.imageUrl,
            clinicalNotes: report.clinicalNotes,
            scanDate: new Date(report.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            createdAt: new Date(report.createdAt),
          }));
          setAllReports(formattedReports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        setAllReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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

  // Apply filters
  const getFilteredReports = () => {
    let filtered = [...allReports];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Scan type filter
    if (scanTypeFilter !== "all") {
      const scanTypeMap = {
        xray: "X-Ray",
        ct: "CT Scan",
        mri: "MRI",
        echo: "Echocardiogram",
      };
      filtered = filtered.filter(
        (r) => r.scanType === scanTypeMap[scanTypeFilter]
      );
    }

    // Time period filter
    if (timePeriodFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((r) => {
        const reportDate = r.createdAt;

        switch (timePeriodFilter) {
          case "today":
            return reportDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return reportDate >= monthAgo;
          case "year":
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return reportDate >= yearAgo;
          default:
            return true;
        }
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    const paginatedReports = filtered.slice(startIndex, endIndex);

    return paginatedReports;
  };

  // Get all filtered reports without pagination for stats and total count
  const getAllFilteredReports = () => {
    let filtered = [...allReports];

    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    if (scanTypeFilter !== "all") {
      filtered = filtered.filter((report) => {
        const scanTypeLabels = {
          xray: "X-Ray",
          ct: "CT Scan",
          mri: "MRI",
          echo: "Echocardiogram",
        };
        return report.scanType === scanTypeLabels[scanTypeFilter];
      });
    }

    if (timePeriodFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((report) => {
        const reportDate = report.createdAt;
        const diffTime = Math.abs(now - reportDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (timePeriodFilter) {
          case "today":
            return diffDays <= 1;
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const allFilteredReports = getAllFilteredReports();
  const reports = getFilteredReports();
  const totalPages = Math.ceil(allFilteredReports.length / reportsPerPage);

  const stats = {
    total: allReports.length,
    normal: allReports.filter((r) => r.status === "normal").length,
    abnormal: allReports.filter((r) => r.status === "abnormal").length,
    critical: allReports.filter((r) => r.status === "critical").length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "#10b981";
      case "abnormal":
        return "#f97316";
      case "critical":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case "normal":
        return theme === "dark" ? "rgba(16, 185, 129, 0.1)" : "#d1fae5";
      case "abnormal":
        return theme === "dark" ? "rgba(249, 115, 22, 0.1)" : "#ffedd5";
      case "critical":
        return theme === "dark" ? "rgba(239, 68, 68, 0.1)" : "#fee2e2";
      default:
        return theme === "dark" ? "rgba(107, 114, 128, 0.1)" : "#f3f4f6";
    }
  };

  const getRiskLevelBgColor = (riskLevel) => {
    const level = riskLevel?.toLowerCase();
    switch (level) {
      case "low":
        return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      case "moderate":
        return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
      case "high":
        return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      default:
        return "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)";
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleExportReport = (report) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Report - ${report.patientName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #3b82f6;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #64748b;
            }
            .patient-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .patient-info h2 {
              margin-top: 0;
              color: #1e293b;
              font-size: 20px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-weight: bold;
              color: #64748b;
              font-size: 12px;
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .info-value {
              color: #1e293b;
              font-size: 16px;
            }
            .scan-image {
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .scan-image img {
              max-width: 100%;
              max-height: 400px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .diagnosis-section {
              background: #eff6ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #3b82f6;
            }
            .diagnosis-section h3 {
              margin-top: 0;
              color: #1e293b;
              font-size: 18px;
            }
            .risk-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              font-size: 14px;
              margin-right: 10px;
            }
            .risk-low {
              background: #d1fae5;
              color: #065f46;
            }
            .risk-moderate {
              background: #fed7aa;
              color: #92400e;
            }
            .risk-high {
              background: #fee2e2;
              color: #991b1b;
            }
            .confidence-badge {
              background: #dbeafe;
              color: #1e40af;
            }
            .recommendations {
              background: #f0fdf4;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              border-left: 4px solid #10b981;
            }
            .recommendations h3 {
              margin-top: 0;
              color: #1e293b;
              font-size: 18px;
            }
            .recommendations ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .recommendations li {
              margin: 8px 0;
              color: #475569;
              line-height: 1.6;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${t("reports.export.title")}</h1>
            <p>${t("reports.export.subtitle")}</p>
            <p>${t("reports.export.generatedOn")}: ${report.scanDate}</p>
          </div>

          <div class="patient-info">
            <h2>${t("reports.export.patientInfo")}</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">${t(
                  "reports.export.patientName"
                )}</span>
                <span class="info-value">${report.patientName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${t("reports.export.age")}</span>
                <span class="info-value">${report.age} ${t(
      "reports.export.years"
    )}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${t("reports.export.gender")}</span>
                <span class="info-value">${report.gender}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${t("reports.export.scanType")}</span>
                <span class="info-value">${report.scanType}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${t("reports.export.scanDate")}</span>
                <span class="info-value">${report.scanDate}</span>
              </div>
              <div class="info-item">
                <span class="info-label">${t("reports.export.reportId")}</span>
                <span class="info-value">${report.id}</span>
              </div>
            </div>
          </div>

          ${
            report.imageUrl
              ? `
            <div class="scan-image">
              <h3 style="margin-top: 0; color: #1e293b;">${t(
                "reports.export.scanImage"
              )}</h3>
              <img src="${report.imageUrl}" alt="${t(
                  "reports.export.scanImage"
                )}" />
            </div>
          `
              : ""
          }

          <div class="diagnosis-section">
            <h3>${t("reports.export.diagnosisResults")}</h3>
            <div style="margin: 15px 0;">
              <span class="risk-badge risk-${
                report.riskLevel
              }">${report.riskLevel.toUpperCase()} ${t(
      "reports.export.risk"
    )}</span>
              <span class="risk-badge confidence-badge">${
                report.confidence
              }% ${t("reports.export.confidence")}</span>
            </div>
            <h4 style="color: #1e293b; margin: 15px 0 10px 0;">${t(
              "reports.export.findings"
            )}:</h4>
            <p style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 10px 0;">
              ${report.diagnosis}
            </p>
            <p style="color: #475569; line-height: 1.6; margin-top: 10px;">
              ${report.details || "No additional details provided."}
            </p>
          </div>

          ${
            report.clinicalNotes
              ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">${t(
                "reports.export.clinicalNotes"
              )}</h3>
              <p style="color: #475569; line-height: 1.6;">
                ${report.clinicalNotes}
              </p>
            </div>
          `
              : ""
          }

          ${
            report.recommendations && report.recommendations.length > 0
              ? `
            <div class="recommendations">
              <h3>${t("reports.export.recommendations")}</h3>
              <ul>
                ${report.recommendations
                  .map((rec) => `<li>${rec}</li>`)
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p>${t("reports.export.disclaimer1")}</p>
            <p>${t("reports.export.disclaimer2")}</p>
            <p>© ${new Date().getFullYear()} ${t(
      "reports.export.copyright"
    )}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for images to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
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
            {t("reports.title")}
          </h1>
          <p
            className="text-lg"
            style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
          >
            {t("reports.subtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="rounded-2xl p-6 border"
            style={{
              background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#3b82f6" }}
              >
                <i className="fas fa-file-medical text-white text-2xl"></i>
              </div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {stats.total}
                </div>
                <div
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {t("reports.stats.totalReports")}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#10b981" }}
              >
                <i className="fas fa-heart text-white text-2xl"></i>
              </div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {stats.normal}
                </div>
                <div
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {t("reports.stats.normalFindings")}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#f97316" }}
              >
                <i className="fas fa-heartbeat text-white text-2xl"></i>
              </div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {stats.abnormal}
                </div>
                <div
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {t("reports.stats.abnormalFindings")}
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border"
            style={{
              background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "#ef4444" }}
              >
                <i className="fas fa-exclamation-triangle text-white text-2xl"></i>
              </div>
              <div>
                <div
                  className="text-3xl font-bold"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {stats.critical}
                </div>
                <div
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {t("reports.stats.criticalCases")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="rounded-2xl p-5 border mb-8"
          style={{
            background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
            borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-lg font-bold"
              style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
            >
              {t("reports.filters.title")}
            </h3>
            <button
              className="text-sm font-medium"
              style={{ color: "#3b82f6" }}
              onClick={() => {
                setStatusFilter("all");
                setScanTypeFilter("all");
                setTimePeriodFilter("all");
              }}
            >
              {t("reports.filters.clearAll")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              style={{
                background: theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#fff" : "#0f172a",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">{t("reports.filters.allStatus")}</option>
              <option value="normal">{t("reports.filters.normal")}</option>
              <option value="abnormal">{t("reports.filters.abnormal")}</option>
              <option value="critical">{t("reports.filters.critical")}</option>
            </select>

            <select
              value={scanTypeFilter}
              onChange={(e) => setScanTypeFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              style={{
                background: theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#fff" : "#0f172a",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">{t("reports.filters.allTypes")}</option>
              <option value="xray">{t("reports.filters.xRay")}</option>
              <option value="ct">{t("reports.filters.ctScan")}</option>
              <option value="mri">{t("reports.filters.mri")}</option>
              <option value="echo">
                {t("reports.filters.echocardiogram")}
              </option>
            </select>

            <select
              value={timePeriodFilter}
              onChange={(e) => setTimePeriodFilter(e.target.value)}
              className="py-2.5 pl-4 pr-10 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              style={{
                background: theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#fff" : "#0f172a",
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">{t("reports.filters.allTime")}</option>
              <option value="today">{t("reports.filters.today")}</option>
              <option value="week">{t("reports.filters.thisWeek")}</option>
              <option value="month">{t("reports.filters.thisMonth")}</option>
              <option value="year">{t("reports.filters.thisYear")}</option>
            </select>
          </div>
        </div>

        {/* Reports Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
            >
              {t("reports.viewMode.allReports")} ({reports.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === "grid" ? "font-semibold" : ""
                }`}
                style={{
                  background:
                    viewMode === "grid"
                      ? "#3b82f6"
                      : theme === "dark"
                      ? "rgba(51, 65, 85, 0.5)"
                      : "#f1f5f9",
                  color: viewMode === "grid" ? "#fff" : "#3b82f6",
                }}
              >
                <i className="fas fa-th"></i>
                {t("reports.viewMode.grid")}
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === "list" ? "font-semibold" : ""
                }`}
                style={{
                  background:
                    viewMode === "list"
                      ? "#3b82f6"
                      : theme === "dark"
                      ? "rgba(51, 65, 85, 0.5)"
                      : "#f1f5f9",
                  color: viewMode === "list" ? "#fff" : "#3b82f6",
                }}
              >
                <i className="fas fa-list"></i>
                {t("reports.viewMode.list")}
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-2xl p-6 border transition-all hover:shadow-lg"
                  style={{
                    background:
                      theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.patientName}
                      </h3>
                      <p
                        className="text-sm mb-2"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {report.id}
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {report.age} {t("common.yearsShort")} • {report.gender}{" "}
                        • {report.scanType}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                      style={{
                        background: getStatusBgColor(report.status),
                        color: getStatusColor(report.status),
                      }}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div
                    className="mb-4 pb-4 border-b"
                    style={{
                      borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <i
                        className="fas fa-stethoscope"
                        style={{ color: "#3b82f6" }}
                      ></i>
                      <h4
                        className="font-bold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.diagnosis}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {t("reports.card.scanDate")}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.scanDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {t("reports.card.riskLevel")}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm"
                        style={{
                          color: theme === "dark" ? "#94a3b8" : "#64748b",
                        }}
                      >
                        {t("reports.card.aiConfidence")}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.confidence}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background:
                          theme === "dark"
                            ? "rgba(51, 65, 85, 0.5)"
                            : "#e5e7eb",
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${report.confidence}%`,
                          background: "#10b981",
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewReport(report)}
                      className="flex-1 px-4 py-3 rounded-lg border transition-all font-medium flex items-center justify-center gap-2"
                      style={{
                        borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                        color: theme === "dark" ? "#fff" : "#1e293b",
                        background: "transparent",
                      }}
                    >
                      <i className="fas fa-eye"></i>
                      {t("common.view")}
                    </button>
                    <button
                      onClick={() => handleExportReport(report)}
                      className="flex-1 px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center gap-2 text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      }}
                    >
                      <i className="fas fa-download"></i>
                      {t("common.export")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
              }}
            >
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom:
                        theme === "dark"
                          ? "1px solid #374151"
                          : "1px solid #e5e7eb",
                      background:
                        theme === "dark" ? "rgba(15, 23, 42, 0.5)" : "#f8fafc",
                    }}
                  >
                    <th
                      className="text-left px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.patient")}
                    </th>
                    <th
                      className="text-left px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.diagnosis")}
                    </th>
                    <th
                      className="text-left px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.status")}
                    </th>
                    <th
                      className="text-left px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.confidence")}
                    </th>
                    <th
                      className="text-left px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.date")}
                    </th>
                    <th
                      className="text-right px-6 py-4 text-sm font-bold"
                      style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                    >
                      {t("reports.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr
                      key={report.id}
                      style={{
                        borderBottom:
                          index < reports.length - 1
                            ? theme === "dark"
                              ? "1px solid #374151"
                              : "1px solid #e5e7eb"
                            : "none",
                      }}
                    >
                      <td className="px-6 py-4">
                        <div
                          className="font-bold"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {report.patientName}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {report.id}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.diagnosis}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: getStatusColor(report.status),
                            }}
                          ></div>
                          <span
                            className="capitalize"
                            style={{
                              color: theme === "dark" ? "#fff" : "#1e293b",
                            }}
                          >
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 font-semibold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.confidence}%
                      </td>
                      <td
                        className="px-6 py-4"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {report.scanDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewReport(report)}
                            className="px-4 py-2 rounded-lg border transition-all font-medium"
                            style={{
                              borderColor:
                                theme === "dark" ? "#4b5563" : "#d1d5db",
                              color: theme === "dark" ? "#fff" : "#1e293b",
                              background: "transparent",
                            }}
                          >
                            {t("common.view")}
                          </button>
                          <button
                            onClick={() => handleExportReport(report)}
                            className="px-4 py-2 rounded-lg transition-all font-medium text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            }}
                          >
                            {t("common.export")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination - Show when more than 10 reports */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background:
                    theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                  borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                  color: theme === "dark" ? "#fff" : "#1e293b",
                  border: "1px solid",
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all"
                  style={{
                    background:
                      currentPage === index + 1
                        ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                        : theme === "dark"
                        ? "rgba(51, 65, 85, 0.5)"
                        : "#fff",
                    borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    color:
                      currentPage === index + 1
                        ? "#fff"
                        : theme === "dark"
                        ? "#fff"
                        : "#1e293b",
                    border: currentPage === index + 1 ? "none" : "1px solid",
                    cursor: "pointer",
                  }}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background:
                    theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                  borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                  color: theme === "dark" ? "#fff" : "#1e293b",
                  border: "1px solid",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{
            background: "rgba(0, 0, 0, 0.75)",
          }}
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            style={{
              background: theme === "dark" ? "#1e293b" : "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t("reports.modal.title")}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                >
                  {t("reports.modal.reportId")}: {selectedReport.id}
                </p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{
                  background:
                    theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#f1f5f9",
                  color: theme === "dark" ? "#fff" : "#1e293b",
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Patient Information */}
            <div
              className="rounded-xl p-6 mb-6"
              style={{
                background:
                  theme === "dark" ? "rgba(51, 65, 85, 0.3)" : "#f8fafc",
                border:
                  theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
              >
                {t("reports.modal.patientInfo")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.patientName")}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {selectedReport.patientName}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.age")}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {selectedReport.age}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.gender")}
                  </p>
                  <p
                    className="font-semibold capitalize"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {selectedReport.gender}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.scanType")}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {selectedReport.scanType}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.scanDate")}
                  </p>
                  <p
                    className="font-semibold"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {selectedReport.scanDate}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm mb-1"
                    style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
                  >
                    {t("reports.modal.status")}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: getStatusColor(selectedReport.status),
                      }}
                    ></div>
                    <span
                      className="capitalize font-semibold"
                      style={{
                        color: theme === "dark" ? "#fff" : "#1e293b",
                      }}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan Image */}
            {selectedReport.imageUrl && (
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  background:
                    theme === "dark" ? "rgba(51, 65, 85, 0.3)" : "#f8fafc",
                  border:
                    theme === "dark"
                      ? "1px solid #374151"
                      : "1px solid #e5e7eb",
                }}
              >
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t("reports.modal.scanImage")}
                </h3>
                <img
                  src={selectedReport.imageUrl}
                  alt="Cardiac Scan"
                  className="w-full rounded-lg"
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}

            {/* Diagnosis */}
            <div
              className="rounded-xl p-6 mb-6"
              style={{
                background:
                  theme === "dark" ? "rgba(51, 65, 85, 0.3)" : "#f8fafc",
                border:
                  theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
              >
                {t("reports.modal.diagnosis")}
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-2 rounded-lg font-bold text-white text-sm"
                  style={{
                    background: getRiskLevelBgColor(selectedReport.riskLevel),
                  }}
                >
                  {selectedReport.riskLevel} Risk
                </span>
                <span
                  className="px-4 py-2 rounded-lg font-bold text-sm"
                  style={{
                    background:
                      theme === "dark"
                        ? "rgba(59, 130, 246, 0.2)"
                        : "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  {selectedReport.confidence}% Confidence
                </span>
              </div>
              <p
                className="text-2xl font-bold mb-3"
                style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
              >
                {selectedReport.diagnosis}
              </p>
              {selectedReport.details && (
                <p
                  className="text-base leading-relaxed"
                  style={{ color: theme === "dark" ? "#cbd5e1" : "#475569" }}
                >
                  {selectedReport.details}
                </p>
              )}
            </div>

            {/* Clinical Notes */}
            {selectedReport.clinicalNotes && (
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(234, 179, 8, 0.1)"
                      : "rgba(254, 243, 199, 0.5)",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(234, 179, 8, 0.3)"
                      : "1px solid #fde68a",
                }}
              >
                <h3
                  className="text-lg font-bold mb-3 flex items-center gap-2"
                  style={{ color: theme === "dark" ? "#fbbf24" : "#d97706" }}
                >
                  <i className="fas fa-notes-medical"></i>
                  {t("reports.modal.clinicalNotes")}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: theme === "dark" ? "#cbd5e1" : "#475569" }}
                >
                  {selectedReport.clinicalNotes}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {selectedReport.recommendations &&
              selectedReport.recommendations.length > 0 && (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background:
                      theme === "dark"
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(209, 250, 229, 0.5)",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(16, 185, 129, 0.3)"
                        : "1px solid #a7f3d0",
                  }}
                >
                  <h3
                    className="text-lg font-bold mb-4 flex items-center gap-2"
                    style={{ color: theme === "dark" ? "#34d399" : "#059669" }}
                  >
                    <i className="fas fa-clipboard-list"></i>
                    {t("reports.modal.recommendations")}
                  </h3>
                  <ul className="space-y-3">
                    {selectedReport.recommendations.map(
                      (recommendation, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <i
                            className="fas fa-check-circle mt-1"
                            style={{
                              color: theme === "dark" ? "#34d399" : "#059669",
                            }}
                          ></i>
                          <span
                            className="text-base"
                            style={{
                              color: theme === "dark" ? "#cbd5e1" : "#475569",
                            }}
                          >
                            {recommendation}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsHistory;
