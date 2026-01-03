const User = require("../models/User");
const asyncHandler = require("express-async-handler"); // keep us from using try and catch alot
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendCredentialsEmail } = require("../config/mailer");
const { generateRandomPassword } = require("../utils/generatePassword");
//@desc get all users
//@route get/users
//@access Private
//Admin access
const getallUsers = asyncHandler(async (req, res) => {
  // ✅ Use the user and roles from the verified token
  const email = req.user;
  const roles = req.roles;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // ✅ Check if the authenticated user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  // ✅ Fetch all users
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(404).json({ message: "No users found" });
  }

  res.json(users);
});

//@desc Create new user
//@route Post/users
//@access Public

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, phonenumber, country, city, roles } = req.body;
  // Confirm data
  if (!username || !password || !phonenumber) {
    return res.status(400).json({ message: "all fields are required " });
  }

  //Check for duplicates
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //exec is to execute the query , Better Queery Execution
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  const hashPwd = await bcrypt.hash(password, 10); // 10 is the salting
  const userObject =
    !Array.isArray(roles) || !roles.length
      ? {
          username,
          password: hashPwd,
          phonenumber: phonenumber,
          country: country,
          city: city,
        }
      : {
          username,
          password: hashPwd,
          roles,
          phonenumber: phonenumber,
          country: country,
          city: city,
        };

  //Create and store the new user
  const user = await User.create(userObject);

  if (!user) {
    res.status(400).json({ message: `sorry , not created` });
  }
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: username,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "60m" }
  );
  const refreshToken = jwt.sign(
    { username: username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken, userObject });
});
//@desc Update a user
//@route PATCH/users
//@access Private
// only user
const updateuser = asyncHandler(async (req, res) => {
  const {
    username,
    fullName,
    fullNameArabic,
    email,
    phoneNumber,
    password,
    employeeCode,
    fingerprintCode,
    jobPosition,
    branch,
    title,
    active,
    phonenumber,
    country,
    city,
  } = req.body;
  const { id } = req.params;

  // Confirm data - require either employee fields or user fields
  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Update employee fields if provided
  if (fullName) user.fullName = fullName;
  if (fullNameArabic !== undefined) user.fullNameArabic = fullNameArabic;
  if (email) user.email = email;
  if (phoneNumber) user.phonenumber = phoneNumber;
  if (employeeCode) user.employeeCode = employeeCode;
  if (fingerprintCode) user.fingerprintCode = fingerprintCode;
  if (jobPosition) user.jobPosition = jobPosition;
  if (branch) user.branch = branch;
  if (title) user.title = title;

  // Update regular user fields if provided
  if (username) user.username = username;
  if (active !== undefined) user.active = active;
  if (phonenumber) user.phonenumber = phonenumber;
  if (country) user.country = country;
  if (city) user.city = city;

  // Update password if provided
  if (password && password.trim() !== "") {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();
  res.json({
    message: `${updatedUser.username || updatedUser.fullName} updated`,
  });
});
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the user ID from the request parameters

  // Find the user by ID and exclude the password field from the result
  const user = await User.findById(id).select("-password").exec();

  // Check if the user was found
  if (!user) {
    return res.status(404).json({ message: "User  not found" }); // Return 404 if user is not found
  }

  // Return the user data
  res.json({ user });
});

// @desc Get user profile
// @route GET /user/profile
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  const email = req.user;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find the user
  const user = await User.findOne({ email }).select("-password").exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    user: {
      name: user.username,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || `${user.city}, ${user.country}`,
      memberSince: user.createdAt,
      city: user.city,
      country: user.country,
      phonenumber: user.phonenumber,
      platformUsageCount: user.platformUsageCount || 0,
      title: user.title || "",
      fullName: user.fullName || "",
    },
  });
});

//@desc Update user profile
//@route PATCH /users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const userEmail = req.user;
  const {
    firstName,
    lastName,
    email,
    bio,
    phonenumber,
    country,
    city,
    location,
  } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find the user
  const user = await User.findOne({ email: userEmail }).exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update fields
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (email !== undefined) user.email = email;
  if (bio !== undefined) user.bio = bio;
  if (phonenumber !== undefined) user.phonenumber = phonenumber;
  if (country !== undefined) user.country = country;
  if (city !== undefined) user.city = city;
  if (location !== undefined) user.location = location;

  // Update username based on firstName and lastName
  if (firstName !== undefined) {
    if (lastName && lastName.trim() !== "") {
      user.username = `${firstName} ${lastName}`;
    } else {
      user.username = firstName;
    }
  }

  await user.save();

  res.json({
    message: "Profile updated successfully",
    profile: {
      name: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      location: user.location || `${user.city}, ${user.country}`,
      memberSince: user.createdAt,
      city: user.city,
      country: user.country,
      phonenumber: user.phonenumber,
      platformUsageCount: user.platformUsageCount || 0,
    },
  });
});
//@desc Delete a user
//@route Delete/users
//@access Private
// Admin and user
const deleteUser = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;
  // Support both URL params and body for backwards compatibility
  const id = req.params.id || req.body.id;

  if (!email) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // ✅ Check if the authenticated user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
  }

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();
  //confirming the user is find
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();
  //confirm that the result is success
  if (result) {
    return res.status(201).json({
      message: `the user ${user.username} with id ${user.id} has been deleted successfully`,
    });
  } else {
    return res.status(409).json({ message: "There is a conflict" });
  }
});

