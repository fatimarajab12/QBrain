import express from "express";
import {
  Signup,
  verifyEmail,
  Signin,
  forgetPassword,
  resetPassword,
  deleteUserByEmail,

} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/sign-up", Signup);
authRouter.get("/verify-email", verifyEmail);
authRouter.post("/sign-in", Signin);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/delete-user", deleteUserByEmail);

export default authRouter;