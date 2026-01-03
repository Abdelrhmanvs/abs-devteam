const Request = require("../models/Request");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// HR Form Category Mapping
const getHRCategory = (requestType) => {
  const categoryMap = {
    WFH: "العمل من المنزل",
    VACATION: "إجازة",
    LATE_PERMISSION: "اذن تاخير",
    EARLY_LEAVE: "انصراف مبكر",
  };
  return categoryMap[requestType] || "غير محدد";
};

// Team filtering helper - defines which titles can see which team members
const getTeamMemberTitles = (userTitle) => {
  const teamMap = {
    "Frontend Lead": ["Frontend Lead", "Frontend Developer", "UI/UX"],
    "Backend Lead": ["Backend Lead", "Backend Developer", "RA"],
  };
  return teamMap[userTitle] || null;
};

//@desc Create new request
//@route POST /requests
//@access Private
const createRequest = asyncHandler(async (req, res) => {
  const {
    employeeId,
    employeeName,
    type,
    startDate,
    endDate,
    selectedDates,
    numberOfDays,
    reason,
    notes,
    status,
    source, // NEW: Distinguish between EMPLOYEE_REQUEST and ADMIN_DIRECT
  } = req.body;

  const email = req.user; // From JWT token

  // Validate required fields
  if (!type || !startDate || !endDate || !numberOfDays) {
    return res.status(400).json({
      message: "Required fields: type, startDate, endDate, numberOfDays",
    });
  }

  // Validate request type
  const validTypes = ["WFH", "VACATION", "LATE_PERMISSION", "EARLY_LEAVE"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message:
        "Invalid request type. Only WFH, VACATION, LATE_PERMISSION, or EARLY_LEAVE are allowed.",
    });
  }

  // Find the user making the request
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Determine the source of the request
  const requestSource = source || "EMPLOYEE_REQUEST";

  // If employeeId is provided (admin creating for someone else), use it
  let targetEmployeeId = user._id;
  let targetEmployeeName = user.fullName || user.username;
  let targetEmployeeCode = user.employeeCode;

  if (employeeId) {
    const targetEmployee = await User.findById(employeeId).exec();
    if (targetEmployee) {
      targetEmployeeId = targetEmployee._id;
      targetEmployeeName = targetEmployee.fullName || targetEmployee.username;
      targetEmployeeCode = targetEmployee.employeeCode;
    }
  }

  // Determine status based on source
  let requestStatus = "Pending";

  if (requestSource === "ADMIN_DIRECT") {
    // Admin direct adds are automatically approved
    requestStatus = "Approved";
  } else if (type === "WFH" && status === "Approved") {
    // Legacy behavior for WFH auto-approval
    requestStatus = "Approved";
  }

  // Create request object
  const requestData = {
    employeeId: targetEmployeeId,
    employeeName: employeeName || targetEmployeeName,
    employeeCode: targetEmployeeCode,
    type,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    selectedDates: selectedDates?.map((d) => new Date(d)) || [],
    numberOfDays,
    reason: reason || notes || "",
    notes: notes || "",
    status: requestStatus,
    source: requestSource,
  };

  // Create and save request
  const request = await Request.create(requestData);

  if (request) {
    // Populate employee details for response
    await request.populate("employeeId", "fullName email employeeCode");

    res.status(201).json({
      message: "Request created successfully",
      request: {
        id: request._id,
        employeeName: request.employeeName,
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        numberOfDays: request.numberOfDays,
        status: request.status,
        source: request.source,
        createdAt: request.createdAt,
      },
    });
  } else {
    res.status(400).json({ message: "Failed to create request" });
  }
});

//@desc Get all requests
//@route GET /requests
//@access Private (Admin)
const getAllRequests = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Fetch only EMPLOYEE_REQUEST entries (not ADMIN_DIRECT)
  // This ensures Requests page only shows employee-submitted requests
  const requests = await Request.find({ source: "EMPLOYEE_REQUEST" })
    .populate("employeeId", "fullName email employeeCode jobPosition branch")
    .sort({ createdAt: -1 })
    .lean();

  if (!requests?.length) {
    return res.status(200).json([]);
  }

  res.json(requests);
});

