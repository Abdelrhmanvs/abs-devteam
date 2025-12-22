const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// @desc Login
// @route POST /auth
// @access public
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) return res.status(401).json({ message: "Unauthorized" });
  const roles = foundUser.roles;
  // confirm the roles data and the roles length
  if (!roles.length || !roles) {
    res.status(400).json({ message: "there is no roles found" });
  }

  // Update last login time
  foundUser.lastLogin = new Date();
  await foundUser.save();

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30m" }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken, roles, username });

  //do stuff
});
// @desc Refresh
// @route Get /auth/refresh
// @access Public - because access token has expires

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized - No refresh token" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Forbidden - Invalid or expired refresh token" });
      }

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();
      if (!foundUser) {
        return res
          .status(401)
          .json({ message: "Unauthorized - User not found" });
      }

      const roles = Array.isArray(foundUser.roles)
        ? foundUser.roles
        : Object.values(foundUser.roles);

      // Generate new access token
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
      );

      res.json({
        roles,
        accessToken,
        username: foundUser.username,
      });
    }
  );
});

// @desc Logout
// @route POST /auth/Logout
// @access Public - just to clear cookie if exists

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // 204 => No Content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie Cleared" });
};
module.exports = {
  login,
  refresh,
  logout,
};
// {} is for destruction
