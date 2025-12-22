const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  // Check if Authorization header exists and is in the correct format
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - Missing or invalid token format" });
  }

  const token = authHeader.split(" ")[1]; // Extract token

  // Try to verify as Access Token first
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (!err && decoded?.UserInfo) {
      // ✅ Valid access token
      req.user = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      return next();
    }

    // If verification fails, try verifying as a refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err2, decoded2) => {
      if (err2) {
        return res
          .status(403)
          .json({ message: "Forbidden - Invalid or expired token" });
      }

      // ✅ Valid refresh token
      req.user = decoded2?.username || decoded2?.UserInfo?.username;
      req.roles = decoded2?.UserInfo?.roles || [];
      next();
    });
  });
};

module.exports = verifyJWT;
