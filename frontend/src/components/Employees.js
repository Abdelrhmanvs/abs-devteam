import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const AddEmployee = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    employeeCode: "",
    fingerprint: "",
    jobPosition: "",
    branch: "المركز الرئيسي",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const jobPositions = ["مهندس برمجيات"];

  const branches = ["المركز الرئيسي"];

  // Fetch employees list
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      const response = await axiosPrivate.get("/users/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

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
    // Password is only required for new employees
    if (!editingEmployeeId && !formData.password) {
      setError("Password is required");
      return false;
    }
    // If password is provided, validate length
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!formData.employeeCode.trim()) {
      setError("Employee Code is required");
      return false;
    }
    if (!formData.fingerprint.trim()) {
      setError("Fingerprint Code is required");
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
      // Transform frontend data to match backend API contract
      const employeeData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        employeeCode: formData.employeeCode,
        fingerprintCode: formData.fingerprint, // Map fingerprint to fingerprintCode
        jobPosition: formData.jobPosition,
        branch: formData.branch,
      };

      // Only include password if it's provided (for create or update with new password)
      if (formData.password) {
        employeeData.password = formData.password;
      }

      let response;
      if (editingEmployeeId) {
        // Update existing employee
        response = await axiosPrivate.patch(
          `/users/${editingEmployeeId}`,
          employeeData
        );
        setSuccess(response.data.message || "Employee updated successfully!");
      } else {
        // Create new employee
        if (!formData.password) {
          setError("Password is required for new employees");
          setLoading(false);
          return;
        }
        response = await axiosPrivate.post("/users/employee", employeeData);
        setSuccess(response.data.message || "Employee added successfully!");
      }

      // Refresh employees list and close modal
      await fetchEmployees();

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
          branch: "المركز الرئيسي",
        });
        setSuccess("");
        setShowModal(false);
        setEditingEmployeeId(null);
      }, 2000);
    } catch (err) {
      console.error("Error adding employee:", err);
      setError(
        err.response?.data?.message ||
          "Failed to add employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployeeId(employee._id);
    setFormData({
      fullName: employee.fullName || employee.username || "",
      email: employee.email || "",
      phoneNumber: employee.phonenumber || employee.phoneNumber || "",
      password: "", // Don't populate password
      employeeCode: employee.employeeCode || "",
      fingerprint: employee.fingerprintCode || "",
      jobPosition: employee.jobPosition || "",
      branch: employee.branch || "Maadi",
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await axiosPrivate.delete(`/users/${employeeId}`);
      // Remove the deleted employee from state
      setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingEmployeeId(null);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      employeeCode: "",
      fingerprint: "",
      jobPosition: "",
      branch: "المركز الرئيسي",
    });
    setError("");
    setSuccess("");
  };

  const handleExportCredentials = () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee to export");
      return;
    }

    // Filter employees to only selected ones
    const employeesToExport = employees.filter((emp) =>
      selectedEmployees.includes(emp._id)
    );

    // Generate credentials text content
    let credentialsText = "================================\n";
    credentialsText += "   EMPLOYEE LOGIN CREDENTIALS\n";
    credentialsText += "================================\n\n";

    employeesToExport.forEach((employee, index) => {
      credentialsText += `${index + 1}. ${
        employee.fullName || employee.username || "N/A"
      }\n`;
      credentialsText += `   Email: ${employee.email || "N/A"}\n`;
      credentialsText += `   Password: ${
        employee.decryptedPassword || "Not Set"
      }\n`;
      credentialsText += `\n-----------------------------------\n\n`;
    });

    // Create blob and download
    const blob = new Blob([credentialsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Employee_Credentials_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close modal and reset selections
    setShowExportModal(false);
    setSelectedEmployees([]);
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      // Deselect all
      setSelectedEmployees([]);
    } else {
      // Select all
      setSelectedEmployees(employees.map((emp) => emp._id));
    }
  };

  const handleToggleEmployee = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
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
      {/* Employees List Section */}
      <div
        style={{
          background: "#2d2d2d",
          borderRadius: "0.75rem",
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: "0.5rem",
              }}
            >
              Employees
            </h1>
            <p
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
              }}
            >
              Manage all employees
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => {
                if (employees.length === 0) {
                  alert("No employees available");
                  return;
                }
                setShowExportModal(true);
              }}
              style={{
                background: "#10b981",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#059669";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#10b981";
              }}
            >
              <i className="fas fa-download"></i>
              Export Credentials
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "#f97316",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                fontSize: "0.875rem",
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
              Add New Employee
            </button>
          </div>
        </div>

        {/* Employees Table */}
        <div
          style={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "600px",
          }}
        >
          {employeesLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#9ca3af",
              }}
            >
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#9ca3af",
              }}
            >
              No employees found
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #404040" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Full Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Employee Code
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Phone Number
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Job Position
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Branch
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      color: "#9ca3af",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr
                    key={employee._id}
                    style={{ borderBottom: "1px solid #404040" }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.fullName || employee.username || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.employeeCode || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.email || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.phonenumber || employee.phoneNumber || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.jobPosition || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        color: "#ffffff",
                        fontSize: "0.875rem",
                      }}
                    >
                      {employee.branch || "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(employee)}
                          style={{
                            background: "#3b82f6",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#2563eb";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#3b82f6";
                          }}
                        >
                          <i className="fas fa-edit"></i>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          style={{
                            background: "#ef4444",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "0.375rem",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "#ef4444";
                          }}
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCancel();
            }
          }}
        >
          <div
            style={{
              background: "#2d2d2d",
              borderRadius: "0.75rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                {editingEmployeeId ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button
                onClick={handleCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

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
                  Password{" "}
                  {editingEmployeeId ? "(Leave blank to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={
                    editingEmployeeId
                      ? "Enter new password (optional)"
                      : "Enter password (min. 6 characters)"
                  }
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
                  {loading
                    ? editingEmployeeId
                      ? "Updating..."
                      : "Adding..."
                    : editingEmployeeId
                    ? "Update Employee"
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Credentials Modal */}
      {showExportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExportModal(false);
              setSelectedEmployees([]);
            }
          }}
        >
          <div
            style={{
              background: "#2d2d2d",
              borderRadius: "0.75rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#ffffff",
                }}
              >
                Select Employees to Export
              </h2>
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setSelectedEmployees([]);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#9ca3af";
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Select All Button */}
            <div
              style={{
                marginBottom: "1rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #404040",
              }}
            >
              <button
                onClick={handleSelectAll}
                style={{
                  background: "#3b82f6",
                  color: "#ffffff",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#3b82f6";
                }}
              >
                {selectedEmployees.length === employees.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <span
                style={{
                  marginLeft: "1rem",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                }}
              >
                {selectedEmployees.length} of {employees.length} selected
              </span>
            </div>

            {/* Employee List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                marginBottom: "1.5rem",
              }}
            >
              {employees.map((employee) => (
                <div
                  key={employee._id}
                  style={{
                    padding: "0.75rem",
                    marginBottom: "0.5rem",
                    background: "#3a3a3a",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onClick={() => handleToggleEmployee(employee._id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4a4a4a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#3a3a3a";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee._id)}
                    onChange={() => handleToggleEmployee(employee._id)}
                    style={{
                      width: "18px",
                      height: "18px",
                      marginRight: "1rem",
                      cursor: "pointer",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                      }}
                    >
                      {employee.fullName || employee.username || "N/A"}
                    </div>
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: "0.75rem",
                        marginTop: "0.25rem",
                      }}
                    >
                      {employee.email || "N/A"} •{" "}
                      {employee.employeeCode || "N/A"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setSelectedEmployees([]);
                }}
                style={{
                  background: "#3a3a3a",
                  color: "#ffffff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #4a4a4a",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#4a4a4a";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#3a3a3a";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExportCredentials}
                disabled={selectedEmployees.length === 0}
                style={{
                  background:
                    selectedEmployees.length === 0 ? "#9ca3af" : "#10b981",
                  color: "#ffffff",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor:
                    selectedEmployees.length === 0 ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  if (selectedEmployees.length > 0) {
                    e.target.style.background = "#059669";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedEmployees.length > 0) {
                    e.target.style.background = "#10b981";
                  }
                }}
              >
                <i className="fas fa-download"></i>
                Export Selected ({selectedEmployees.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
