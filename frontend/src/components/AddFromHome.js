import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const AddFromHome = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [employeeName, setEmployeeName] = useState("");
  const [dates, setDates] = useState([""]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosPrivate.get("/users");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        // Sample data for demonstration
        setEmployees([
          { id: 1, fullName: "Ahmed Mohamed", employeeCode: "EMP001" },
          { id: 2, fullName: "Sara Ali", employeeCode: "EMP002" },
          { id: 3, fullName: "Mohamed Hassan", employeeCode: "EMP003" },
          { id: 4, fullName: "Fatima Ibrahim", employeeCode: "EMP004" },
          { id: 5, fullName: "Omar Khaled", employeeCode: "EMP005" },
        ]);
      }
    };

    fetchEmployees();
  }, [axiosPrivate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current week date range (Sunday to Saturday)
  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Get Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    // Get Saturday of current week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    return {
      min: sunday.toISOString().split("T")[0],
      max: saturday.toISOString().split("T")[0],
    };
  };

  const weekRange = getCurrentWeekRange();

  const handleDateChange = (index, value) => {
    const newDates = [...dates];
    newDates[index] = value;
    setDates(newDates);
    setError("");
  };

  const handleAddDate = () => {
    setDates([...dates, ""]);
  };

  const handleRemoveDate = (index) => {
    if (dates.length > 1) {
      const newDates = dates.filter((_, i) => i !== index);
      setDates(newDates);
    }
  };

  const validateForm = () => {
    if (!employeeName.trim()) {
      setError("Employee name is required");
      return false;
    }
    if (dates.length === 0 || dates.every((date) => !date)) {
      setError("At least one date is required");
      return false;
    }
    const validDates = dates.filter((date) => date);
    if (validDates.length === 0) {
      setError("Please select at least one valid date");
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
      const validDates = dates.filter((date) => date).sort();

      const requestData = {
        employeeName: employeeName,
        type: "WFH",
        startDate: validDates[0],
        endDate: validDates[validDates.length - 1],
        selectedDates: validDates,
        numberOfDays: validDates.length,
        reason: reason || "Work From Home",
        status: "Pending",
      };

      const response = await axiosPrivate.post("/requests", requestData);

      setSuccess("Work From Home request submitted successfully!");

      // Reset form after 2 seconds
      setTimeout(() => {
        setEmployeeName("");
        setDates([""]);
        setReason("");
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit request. Please try again."
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
      {/* Add Work From Home Form Section */}
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
          Add Work From Home Request
        </h1>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "0.875rem",
            marginBottom: "2rem",
          }}
        >
          Submit a new work from home request
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
          {/* Employee Name */}
          <div style={{ marginBottom: "1.5rem" }} ref={dropdownRef}>
            <label
              htmlFor="employeeName"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Employee Name *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                id="employeeName"
                value={searchQuery || employeeName}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setEmployeeName("");
                  setShowDropdown(true);
                  setError("");
                }}
                placeholder="Search employee name or code..."
                style={{
                  width: "100%",
                  background: "#3a3a3a",
                  color: "#ffffff",
                  border: "1px solid #4a4a4a",
                  borderRadius: "0.5rem",
                  padding: "0.75rem 2.5rem 0.75rem 1rem",
                  fontSize: "0.875rem",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  setShowDropdown(true);
                  e.target.style.borderColor = "#f97316";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(249, 115, 22, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#4a4a4a";
                  e.target.style.boxShadow = "none";
                }}
              />
              <i
                className="fas fa-search"
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  pointerEvents: "none",
                  fontSize: "0.875rem",
                }}
              ></i>

              {/* Dropdown */}
              {showDropdown && filteredEmployees.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#2d2d2d",
                    border: "1px solid #4a4a4a",
                    borderRadius: "0.5rem",
                    marginTop: "0.25rem",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEmployeeName(emp.fullName);
                        setSearchQuery("");
                        setShowDropdown(false);
                        setError("");
                      }}
                      style={{
                        padding: "0.75rem 1rem",
                        cursor: "pointer",
                        borderBottom: "1px solid #3a3a3a",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#3a3a3a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        style={{
                          color: "#ffffff",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {emp.fullName}
                      </div>
                      <div
                        style={{
                          color: "#9ca3af",
                          fontSize: "0.75rem",
                          marginTop: "0.125rem",
                        }}
                      >
                        {emp.employeeCode}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showDropdown &&
                searchQuery &&
                filteredEmployees.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#2d2d2d",
                      border: "1px solid #4a4a4a",
                      borderRadius: "0.5rem",
                      marginTop: "0.25rem",
                      padding: "1rem",
                      textAlign: "center",
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      zIndex: 1000,
                    }}
                  >
                    No employees found
                  </div>
                )}
            </div>
          </div>

          {/* Dates Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "block",
                  color: "#ffffff",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Select Dates * (Current Week Only)
              </label>
              <button
                type="button"
                onClick={handleAddDate}
                style={{
                  background: "#f97316",
                  color: "#ffffff",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#ea580c";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#f97316";
                }}
              >
                <i className="fas fa-plus"></i>
                Add Date
              </button>
            </div>

            {/* Date Inputs */}
            {dates.map((date, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                  alignItems: "center",
                }}
              >
                <div style={{ position: "relative", flex: 1 }}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    min={weekRange.min}
                    max={weekRange.max}
                    style={{
                      width: "100%",
                      background: "#3a3a3a",
                      color: "#ffffff",
                      border: "1px solid #4a4a4a",
                      borderRadius: "0.5rem",
                      padding: "0.75rem 2.5rem 0.75rem 1rem",
                      fontSize: "0.875rem",
                      outline: "none",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      colorScheme: "dark",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#f97316";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(249, 115, 22, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#4a4a4a";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <i
                    className="fas fa-calendar-alt"
                    style={{
                      position: "absolute",
                      right: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                      pointerEvents: "none",
                      fontSize: "0.875rem",
                    }}
                  ></i>
                </div>
                {dates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(index)}
                    style={{
                      background: "#ef4444",
                      color: "#ffffff",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      border: "none",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#ef4444";
                    }}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Number of Days Display */}
          {dates.filter((d) => d).length > 0 && (
            <div
              style={{
                background: "rgba(249, 115, 22, 0.1)",
                border: "1px solid #f97316",
                color: "#f97316",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
                marginBottom: "1.5rem",
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              Total Days: <strong>{dates.filter((d) => d).length}</strong> day
              {dates.filter((d) => d).length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Reason (Optional) */}
          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="reason"
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Reason (Optional)
            </label>
            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for work from home"
              rows="4"
              style={{
                width: "100%",
                background: "#3a3a3a",
                color: "#ffffff",
                border: "1px solid #4a4a4a",
                borderRadius: "0.5rem",
                padding: "0.75rem 1rem",
                fontSize: "0.875rem",
                outline: "none",
                resize: "vertical",
              }}
            />
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
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFromHome;
