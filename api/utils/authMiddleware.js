const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// Middleware to protect routes
exports.verifyToken = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT_SECRET is configured
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured");
        return res
          .status(500)
          .json({ success: false, message: "Server configuration error" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      // Check if user exists and is active
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found or token invalid" });
      }

      if (!req.user.isActive) {
        return res
          .status(401)
          .json({ success: false, message: "User account is deactivated" });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      
      // Handle specific JWT errors
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ 
            success: false, 
            message: "Token has expired", 
            code: "TOKEN_EXPIRED" 
          });
      } else if (error.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ 
            success: false, 
            message: "Invalid token", 
            code: "INVALID_TOKEN" 
          });
      } else if (error.name === "NotBeforeError") {
        return res
          .status(401)
          .json({ 
            success: false, 
            message: "Token not yet valid", 
            code: "TOKEN_NOT_ACTIVE" 
          });
      }
      
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

// Alias for backward compatibility
exports.protect = exports.verifyToken;

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as an admin" });
  }
};

// Middleware to check if user is farmer
exports.isFarmer = (req, res, next) => {
  if (req.user && req.user.role === "farmer") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as a farmer" });
  }
};

// Middleware to check if user is consumer
exports.isConsumer = (req, res, next) => {
  if (req.user && req.user.role === "consumer") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as a consumer" });
  }
};
