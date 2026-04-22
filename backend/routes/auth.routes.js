import express from "express";
import {
  Signup,
  verifyEmail,
  Signin,
  forgetPassword,
  resetPassword,
  deleteUserByEmail,
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/sign-up", Signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/sign-in", Signin);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);
// Admin-only: delete any user by email (kept for backwards compatibility)
authRouter.post("/delete-user", authenticate, requireAdmin, deleteUserByEmail);

// Protected routes - require authentication
authRouter.get("/profile", authenticate, getProfile);
authRouter.put("/profile", authenticate, updateProfile);
authRouter.post("/change-password", authenticate, changePassword);

export default authRouter;