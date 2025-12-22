const User = require("../models/User");
const asyncHandler = require("express-async-handler"); // keep us from using try and catch alot
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//@desc get all users
//@route get/users
//@access Private
//Admin access
const getallUsers = asyncHandler(async (req, res) => {
  // ✅ Use the user and roles from the verified token
  const username = req.user;
  const roles = req.roles;

  if (!username) {
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
  const { username, active, password, phonenumber, country, city } = req.body;
  const { id } = req.params;

  // Confirm data
  if ((!id || !username, !phonenumber, !country, !city)) {
    return res.status(400).json({ message: "All field are required" });
  }
  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  //Check for duplicate
  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  // Allow updates to the original user permission to the owned user
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  user.username = username;
  user.active = active;
  user.phonenumber = phonenumber;
  user.country = country;
  user.city = city;
  if (password) {
    //Hashpassword
    user.password = await bcrypt.hash(password, 10); //salt rounds
  }
  const updatedUser = await user.save();
  res.json({ message: `${updatedUser.username} updated ` });
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
  const username = req.user;

  if (!username) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find the user
  const user = await User.findOne({ username }).select("-password").exec();
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    profile: {
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
    },
  });
});

//@desc Update user profile
//@route PATCH /users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const username = req.user;
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

  if (!username) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // Find the user
  const user = await User.findOne({ username }).exec();
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
  const username = req.user;
  const roles = req.roles;
  const { id } = req.body;

  if (!username) {
    return res.status(400).json({ message: "User not found in token" });
  }

  // ✅ Check if the authenticated user has admin privileges
  if (!roles?.includes("admin")) {
    return res
      .status(403)
      .json({ message: "Unauthorized - Admin access only" });
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

module.exports = {
  getallUsers,
  createNewUser,
  updateuser,
  deleteUser,
  getUser,
  getUserProfile,
  updateUserProfile,
};
