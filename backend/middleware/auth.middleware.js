import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError.js";

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookie
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // If no token in header, check cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new UnauthorizedError("Authentication required. Please provide a token."));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const userId = decoded?._id || decoded?.id; // support legacy tokens during rollout
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return next(new UnauthorizedError("User not found. Token is invalid."));
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware
 * Requires authenticated user to have admin role
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (req.user.role !== "admin") {
      return next(new ForbiddenError("Admin access required"));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

