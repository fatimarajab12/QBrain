import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { emailService } from "../utils/emailService.js";
import { customAlphabet } from 'nanoid';
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  let newUser;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }

    newUser = new User({ name, email, password });

    const emailVerificationToken = newUser.generateEmailVerificationToken();
    newUser.verificationToken = emailVerificationToken;

    await newUser.save();

    await emailService.sendVerificationEmail(
      email,
      name,
      emailVerificationToken
    );

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    newUser.lastLogin = new Date();
    newUser.loginCount += 1;
    await newUser.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully! Please check your email to verify your account.",
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          isVerified: newUser.isVerified,
          isActive: newUser.isActive,
          loginCount: newUser.loginCount,
          createdAt: newUser.createdAt,
        },
        token,
        verificationToken:
          process.env.NODE_ENV === "development"
            ? emailVerificationToken
            : undefined,
      },
    });
  } catch (error) {
    if (newUser && newUser._id) {
      await User.deleteOne({ _id: newUser._id });
    }
    console.error("Signup error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during signup",
        error: error.message,
      });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is missing" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.name);

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const Signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }
  if (!user.isVerified) {
    return res
      .status(400)
      .json({ success: false, message: "Email is not verified" });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return res.status(200).json({
    success: true,
    message: "Signin successful", 
    token,
  });

};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const code = customAlphabet("1234567890", 4)();

    const result = await emailService.sendPasswordResetCode(
      user.email,
      code,
      user.name
    );

    return res.status(200).json({
      success: true,
      emailStatus: result,
      testCode: code       
    });

  } catch (err) {
    console.error("ForgetPassword test error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};