//@desc Get logged-in user's requests
//@route GET /requests/my
//@access Private
const getMyRequests = asyncHandler(async (req, res) => {
  const email = req.user;
  const limit = parseInt(req.query.limit) || 10;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find user
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Fetch user's requests
  const requests = await Request.find({ employeeId: user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json(requests);
});

//@desc Get current week schedule for logged-in user
//@route GET /requests/week
//@access Private
const getWeekSchedule = asyncHandler(async (req, res) => {
  const email = req.user;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find user
  const user = await User.findOne({ email }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Calculate current week (Sunday to Saturday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  // Fetch approved WFH and VACATION requests for current week
  const weekRequests = await Request.find({
    employeeId: user._id,
    type: { $in: ["WFH", "VACATION"] },
    status: "Approved",
    $or: [
      {
        // Request that overlaps with current week
        startDate: { $lte: saturday },
        endDate: { $gte: sunday },
      },
    ],
  }).lean();

  // Extract individual dates that fall within current week
  const scheduleDates = [];
  weekRequests.forEach((request) => {
    if (request.selectedDates && request.selectedDates.length > 0) {
      // Use selectedDates if available
      request.selectedDates.forEach((date) => {
        const d = new Date(date);
        if (d >= sunday && d <= saturday) {
          scheduleDates.push({
            date: d.toISOString().split("T")[0],
            status: request.type,
            type: request.type,
          });
        }
      });
    } else {
      // Generate dates from startDate to endDate
      const current = new Date(request.startDate);
      const end = new Date(request.endDate);

      while (current <= end) {
        if (current >= sunday && current <= saturday) {
          scheduleDates.push({
            date: current.toISOString().split("T")[0],
            status: request.type,
            type: request.type,
          });
        }
        current.setDate(current.getDate() + 1);
      }
    }
  });

  res.json(scheduleDates);
});

//@desc Get approved requests (for HR form)
//@route GET /requests/approved
//@access Private
const getApprovedRequests = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin/HR privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Fetch all approved requests
  const approvedRequests = await Request.find({ status: "Approved" })
    .populate(
      "employeeId",
      "fullName fullNameArabic employeeCode fingerprintCode jobPosition branch"
    )
    .sort({ startDate: -1 })
    .lean();

  // Helper function to format date in local timezone (same as weekly-wfh)
  const formatLocalDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Transform data for HR form format with proper category mapping
  const hrFormData = approvedRequests.map((request, index) => ({
    id: request._id,
    code: request.employeeCode || "",
    fingerprint: request.employeeId?.fingerprintCode || "",
    employeeName:
      request.employeeId?.fullNameArabic ||
      request.employeeId?.fullName ||
      request.employeeName ||
      "",
    jobPosition: "مهندس برمجيات",
    branch: request.employeeId?.branch || "",
    timeOffType: request.type === "WFH" ? "ماموريه" : "", // Only show "ماموريه" (Mission) for WFH
    requestType: request.type, // Include raw type for filtering
    purpose: getHRCategory(request.type), // Show العمل من المنزل or إجازة based on type
    startDate: formatLocalDate(request.startDate),
    endDate: formatLocalDate(request.endDate),
    numberOfDays: String(request.numberOfDays || ""),
  }));

  res.json(hrFormData);
});

//@desc Update request status (Approve/Reject)
//@route PATCH /requests/:id
//@access Private (Admin)
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Validate status
  if (!["Approved", "Rejected", "Pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Find and update request
  const request = await Request.findById(id).exec();
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  request.status = status;
  const updatedRequest = await request.save();

  res.json({
    message: `Request ${status.toLowerCase()} successfully`,
    request: updatedRequest,
  });
});

//@desc Delete request
//@route DELETE /requests/:id
//@access Private (Admin)
const deleteRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Find and delete request
  const request = await Request.findById(id).exec();
  if (!request) {
    return res.status(404).json({ message: "Request not found" });
  }

  await request.deleteOne();

  res.json({
    message: "Request deleted successfully",
    id: request._id,
  });
});

