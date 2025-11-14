import express from "express";
import {
  Signup,
  verifyEmail,
  Signin,
  forgetPassword,
 
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/sign-up", Signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/sign-in", Signin);
authRouter.post("/forget-password", forgetPassword);
// authRouter.post("/reset-password", resetPassword);
// authRouter.post("/resend-verification", resendVerification);
// authRouter.post("/logout", Logout);

export default authRouter;