//@desc Create new employee
//@route POST /users/employee
//@access Private (Admin only)
const createEmployee = asyncHandler(async (req, res) => {
  const {
    fullName,
    fullNameArabic,
    email,
    phoneNumber,
    employeeCode,
    fingerprintCode,
    jobPosition,
    branch,
    title,
  } = req.body;

  // Validate required fields
  if (
    !fullName ||
    !fullNameArabic ||
    !email ||
    !phoneNumber ||
    !employeeCode ||
    !fingerprintCode
  ) {
    return res.status(400).json({
      message: "All fields are required",
      required: [
        "fullName",
        "fullNameArabic",
        "email",
        "phoneNumber",
        "employeeCode",
        "fingerprintCode",
      ],
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Generate random password
  const password = generateRandomPassword(12);

  // Check for duplicate email
  const duplicateEmail = await User.findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateEmail) {
    return res.status(409).json({ message: "Email already exists" });
  }

  // Check for duplicate employee code
  const duplicateEmployeeCode = await User.findOne({ employeeCode })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateEmployeeCode) {
    return res.status(409).json({ message: "Employee code already exists" });
  }

  // Check for duplicate fingerprint code
  const duplicateFingerprint = await User.findOne({ fingerprintCode })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  if (duplicateFingerprint) {
    return res.status(409).json({ message: "Fingerprint code already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create employee object
  const employeeObject = {
    username: fullName, // Using fullName as username for backward compatibility
    fullName,
    fullNameArabic: fullNameArabic || "",
    email,
    phonenumber: phoneNumber,
    password: hashedPassword,
    employeeCode,
    fingerprintCode,
    jobPosition: jobPosition || "Software Engineer",
    branch: branch || "Main Branch",
    title: title,
    roles: ["user"], // Default role
    active: true,
  };

  // Create and store the new employee
  const employee = await User.create(employeeObject);

  if (employee) {
    // Send credentials email to the new employee
    const emailResult = await sendCredentialsEmail(email, password, {
      fullName,
      employeeCode,
      jobPosition,
      branch: branch || "المركز الرئيسي",
    });

    // Log email status but don't fail the request if email fails
    if (!emailResult.success) {
      console.error("Failed to send credentials email:", emailResult.error);
    }

    res.status(201).json({
      message: "Employee created successfully",
      emailSent: emailResult.success,
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        email: employee.email,
        employeeCode: employee.employeeCode,
        fingerprintCode: employee.fingerprintCode,
        jobPosition: employee.jobPosition,
        branch: employee.branch,
      },
    });
  } else {
    res.status(400).json({ message: "Failed to create employee" });
  }
});

//@desc Get all employees (for dropdowns)
//@route GET /users/employees
//@access Private (all authenticated users)
const getAllEmployees = asyncHandler(async (req, res) => {
  const email = req.user;
  const roles = req.roles;

  // Find the current user to get their title
  const currentUser = await User.findOne({ email }).lean();
  if (!currentUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Define team filtering based on title
  const getTeamMemberTitles = (userTitle) => {
    const teamMap = {
      "Frontend Lead": ["Frontend Lead", "Frontend Developer", "UI/UX"],
      "Backend Lead": ["Backend Lead", "Backend Developer", "RA"],
    };
    return teamMap[userTitle] || null;
  };

  let query = { employeeCode: { $exists: true, $ne: null } };

  // Apply team filtering if user is a team lead (not admin)
  if (!roles?.includes("admin") && currentUser.title) {
    const allowedTitles = getTeamMemberTitles(currentUser.title);
    if (allowedTitles) {
      // User is a team lead, filter by team
      query.title = { $in: allowedTitles };
    }
    // If not a team lead and not admin, they see no employees (or could see all)
  }

  // Fetch employees based on query
  const employees = await User.find(query)
    .select(
      "fullName fullNameArabic email phonenumber employeeCode fingerprintCode jobPosition branch title"
    )
    .lean();

  res.json(employees);
});

module.exports = {
  getallUsers,
  createNewUser,
  updateuser,
  deleteUser,
  getUser,
  getUserProfile,
  updateUserProfile,
  createEmployee,
  getAllEmployees,
};
