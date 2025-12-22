import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useLogout from "../hooks/useLogout";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useState, useEffect } from "react";
import "./App.css";

const Profile = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    memberSince: "",
    city: "",
    country: "",
    phonenumber: "",
    bio: "",
  });

  const [stats, setStats] = useState({
    totalReports: 0,
    averageAccuracy: 0,
    uniquePatients: 0,
    platformUsage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phonenumber: "",
    country: "",
    city: "",
    bio: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const logout = useLogout();
  const axiosPrivate = useAxiosPrivate();

  // Fetch user profile data and stats
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUserData = async () => {
      try {
        // Fetch profile
        const profileResponse = await axiosPrivate.get("/users/profile", {
          signal: controller.signal,
        });

        if (isMounted && profileResponse?.data) {
          const { profile } = profileResponse.data;
          const nameParts = (profile.name || "").split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setUserProfile({
            name: profile.name || "",
            firstName,
            lastName,
            email: profile.email || "",
            location:
              profile.location ||
              `${profile.city || ""}, ${profile.country || ""}`,
            memberSince: profile.memberSince || new Date().toISOString(),
            city: profile.city || "",
            country: profile.country || "",
            phonenumber: profile.phonenumber || "",
            bio: profile.bio || "",
          });

          setEditForm({
            firstName,
            lastName,
            email: profile.email || "",
            phonenumber: profile.phonenumber || "",
            country: profile.country || "",
            city: profile.city || "",
            bio: profile.bio || "",
          });
        }

        // Fetch stats
        const statsResponse = await axiosPrivate.get("/reports/stats", {
          signal: controller.signal,
        });

        if (isMounted && statsResponse?.data?.stats) {
          setStats({
            totalReports: statsResponse.data.stats.totalReports,
            averageAccuracy: statsResponse.data.stats.averageAccuracy,
            uniquePatients: statsResponse.data.stats.uniquePatients,
            platformUsage: statsResponse.data.stats.platformUsage,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate, auth]);

  const handleEditToggle = () => {
    if (!isEditing) {
      // Starting edit - load current values into form
      setEditForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phonenumber: userProfile.phonenumber,
        country: userProfile.country,
        city: userProfile.city,
        bio: userProfile.bio,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName || "",
        email: editForm.email || "",
        phonenumber: editForm.phonenumber,
        country: editForm.country,
        city: editForm.city,
        bio: editForm.bio,
      };

      const response = await axiosPrivate.patch("/users/profile", updateData);

      if (response?.data?.profile) {
        const { profile } = response.data;
        const nameParts = (profile.name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setUserProfile({
          name: profile.name,
          firstName,
          lastName,
          email: profile.email || editForm.email,
          location: profile.location || `${profile.city}, ${profile.country}`,
          memberSince: profile.memberSince,
          city: profile.city,
          country: profile.country,
          phonenumber: profile.phonenumber,
          bio: profile.bio || editForm.bio,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: theme === "dark" ? "#0f172a" : "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div
              className="text-lg"
              style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
            >
              {t("profile.loadingProfile")}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
              >
                {t("profile.title")}
              </h1>
              <p
                className="text-lg"
                style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}
              >
                {t("profile.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div
                  className="rounded-2xl p-8 border shadow-sm text-center"
                  style={{
                    background:
                      theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-white text-5xl font-bold mx-auto mb-6"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    }}
                  >
                    {userProfile.name
                      ? userProfile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "JD"}
                  </div>

                  {/* Name */}
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                  >
                    {t("profile.doctorTitle")}{" "}
                    {userProfile.name || "John Dawson"}
                  </h2>

                  {/* Title */}
                  <p
                    className="text-lg font-semibold mb-1"
                    style={{ color: "#3b82f6" }}
                  >
                    {t("profile.jobTitle")}
                  </p>

                  {/* Verified Badge */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold">
                      {t("profile.verifiedBadge")}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div
                    className="border-t pt-6"
                    style={{
                      borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background:
                            theme === "dark"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "#eff6ff",
                        }}
                      >
                        <div
                          className="text-3xl font-bold mb-1"
                          style={{ color: "#3b82f6" }}
                        >
                          {stats.totalReports}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {t("profile.stats.totalReports")}
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background:
                            theme === "dark"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "#eff6ff",
                        }}
                      >
                        <div
                          className="text-3xl font-bold mb-1"
                          style={{ color: "#3b82f6" }}
                        >
                          {stats.averageAccuracy}%
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {t("profile.stats.avgAccuracy")}
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background:
                            theme === "dark"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "#eff6ff",
                        }}
                      >
                        <div
                          className="text-3xl font-bold mb-1"
                          style={{ color: "#3b82f6" }}
                        >
                          {stats.uniquePatients}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {t("profile.stats.patients")}
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-xl"
                        style={{
                          background:
                            theme === "dark"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "#eff6ff",
                        }}
                      >
                        <div
                          className="text-3xl font-bold mb-1"
                          style={{ color: "#3b82f6" }}
                        >
                          {stats.platformUsage}
                        </div>
                        <div
                          className="text-sm"
                          style={{
                            color: theme === "dark" ? "#94a3b8" : "#64748b",
                          }}
                        >
                          {t("profile.stats.platformUsage")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Personal Information */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl p-8 border shadow-sm"
                  style={{
                    background:
                      theme === "dark" ? "rgba(30, 41, 59, 0.5)" : "#fff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                  }}
                >
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6"
                        style={{ color: "#3b82f6" }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <h3
                        className="text-2xl font-bold"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {t("profile.title")}
                      </h3>
                    </div>
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer"
                      style={{
                        color: "#3b82f6",
                        background: "transparent",
                        border: "none",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            isEditing
                              ? "M6 18L18 6M6 6l12 12"
                              : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          }
                        />
                      </svg>
                      <span className="font-semibold">
                        {isEditing ? t("common.cancel") : t("common.edit")}
                      </span>
                    </button>
                  </div>

                  {/* Form Fields */}
                  <form onSubmit={handleEditSubmit} className="space-y-6">
                    {/* Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.firstName")}
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={
                            isEditing
                              ? editForm.firstName
                              : userProfile.firstName || "John"
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          className="w-full px-4 py-3 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.lastName")}
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={
                            isEditing
                              ? editForm.lastName
                              : userProfile.lastName || ""
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          placeholder={
                            isEditing
                              ? `${t("profile.form.lastName")} (${t(
                                  "common.optional"
                                )})`
                              : ""
                          }
                          className="w-full px-4 py-3 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                    </div>

                    {/* Email and Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.emailAddress")}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={
                            isEditing ? editForm.email : userProfile.email || ""
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          placeholder={
                            isEditing ? t("profile.form.emailPlaceholder") : ""
                          }
                          className="w-full px-4 py-3 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.phoneNumber")}
                        </label>
                        <input
                          type="tel"
                          name="phonenumber"
                          value={
                            isEditing
                              ? editForm.phonenumber
                              : userProfile.phonenumber || "+1 (555) 123-4567"
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          className="w-full px-4 py-3 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                    </div>

                    {/* Country and Timezone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.country")}
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={
                            isEditing
                              ? editForm.country
                              : userProfile.country || "United States"
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          className="w-full py-3 px-4 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-sm font-semibold mb-2"
                          style={{
                            color: theme === "dark" ? "#fff" : "#1e293b",
                          }}
                        >
                          {t("profile.form.city")}
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={
                            isEditing
                              ? editForm.city
                              : userProfile.city || "New York"
                          }
                          onChange={handleEditChange}
                          readOnly={!isEditing}
                          placeholder={t("profile.form.cityPlaceholder")}
                          className="w-full py-3 px-4 rounded-lg border"
                          style={{
                            background:
                              theme === "dark"
                                ? "rgba(51, 65, 85, 0.3)"
                                : "#f8fafc",
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#e5e7eb",
                            color:
                              theme === "dark"
                                ? isEditing
                                  ? "#fff"
                                  : "#94a3b8"
                                : isEditing
                                ? "#1e293b"
                                : "#64748b",
                          }}
                        />
                      </div>
                    </div>

                    {/* Professional Bio */}
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: theme === "dark" ? "#fff" : "#1e293b" }}
                      >
                        {t("profile.form.professionalBio")}
                      </label>
                      <textarea
                        name="bio"
                        value={isEditing ? editForm.bio : userProfile.bio || ""}
                        onChange={handleEditChange}
                        readOnly={!isEditing}
                        placeholder={
                          isEditing ? t("profile.form.bioPlaceholder") : ""
                        }
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border resize-none"
                        style={{
                          background:
                            theme === "dark"
                              ? "rgba(51, 65, 85, 0.3)"
                              : "#f8fafc",
                          borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                          color:
                            theme === "dark"
                              ? isEditing
                                ? "#fff"
                                : "#94a3b8"
                              : isEditing
                              ? "#1e293b"
                              : "#64748b",
                        }}
                      />
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 px-6 py-3 rounded-lg text-white font-semibold transition-all"
                          style={{
                            background:
                              "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                          }}
                        >
                          {t("common.saveChanges")}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditToggle}
                          className="px-6 py-3 rounded-lg font-semibold transition-all border"
                          style={{
                            borderColor:
                              theme === "dark" ? "#4b5563" : "#d1d5db",
                            color: theme === "dark" ? "#fff" : "#1e293b",
                            background: "transparent",
                          }}
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
