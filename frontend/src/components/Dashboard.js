import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [recentRequests, setRecentRequests] = useState([
    {
      id: 1,
      type: "WFH",
      date: "Oct 15, 2023",
      status: "Approved",
    },
    {
      id: 2,
      type: "Mission",
      date: "Oct 18, 2023",
      status: "Pending",
    },
    {
      id: 3,
      type: "WFH",
      date: "Oct 10, 2023",
      status: "Rejected",
    },
    {
      id: 4,
      type: "Mission",
      date: "Oct 22, 2023",
      status: "Approved",
    },
    {
      id: 5,
      type: "WFH",
      date: "Oct 25, 2023",
      status: "Pending",
    },
  ]);

  const [weekSchedule, setWeekSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    requestType: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  // Get current week days (Sunday to Saturday)
  const getCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      week.push({
        date: day.toISOString().split("T")[0],
        dayName: day.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: day.getDate(),
        isToday: day.toDateString() === today.toDateString(),
      });
    }
    return week;
  };

  const currentWeek = getCurrentWeek();

  // Fetch WFH schedule for current week
  useEffect(() => {
    const fetchWeekSchedule = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await axiosPrivate.get(`/requests/week/${auth.user}`);
        // setWeekSchedule(response.data);

        // Sample data for demonstration
        setWeekSchedule([
          { date: currentWeek[1].date, status: "WFH" }, // Monday
          { date: currentWeek[3].date, status: "WFH" }, // Wednesday
        ]);
      } catch (error) {
        console.error("Error fetching week schedule:", error);
      }
    };

    fetchWeekSchedule();
  }, []);

  const isWFHDay = (date) => {
    return weekSchedule.some((schedule) => schedule.date === date);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleNewRequest = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      requestType: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      // await axiosPrivate.post("/requests", formData);
      console.log("Submitting request:", formData);
      handleCloseModal();
      // Refresh requests or show success message
    } catch (error) {
      console.error("Error submitting request:", error);
    }
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
      {/* Quick Actions Section */}
      <div
        style={{
          background: "#2d2d2d",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1rem",
          }}
        >
          Quick Actions
        </h2>
        <button
          onClick={handleNewRequest}
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
          <span style={{ fontSize: "1rem" }}>+</span>
          New Request
        </button>
      </div>

      {/* Current Week Schedule Section */}
      <div
        style={{
          background: "#2d2d2d",
          borderRadius: "0.75rem",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1.5rem",
          }}
        >
          My Schedule - Current Week
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.75rem",
          }}
        >
          {currentWeek.map((day, index) => {
            const isWFH = isWFHDay(day.date);
            return (
              <div
                key={index}
                style={{
                  background: day.isToday
                    ? "#3a3a3a"
                    : isWFH
                    ? "rgba(249, 115, 22, 0.1)"
                    : "#2d2d2d",
                  border: day.isToday
                    ? "2px solid #f97316"
                    : isWFH
                    ? "1px solid #f97316"
                    : "1px solid #404040",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                  }}
                >
                  {day.dayName}
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    color: day.isToday ? "#f97316" : "#ffffff",
                    marginBottom: "0.5rem",
                  }}
                >
                  {day.dayNumber}
                </div>
                {isWFH && (
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "600",
                      color: "#f97316",
                      background: "rgba(249, 115, 22, 0.2)",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <i
                      className="fas fa-home"
                      style={{ marginRight: "0.25rem" }}
                    ></i>
                    WFH
                  </div>
                )}
                {!isWFH && (
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "600",
                      color: "#6b7280",
                      marginTop: "0.5rem",
                    }}
                  >
                    Office
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests Section */}
      <div
        style={{
          background: "#2d2d2d",
          borderRadius: "0.75rem",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1.5rem",
          }}
        >
          Recent Requests
        </h2>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #404040",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    color: "#9ca3af",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                  }}
                >
                  Request Type
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    color: "#9ca3af",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    color: "#9ca3af",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr
                  key={request.id}
                  style={{
                    borderBottom: "1px solid #404040",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                    }}
                  >
                    {request.type}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                    }}
                  >
                    {request.date}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.375rem 0.75rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: `${getStatusColor(request.status)}20`,
                        color: getStatusColor(request.status),
                      }}
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
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
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              background: "#2d2d2d",
              borderRadius: "0.75rem",
              width: "90%",
              maxWidth: "600px",
              padding: "2rem",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                paddingBottom: "1rem",
                borderBottom: "1px solid #404040",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#ffffff",
                  margin: 0,
                }}
              >
                Create New Request
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: "#3a3a3a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.5rem",
                  width: "2.5rem",
                  height: "2.5rem",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#4a4a4a";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#3a3a3a";
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRequest}>
              {/* Request Type */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Request Type
                </label>
                <select
                  name="requestType"
                  value={formData.requestType}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    background: "#3a3a3a",
                    color: formData.requestType ? "#ffffff" : "#6b7280",
                    border: "1px solid #4a4a4a",
                    borderRadius: "0.5rem",
                    padding: "0.875rem 1rem",
                    fontSize: "0.875rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="WFH">Work From Home</option>
                  <option value="Mission">Mission</option>
                </select>
              </div>

              {/* Date Fields */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Start Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: "100%",
                        background: "#3a3a3a",
                        color: "#ffffff",
                        border: "1px solid #4a4a4a",
                        borderRadius: "0.5rem",
                        padding: "0.875rem 2.5rem 0.875rem 1rem",
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
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "#ffffff",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    End Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleFormChange}
                      required
                      style={{
                        width: "100%",
                        background: "#3a3a3a",
                        color: "#ffffff",
                        border: "1px solid #4a4a4a",
                        borderRadius: "0.5rem",
                        padding: "0.875rem 2.5rem 0.875rem 1rem",
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
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "2rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "#ffffff",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Add any additional information..."
                  rows="4"
                  style={{
                    width: "100%",
                    background: "#3a3a3a",
                    color: "#ffffff",
                    border: "1px solid #4a4a4a",
                    borderRadius: "0.5rem",
                    padding: "0.875rem 1rem",
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
                  justifyContent: "flex-end",
                  gap: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    background: "#3a3a3a",
                    color: "#ffffff",
                    padding: "0.875rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
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
                  type="submit"
                  style={{
                    background: "#f97316",
                    color: "#ffffff",
                    padding: "0.875rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#ea580c";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#f97316";
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
