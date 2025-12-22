import React from "react";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { theme } = useTheme();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL support
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lng;
  };

  const isEnglish = i18n.language === "en";
  const isArabic = i18n.language === "ar";

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => changeLanguage("en")}
        className="transition-all duration-200"
        style={{
          color: isEnglish
            ? theme === "dark"
              ? "#60a5fa"
              : "#2563eb"
            : theme === "dark"
            ? "#64748b"
            : "#94a3b8",
          opacity: isEnglish ? 1 : 0.6,
          fontWeight: isEnglish ? 600 : 400,
        }}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span
        style={{
          color: theme === "dark" ? "#475569" : "#cbd5e1",
          userSelect: "none",
        }}
      >
        |
      </span>
      <button
        onClick={() => changeLanguage("ar")}
        className="transition-all duration-200"
        style={{
          color: isArabic
            ? theme === "dark"
              ? "#60a5fa"
              : "#2563eb"
            : theme === "dark"
            ? "#64748b"
            : "#94a3b8",
          opacity: isArabic ? 1 : 0.6,
          fontWeight: isArabic ? 600 : 400,
        }}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
