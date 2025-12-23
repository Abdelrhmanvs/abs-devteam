import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    employeeCode: "",
    fingerprint: "",
    jobPosition: "",
    branch: "Maadi",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const jobPositions = ["Software Engineer"];

  const branches = ["Maadi"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError("Phone Number is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!formData.employeeCode.trim()) {
      setError("Employee Code is required");
      return false;
    }
    if (!formData.jobPosition) {
      setError("Job Position is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axiosPrivate.post("/users", formData);

      setSuccess("Employee added successfully!");

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          password: "",
          employeeCode: "",
          fingerprint: "",
          jobPosition: "",
          branch: "Maadi",
        });
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        marginLeft: "235px",
        marginTop: "65px",
        minHeight: "calc(100vh - 65px)",
        background: "#1a1a1a",
        padding: "2rem",
      }}
    >
      {/* Add Employee Form Section */}
      <div
        style={{
          background: "#2d2d2d",
          borderRadius: "0.75rem",
          padding: "2rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "bold",
            color: "#ffffff",
            marginBottom: "0.5rem",
          }}
        >
          Add New Employee
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          Fill in the employee details below
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid #22c55e",
              color: "#22c55e",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="fullName"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="phoneNumber"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min. 6 characters)"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Employee Code */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="employeeCode"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Employee Code *
            </label>
            <input
              type="text"
              id="employeeCode"
              name="employeeCode"
              value={formData.employeeCode}
              onChange={handleChange}
              placeholder="Enter employee code"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Fingerprint */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="fingerprint"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Fingerprint *
            </label>
            <input
              type="text"
              id="fingerprint"
              name="fingerprint"
              value={formData.fingerprint}
              onChange={handleChange}
              placeholder="Enter fingerprint code"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          {/* Job Position */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="jobPosition"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Job Position *
            </label>
            <select
              id="jobPosition"
              name="jobPosition"
              value={formData.jobPosition}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Select job position</option>
              {jobPositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="branch"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Branch *
            </label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                background: "#3a3a3a",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #4a4a4a",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = "#4a4a4a";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = "#3a3a3a";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#9ca3af" : "#f97316",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.background = "#ea580c";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.background = "#f97316";
              }}
            >
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