//@desc Get weekly WFH schedule (Sunday to Saturday)
//@desc Get weekly WFH schedule for all employees
//@route GET /requests/weekly-wfh
//@access Private (Admin and Team Leads)
const getWeeklyWFH = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find the current user to get their title
  const currentUser = await User.findOne({ email }).lean();
  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Determine if user has access and which team members they can see
  const isAdmin = roles?.includes("admin");
  const allowedTitles = getTeamMemberTitles(currentUser.title);

  if (!isAdmin && !allowedTitles) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin or Team Lead access only" });
  }

  // Calculate current week (Sunday to Saturday) in local timezone
  const today = new Date();
  // Set to start of day in local timezone to avoid timezone shifts
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Get Sunday of current week
  const sunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - dayOfWeek
  );
  sunday.setHours(0, 0, 0, 0);

  // Get Saturday of current week
  const saturday = new Date(
    sunday.getFullYear(),
    sunday.getMonth(),
    sunday.getDate() + 6
  );
  saturday.setHours(23, 59, 59, 999);

  // Build employee filter query
  let employeeFilter = { employeeCode: { $exists: true, $ne: null } };
  if (!isAdmin && allowedTitles) {
    // Team lead sees only their team
    employeeFilter.title = { $in: allowedTitles };
  }

  // Fetch team members based on filter
  const teamMembers = await User.find(employeeFilter)
    .select("_id fullName employeeCode title")
    .lean();

  const teamMemberIds = teamMembers.map((m) => m._id);

  // Fetch all approved requests for team members that overlap with current week
  const approvedRequests = await Request.find({
    status: "Approved",
    employeeId: { $in: teamMemberIds },
    startDate: { $lte: saturday },
    endDate: { $gte: sunday },
  })
    .populate("employeeId", "fullName employeeCode")
    .sort({ employeeName: 1 })
    .lean();

  // Generate array of days for current week using local dates
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(
      sunday.getFullYear(),
      sunday.getMonth(),
      sunday.getDate() + i
    );
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");
    weekDays.push({
      date: `${year}-${month}-${date}`,
      dayName: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][i],
      dayShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i],
    });
  }

  // Build employee WFH schedule
  const employeeSchedule = new Map();

  approvedRequests.forEach((request) => {
    const employeeName =
      request.employeeId?.fullName || request.employeeName || "Unknown";
    const employeeCode =
      request.employeeId?.employeeCode || request.employeeCode || "";
    const employeeKey = `${employeeName}_${employeeCode}`;

    if (!employeeSchedule.has(employeeKey)) {
      employeeSchedule.set(employeeKey, {
        employeeName,
        employeeCode,
        schedule: {},
      });
    }

    const employee = employeeSchedule.get(employeeKey);
    const requestStart = new Date(request.startDate);
    requestStart.setHours(0, 0, 0, 0);
    const requestEnd = new Date(request.endDate);
    requestEnd.setHours(0, 0, 0, 0);

    // Mark each day within the request period
    weekDays.forEach((weekDay) => {
      const currentDay = new Date(weekDay.date);
      currentDay.setHours(0, 0, 0, 0);
      if (currentDay >= requestStart && currentDay <= requestEnd) {
        employee.schedule[weekDay.date] = {
          isWFH: true,
          type: request.type,
          purpose: request.notes || request.reason || "Work From Home",
          requestId: request._id,
        };
      }
    });
  });

  // Convert Map to array
  const scheduleArray = Array.from(employeeSchedule.values()).map((emp) => ({
    employeeName: emp.employeeName,
    employeeCode: emp.employeeCode,
    weekSchedule: weekDays.map((day) => ({
      date: day.date,
      dayName: day.dayName,
      dayShort: day.dayShort,
      isWFH: emp.schedule[day.date]?.isWFH || false,
      type: emp.schedule[day.date]?.type || null,
      purpose: emp.schedule[day.date]?.purpose || null,
    })),
  }));

  // Format dates for response using local timezone
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  res.json({
    weekRange: {
      start: formatLocalDate(sunday),
      end: formatLocalDate(saturday),
    },
    weekDays,
    employees: scheduleArray,
  });
});

//@desc Delete all approved requests
//@route DELETE /requests/all
//@access Private (Admin)
const deleteAllRequests = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Delete all approved requests
  const result = await Request.deleteMany({ status: "Approved" });

  res.json({
    message: "All approved requests deleted successfully",
    deletedCount: result.deletedCount,
  });
});

