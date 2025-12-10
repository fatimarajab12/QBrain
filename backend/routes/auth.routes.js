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
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/sign-up", Signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/sign-in", Signin);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/delete-user", deleteUserByEmail);

// Protected routes - require authentication
authRouter.get("/profile", authenticate, getProfile);
authRouter.put("/profile", authenticate, updateProfile);

export default authRouter;