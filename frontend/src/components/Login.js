import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useInput from "../hooks/useInput";
import useTheme from "../hooks/useTheme";

import axios from "../api/axios";

const LOGIN_URL = "/auth";

const Login = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/cardiac-diagnosis";

  const userRef = useRef();

  const [user, resetUser, userAttribs] = useInput("user", "");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [username, setUsername] = useState(""); // State to hold the username

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ username: user, password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log(response.data);
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      // Set authentication state
      setAuth({ user, roles, accessToken });
      setUsername(user); // Set the username in state
      console.log("Username set:", user);
      resetUser();
      setPwd("");
      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) {
        setErrMsg(t("login.errors.noServerResponse"));
      } else if (err.response?.status === 400) {
        setErrMsg(t("login.errors.missingCredentials"));
      } else if (err.response?.status === 401) {
        setErrMsg(t("login.errors.unauthorized"));
      } else {
        setErrMsg(t("login.errors.loginFailed"));
      }
    }
  };
  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: theme === "dark" ? "#0f172a" : "#f8fafc",
        color: theme === "dark" ? "#fff" : "#1e293b",
      }}
    >
      {/* Top Navigation Bar */}
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
            {/* Logo - Same as Landing */}
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

            <Link
              to="/"
              className="flex items-center gap-2 transition-colors"
              style={{ color: theme === "dark" ? "#9ca3af" : "#64748b" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color =
                  theme === "dark" ? "#fff" : "#1e293b")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  theme === "dark" ? "#9ca3af" : "#64748b")
              }
            >
              <i className="fas fa-arrow-left"></i>
              <span>{t("common.back")}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered Login Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-8 border"
            style={{
              background:
                theme === "dark"
                  ? "rgba(30, 41, 59, 0.8)"
                  : "rgba(255, 255, 255, 0.9)",
              borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
            }}
          >
            <div className="mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: theme === "dark" ? "#fff" : "#0f172a" }}
              >
                {t("login.title")}
              </h1>
              <p
                className="text-sm"
                style={{ color: theme === "dark" ? "#9ca3af" : "#64748b" }}
              >
                {t("login.subtitle")}{" "}
                <Link
                  to="/register"
                  className="font-medium"
                  style={{ color: theme === "dark" ? "#60a5fa" : "#3b82f6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      theme === "dark" ? "#93c5fd" : "#2563eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      theme === "dark" ? "#60a5fa" : "#3b82f6")
                  }
                >
                  {t("login.requestAccess")}
                </Link>
              </p>
            </div>

            {errMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                <p className="text-red-400 text-sm">{errMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("login.emailAddress")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i
                      className="fas fa-user"
                      style={{
                        color: theme === "dark" ? "#6b7280" : "#9ca3af",
                      }}
                    ></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    ref={userRef}
                    autoComplete="off"
                    {...userAttribs}
                    placeholder={t("login.emailPlaceholder")}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                      "::placeholder": {
                        color: theme === "dark" ? "#6b7280" : "#9ca3af",
                      },
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("login.password")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i
                      className="fas fa-lock"
                      style={{
                        color: theme === "dark" ? "#6b7280" : "#9ca3af",
                      }}
                    ></i>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label
                  className="flex items-center text-sm cursor-pointer"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  <input
                    type="checkbox"
                    id="persist"
                    onChange={togglePersist}
                    checked={persist}
                    className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    }}
                  />
                  <span className={i18n.language === "ar" ? "mr-2" : "ml-2"}>
                    {t("login.rememberMe")}
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                {t("login.signIn")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p
                className="text-sm"
                style={{ color: theme === "dark" ? "#9ca3af" : "#64748b" }}
              >
                {t("login.healthcareProvider")}{" "}
                <Link
                  to="/institutional-access"
                  style={{ color: theme === "dark" ? "#60a5fa" : "#3b82f6" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color =
                      theme === "dark" ? "#93c5fd" : "#2563eb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color =
                      theme === "dark" ? "#60a5fa" : "#3b82f6")
                  }
                >
                  {t("login.institutionalAccess")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
