import { useRef, useState, useEffect } from "react";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useTheme from "../hooks/useTheme";

const Company_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = "/users";

const Register = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const userRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();
  const [phonenumber, setPhonenumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  // Find country code automatically
  const countries = [
    { name: "Egypt", code: "+20" },
    { name: "USA", code: "+1" },
    { name: "UK", code: "+44" },
    { name: "Saudi Arabia", code: "+966" },
    { name: "UAE", code: "+971" },
  ];
  const selectedCountry = countries.find((c) => c.name === country);
  const countryCode = selectedCountry ? selectedCountry.code : "";

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // allow only digits
    setPhonenumber(value);
  };

  const egyptGovernorates = [
    "Cairo",
    "Giza",
    "Alexandria",
    "Dakahlia",
    "Red Sea",
    "Beheira",
    "Fayoum",
    "Gharbia",
    "Ismailia",
    "Menofia",
    "Minya",
    "Qaliubiya",
    "New Valley",
    "Suez",
    "Aswan",
    "Assiut",
    "Beni Suef",
    "Port Said",
    "Damietta",
    "Sharkia",
    "South Sinai",
    "Kafr El Sheikh",
    "Matrouh",
    "Luxor",
    "Qena",
    "North Sinai",
    "Sohag",
  ];

  const [user, set_user] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // useEffect(() => {
  //     userRef.current.focus();
  // }, [])

  useEffect(() => {
    setValidName(Company_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = Company_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    // if (!v1 || !v2) {
    //     setErrMsg("Enter more powerful password");
    //     return;
    // }
    try {
      // user,password,email
      const response = await axios.post(
        REGISTER_URL,
        JSON.stringify({
          username: user,
          password: pwd,
          phonenumber: countryCode + phonenumber,
          country: country,
          city,
        }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      navigate("/login");

      // TODO: remove console.logs before deployment
      console.log(JSON.stringify(response?.data));
      //console.log(JSON.stringify(response))
      setSuccess(true);
      //clear state and controlled inputs
      set_user("");
      setPwd("");
      setMatchPwd("");
    } catch (err) {
      if (!err?.response) {
        setErrMsg(t("register.errors.noServerResponse"));
      } else if (err.response?.status === 409) {
        setErrMsg(t("register.errors.usernameTaken"));
      } else {
        setErrMsg(t("register.errors.registrationFailed"));
      }
      // errRef.current.focus();
    }
  };

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
            {/* Logo */}
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

      {/* Main Content */}
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
                {t("register.title")}
              </h1>
              <p
                className="text-sm"
                style={{ color: theme === "dark" ? "#9ca3af" : "#64748b" }}
              >
                {t("register.subtitle")} {t("register.alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
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
                  {t("common.signIn")}
                </Link>
              </p>
            </div>

            {errMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500">
                <p className="text-red-400 text-sm">{errMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="user"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("register.username")}
                </label>
                <input
                  type="text"
                  id="user"
                  placeholder={t("register.instructions.username")}
                  value={user}
                  onChange={(e) => set_user(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  style={{
                    background:
                      theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    color: theme === "dark" ? "#fff" : "#0f172a",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("register.password")}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={t("register.instructions.password")}
                  ref={userRef}
                  autoComplete="off"
                  required
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  style={{
                    background:
                      theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    color: theme === "dark" ? "#fff" : "#0f172a",
                  }}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_pwd"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("register.confirmPassword")}
                </label>
                <input
                  id="confirm_pwd"
                  type="password"
                  placeholder={t("register.instructions.confirmPassword")}
                  onChange={(e) => setMatchPwd(e.target.value)}
                  value={matchPwd}
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  style={{
                    background:
                      theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                    color: theme === "dark" ? "#fff" : "#0f172a",
                  }}
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phonenumber"
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                >
                  {t("register.phoneNumber")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    value={countryCode}
                    className="w-20 px-3 py-3 rounded-lg border text-center"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.3)" : "#f3f4f6",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    }}
                  />
                  <input
                    type="tel"
                    id="phonenumber"
                    placeholder={t("register.phoneNumber")}
                    onChange={handlePhoneChange}
                    value={phonenumber}
                    required
                    className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  />
                </div>
              </div>

              {/* Country & City in Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("register.country")}
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setCity("");
                    }}
                    required
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    style={{
                      background:
                        theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                      borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                      color: theme === "dark" ? "#fff" : "#0f172a",
                    }}
                  >
                    <option value="">{t("register.selectCountry")}</option>
                    {countries.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}
                  >
                    {t("register.city")}
                  </label>
                  {country === "Egypt" ? (
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      style={{
                        background:
                          theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                        borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                        color: theme === "dark" ? "#fff" : "#0f172a",
                      }}
                    >
                      <option value="">{t("register.selectCity")}</option>
                      {egyptGovernorates.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="city"
                      placeholder={t("register.city")}
                      onChange={(e) => setCity(e.target.value)}
                      value={city}
                      required
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      style={{
                        background:
                          theme === "dark" ? "rgba(51, 65, 85, 0.5)" : "#fff",
                        borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                        color: theme === "dark" ? "#fff" : "#0f172a",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Submit Button */}
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
                {t("register.createAccount")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
