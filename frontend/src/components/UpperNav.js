import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import useTheme from "../hooks/useTheme";
import LanguageSwitcher from "./LanguageSwitcher";

const UpperNav = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
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
              <NavLink
                to="/cardiac-diagnosis"
                style={({ isActive }) => ({
                  color: isActive
                    ? theme === "dark"
                      ? "#fff"
                      : "#0f172a"
                    : theme === "dark"
                    ? "#cbd5e1"
                    : "#64748b",
                  background: isActive
                    ? theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)"
                    : "transparent",
                })}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.classList.contains("active");
                  if (!isActive) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#fff" : "#0f172a";
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.classList.contains("active");
                  if (!isActive) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#cbd5e1" : "#64748b";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {t("nav.cardiacDiagnosis")}
              </NavLink>

              <NavLink
                to="/reports"
                style={({ isActive }) => ({
                  color: isActive
                    ? theme === "dark"
                      ? "#fff"
                      : "#0f172a"
                    : theme === "dark"
                    ? "#cbd5e1"
                    : "#64748b",
                  background: isActive
                    ? theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)"
                    : "transparent",
                })}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                onMouseEnter={(e) => {
                  const isActive = e.currentTarget.classList.contains("active");
                  if (!isActive) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#fff" : "#0f172a";
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.classList.contains("active");
                  if (!isActive) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#cbd5e1" : "#64748b";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {t("nav.reports")}
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? "active" : ""
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive
                    ? theme === "dark"
                      ? "#fff"
                      : "#0f172a"
                    : theme === "dark"
                    ? "#cbd5e1"
                    : "#64748b",
                  background: isActive
                    ? theme === "dark"
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)"
                    : "transparent",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#fff" : "#0f172a";
                    e.currentTarget.style.background =
                      theme === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains("active")) {
                    e.currentTarget.style.color =
                      theme === "dark" ? "#cbd5e1" : "#64748b";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {t("nav.profile")}
              </NavLink>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {/* Theme Toggle */}
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

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200"
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
                e.target.style.color = theme === "dark" ? "#cbd5e1" : "#64748b";
                e.target.style.background = "transparent";
              }}
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UpperNav;
