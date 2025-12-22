import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./App.css";
import { Link } from "react-router-dom";
import useTheme from "../hooks/useTheme";
import LanguageSwitcher from "./LanguageSwitcher";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: "fas fa-image",
      titleKey: "landing.features.aiImageAnalysis.title",
      descriptionKey: "landing.features.aiImageAnalysis.description",
    },
    {
      icon: "fas fa-heartbeat",
      titleKey: "landing.features.vitalSignsPrediction.title",
      descriptionKey: "landing.features.vitalSignsPrediction.description",
    },
    {
      icon: "fas fa-file-medical",
      titleKey: "landing.features.nlpClinicalNotes.title",
      descriptionKey: "landing.features.nlpClinicalNotes.description",
    },
  ];

  const steps = [
    {
      number: 1,
      icon: "fas fa-cloud-upload-alt",
      titleKey: "landing.howItWorks.steps.uploadData.title",
      descriptionKey: "landing.howItWorks.steps.uploadData.description",
    },
    {
      number: 2,
      icon: "fas fa-brain",
      titleKey: "landing.howItWorks.steps.aiAnalysis.title",
      descriptionKey: "landing.howItWorks.steps.aiAnalysis.description",
    },
    {
      number: 3,
      icon: "fas fa-chart-line",
      titleKey: "landing.howItWorks.steps.getResults.title",
      descriptionKey: "landing.howItWorks.steps.getResults.description",
    },
    {
      number: 4,
      icon: "fas fa-user-md",
      titleKey: "landing.howItWorks.steps.consultDoctor.title",
      descriptionKey: "landing.howItWorks.steps.consultDoctor.description",
    },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background: theme === "dark" ? "#0f172a" : "#f8fafc",
        color: theme === "dark" ? "#fff" : "#1e293b",
      }}
    >
      {/* Top navigation - Simplified & Modern */}
      <nav
        className="backdrop-blur-md sticky top-0 z-50"
        style={{
          background:
            theme === "dark"
              ? "rgba(15, 23, 42, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          borderBottom:
            theme === "dark"
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow:
            theme === "dark"
              ? "0 1px 3px rgba(0, 0, 0, 0.3)"
              : "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Navigation on Left */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  <i className="fas fa-heartbeat text-white text-sm"></i>
                </div>
                <span
                  className="text-base font-bold tracking-tight"
                  style={{ color: theme === "dark" ? "#fff" : "#0f172a" }}
                >
                  {t("common.appName")}
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <a
                  href="#features"
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: theme === "dark" ? "#cbd5e1" : "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color =
                      theme === "dark" ? "#fff" : "#0f172a";
                    e.target.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color =
                      theme === "dark" ? "#cbd5e1" : "#64748b";
                    e.target.style.background = "transparent";
                  }}
                >
                  {t("nav.features")}
                </a>
                <a
                  href="#how-it-works"
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{
                    color: theme === "dark" ? "#cbd5e1" : "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color =
                      theme === "dark" ? "#fff" : "#0f172a";
                    e.target.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color =
                      theme === "dark" ? "#cbd5e1" : "#64748b";
                    e.target.style.background = "transparent";
                  }}
                >
                  {t("nav.howItWorks")}
                </a>
              </div>
            </div>

            {/* Right Actions - Minimal & Organized */}
            <div className="flex items-center gap-3">
              {/* Language Switcher - Minimal */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Theme Toggle - Modern Switch Style */}
              <button
                onClick={toggleTheme}
                className="relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(148, 163, 184, 0.2)",
                  focusRing: theme === "dark" ? "#3b82f6" : "#64748b",
                }}
                aria-label="Toggle theme"
                title={
                  theme === "dark"
                    ? t("theme.switchToLight")
                    : t("theme.switchToDark")
                }
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center"
                  style={{
                    background: theme === "dark" ? "#3b82f6" : "#fff",
                    transform:
                      theme === "dark" ? "translateX(20px)" : "translateX(0)",
                    boxShadow:
                      theme === "dark"
                        ? "0 2px 4px rgba(0, 0, 0, 0.3)"
                        : "0 1px 3px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <i
                    className={theme === "dark" ? "fas fa-moon" : "fas fa-sun"}
                    style={{
                      fontSize: "10px",
                      color: theme === "dark" ? "#fff" : "#f59e0b",
                    }}
                  ></i>
                </span>
              </button>

              {/* Auth Buttons - Simplified */}
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color: theme === "dark" ? "#cbd5e1" : "#64748b",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = theme === "dark" ? "#fff" : "#0f172a";
                  e.target.style.background =
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color =
                    theme === "dark" ? "#cbd5e1" : "#64748b";
                  e.target.style.background = "transparent";
                }}
              >
                {t("common.signIn")}
              </Link>

              <Link
                to="/register"
                className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {t("common.signUp")}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{
                  color: theme === "dark" ? "#cbd5e1" : "#64748b",
                }}
                aria-label="Toggle mobile menu"
              >
                <i
                  className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"}
                ></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu - Slide Down */}
          {mobileMenuOpen && (
            <div
              className="md:hidden py-4 animate-slideDown"
              style={{
                borderTop:
                  theme === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.08)"
                    : "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="flex flex-col gap-2">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: theme === "dark" ? "#cbd5e1" : "#64748b",
                  }}
                >
                  {t("nav.features")}
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    color: theme === "dark" ? "#cbd5e1" : "#64748b",
                  }}
                >
                  {t("nav.howItWorks")}
                </a>
                <div className="flex items-center justify-between px-3 py-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme === "dark" ? "#64748b" : "#94a3b8" }}
                  >
                    {t("mobile.language")}
                  </span>
                  <LanguageSwitcher />
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-center rounded-lg transition-colors"
                  style={{
                    color: theme === "dark" ? "#cbd5e1" : "#64748b",
                    background:
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {t("common.signIn")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-white text-center rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  {t("common.signUp")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1
              className="text-4xl md:text-6xl font-extrabold leading-tight"
              style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
            >
              {t("landing.hero.title")}{" "}
              <span style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}>
                {t("landing.hero.titleHighlight")}
              </span>{" "}
              {t("landing.hero.titleEnd")}
            </h1>
            <p
              className="text-lg md:text-xl max-w-3xl mx-auto"
              style={{ color: theme === "dark" ? "#cbd5e1" : "#64748b" }}
            >
              {t("landing.hero.subtitle")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/register">
                <button
                  className="px-8 py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  {t("common.signUp")}
                </button>
              </Link>
              <Link to="/login">
                <button
                  className="px-8 py-4 rounded-lg border text-lg font-semibold transition-colors"
                  style={{
                    borderColor: theme === "dark" ? "#475569" : "#cbd5e1",
                    color: theme === "dark" ? "#fff" : "#1e293b",
                    background: theme === "dark" ? "transparent" : "#fff",
                  }}
                >
                  {t("common.signIn")}
                </button>
              </Link>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <div
                className="px-6 py-3 rounded-full flex items-center gap-2"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(34, 197, 94, 0.15)"
                      : "rgba(34, 197, 94, 0.1)",
                }}
              >
                <i
                  className="fas fa-check-circle"
                  style={{ color: theme === "dark" ? "#4ade80" : "#16a34a" }}
                ></i>
                <span
                  className="font-medium"
                  style={{ color: theme === "dark" ? "#4ade80" : "#16a34a" }}
                >
                  {t("landing.badges.fdaCleared")}
                </span>
              </div>
              <div
                className="px-6 py-3 rounded-full flex items-center gap-2"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.1)",
                }}
              >
                <i
                  className="fas fa-shield-alt"
                  style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
                ></i>
                <span
                  className="font-medium"
                  style={{ color: theme === "dark" ? "#60a5fa" : "#2563eb" }}
                >
                  {t("landing.badges.hipaaCompliant")}
                </span>
              </div>
              <div
                className="px-6 py-3 rounded-full flex items-center gap-2"
                style={{
                  background:
                    theme === "dark"
                      ? "rgba(251, 146, 60, 0.15)"
                      : "rgba(251, 146, 60, 0.1)",
                }}
              >
                <i
                  className="fas fa-clock"
                  style={{ color: theme === "dark" ? "#fb923c" : "#ea580c" }}
                ></i>
                <span
                  className="font-medium"
                  style={{ color: theme === "dark" ? "#fb923c" : "#ea580c" }}
                >
                  {t("landing.badges.resultsTime")}
                </span>
              </div>
            </div>

            {/* Heart Visualization */}
            <div className="mt-16 max-w-xl mx-auto">
              <div
                className="rounded-3xl p-12 relative overflow-hidden shadow-2xl"
                style={{
                  background:
                    theme === "dark"
                      ? "linear-gradient(180deg, rgba(226, 232, 240, 1) 0%, rgba(203, 213, 225, 1) 100%)"
                      : "linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(241, 245, 249, 1) 100%)",
                  border:
                    theme === "dark" ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Animated Heart */}
                <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
                  {/* Heart container with pulse animation */}
                  <div
                    className="absolute w-48 h-48 rounded-full flex items-center justify-center animate-pulse"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(248, 113, 113, 0.8) 0%, rgba(239, 68, 68, 0.6) 100%)",
                    }}
                  >
                    <i className="fas fa-heartbeat text-white text-6xl"></i>
                  </div>

                  {/* Orbiting dots */}
                  <div
                    className="absolute w-64 h-64 animate-spin"
                    style={{ animationDuration: "10s" }}
                  >
                    <div
                      className="absolute top-0 left-1/2 w-3 h-3 rounded-full -translate-x-1/2"
                      style={{
                        background: theme === "dark" ? "#60a5fa" : "#2563eb",
                      }}
                    ></div>
                  </div>
                  <div
                    className="absolute w-64 h-64 animate-spin"
                    style={{ animationDuration: "15s" }}
                  >
                    <div
                      className="absolute bottom-0 left-1/2 w-3 h-3 rounded-full -translate-x-1/2"
                      style={{
                        background: theme === "dark" ? "#3b82f6" : "#1d4ed8",
                      }}
                    ></div>
                  </div>
                  <div
                    className="absolute w-64 h-64 animate-spin"
                    style={{ animationDuration: "12s" }}
                  >
                    <div
                      className="absolute top-1/2 right-0 w-3 h-3 rounded-full -translate-y-1/2"
                      style={{
                        background: theme === "dark" ? "#2563eb" : "#1e40af",
                      }}
                    ></div>
                  </div>
                </div>

                {/* Diagnosis Result */}
                <div className="mt-8 text-center">
                  <div
                    className="inline-block px-8 py-4 rounded-xl shadow-lg"
                    style={{
                      background: theme === "dark" ? "#1e293b" : "#0f172a",
                    }}
                  >
                    <span className="text-white text-xl font-semibold">
                      {t("landing.diagnosis.result")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Advanced AI Diagnostic Features */}
      <section
        id="features"
        className="py-20"
        style={{ background: theme === "dark" ? "#0f172a" : "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
            >
              {t("landing.features.title")}
            </h2>
            <p
              className="text-lg max-w-3xl mx-auto"
              style={{ color: theme === "dark" ? "#cbd5e1" : "#64748b" }}
            >
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl p-8 transition-transform hover:scale-105 shadow-lg"
                style={{
                  background:
                    theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                  border:
                    theme === "dark"
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "1px solid rgba(0, 0, 0, 0.1)",
                }}
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                >
                  <i className={`${feature.icon} text-white text-2xl`}></i>
                </div>
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t(feature.titleKey)}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: theme === "dark" ? "#cbd5e1" : "#64748b" }}
                >
                  {t(feature.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20"
        style={{ background: theme === "dark" ? "#0f172a" : "#f8fafc" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
            >
              {t("landing.howItWorks.title")}
            </h2>
            <p
              className="text-lg"
              style={{ color: theme === "dark" ? "#cbd5e1" : "#64748b" }}
            >
              {t("landing.howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto relative"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                  >
                    <i className={`${step.icon} text-white text-3xl`}></i>
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        background: theme === "dark" ? "#3b82f6" : "#2563eb",
                      }}
                    >
                      {step.number}
                    </div>
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                >
                  {t(step.titleKey)}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: theme === "dark" ? "#cbd5e1" : "#64748b" }}
                >
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