//@desc Generate random WFH assignments
//@route POST /requests/random-wfh
//@access Private (Admin)
const generateRandomWFH = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;
  const { selectedEmployeeIds, numberOfDaysPerEmployee } = req.body;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Check if user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // Validate input
  if (
    !selectedEmployeeIds ||
    !Array.isArray(selectedEmployeeIds) ||
    selectedEmployeeIds.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "At least one employee must be selected" });
  }

  if (
    !numberOfDaysPerEmployee ||
    numberOfDaysPerEmployee < 1 ||
    numberOfDaysPerEmployee > 7
  ) {
    return res
      .status(400)
      .json({ message: "Number of days must be between 1 and 7" });
  }

  // Calculate current week (Sunday to Saturday) in local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();

  // Get Sunday of current week
  const sunday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - dayOfWeek
  );
  sunday.setHours(0, 0, 0, 0);

  // Get Saturday of current week
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  // Generate week days array (Sunday to Saturday)
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    weekDays.push(day);
  }

  // Generate random WFH assignments for each selected employee
  const assignments = [];
  const errors = [];

  for (const employeeId of selectedEmployeeIds) {
    try {
      // Find employee
      const employee = await User.findById(employeeId).exec();
      if (!employee) {
        errors.push(`Employee with ID ${employeeId} not found`);
        continue;
      }

      // Randomly select days for this employee (excluding Fridays - day index 5)
      const availableDayIndices = [0, 1, 2, 3, 4, 6]; // Sunday to Saturday, excluding Friday (5)
      const selectedDayIndices = [];

      // Randomly pick numberOfDaysPerEmployee unique days
      for (
        let i = 0;
        i < numberOfDaysPerEmployee && availableDayIndices.length > 0;
        i++
      ) {
        const randomIndex = Math.floor(
          Math.random() * availableDayIndices.length
        );
        const dayIndex = availableDayIndices.splice(randomIndex, 1)[0];
        selectedDayIndices.push(dayIndex);
      }

      // Sort selected days
      selectedDayIndices.sort((a, b) => a - b);

      // Create WFH request for each selected day
      for (const dayIndex of selectedDayIndices) {
        const wfhDate = weekDays[dayIndex];
        const startDate = new Date(wfhDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(wfhDate);
        endDate.setHours(0, 0, 0, 0); // Same as startDate for single-day WFH

        const request = await Request.create({
          employeeId: employee._id,
          employeeName: employee.fullName || employee.username,
          employeeCode: employee.employeeCode,
          type: "WFH",
          startDate: startDate,
          endDate: endDate,
          numberOfDays: 1,
          notes: "Random WFH assignment by admin",
          status: "Approved", // Auto-approve
          source: "ADMIN_DIRECT",
        });

        assignments.push({
          employeeId: employee._id,
          employeeName: employee.fullName || employee.username,
          employeeCode: employee.employeeCode,
          date: wfhDate.toISOString().split("T")[0],
          requestId: request._id,
        });
      }
    } catch (error) {
      console.error(`Error creating WFH for employee ${employeeId}:`, error);
      errors.push(
        `Failed to create WFH for employee ${employeeId}: ${error.message}`
      );
    }
  }

  res.json({
    message: "Random WFH assignments created successfully",
    assignments: assignments,
    totalCreated: assignments.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});

//@desc Create custom request as admin
//@route POST /requests/admin
//@access Private (Admin)
const createAdminRequest = asyncHandler(async (req, res) => {
  const { employeeId, type, startDate, endDate, numberOfDays } = req.body;

  // Validate required fields
  if (!employeeId || !type || !startDate || !endDate || !numberOfDays) {
    return res.status(400).json({
      message:
        "Required fields: employeeId, type, startDate, endDate, numberOfDays",
    });
  }

  // Find the target employee
  const targetEmployee = await User.findById(employeeId).exec();
  if (!targetEmployee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Create request object with approved status
  const requestData = {
    employeeId: targetEmployee._id,
    employeeName:
      targetEmployee.fullNameArabic ||
      targetEmployee.fullName ||
      targetEmployee.username,
    employeeCode: targetEmployee.employeeCode,
    type,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    selectedDates: [],
    numberOfDays,
    reason: "Admin created custom request",
    notes: "",
    status: "Approved", // Admin requests are auto-approved
    source: "ADMIN_DIRECT",
  };

  // Create and save request
  const request = await Request.create(requestData);

  if (request) {
    await request.populate(
      "employeeId",
      "fullName fullNameArabic email employeeCode"
    );

    res.status(201).json({
      message: "Admin request created successfully",
      request: {
        id: request._id,
        employeeName: request.employeeName,
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        numberOfDays: request.numberOfDays,
        status: request.status,
        source: request.source,
        createdAt: request.createdAt,
      },
    });
  } else {
    res.status(400).json({ message: "Failed to create request" });
  }
});

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getWeekSchedule,
  getApprovedRequests,
  updateRequestStatus,
  deleteRequest,
  deleteAllRequests,
  getWeeklyWFH,
  generateRandomWFH,
  createAdminRequest,
};
