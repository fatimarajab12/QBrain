import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import { emailService } from "../utils/emailService.js";
import { customAlphabet } from 'nanoid';
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "../utils/AppError.js";

export const Signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let newUser;

  try {
    if (!name || !email || !password) {
      return next(new BadRequestError("Name, email, and password are required"));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new BadRequestError("User already exists with this email"));
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
          isVerified: newUser.isVerified,
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
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return next(new BadRequestError("Token is missing"));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new BadRequestError("Invalid or expired token"));
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
    next(err);
  }
};

export const Signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return next(new BadRequestError("Email and password are required"));
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    // Check if email is verified
    if (!user.isVerified) {
      return next(new ForbiddenError("Please verify your email before signing in. Check your inbox for the verification link."));
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError("Invalid email or password"));
    }

    // Update login stats
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data and token
    return res.status(200).json({
      success: true,
      message: "Signin successful",
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new BadRequestError("Email is required"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    const code = customAlphabet("0123456789", 4)();

    const hashedCode = crypto.createHash("sha256").update(code).digest("hex");
    user.passwordResetToken = hashedCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const result = await emailService.sendPasswordResetCode(user.email, code, user.name);

    return res.status(200).json({
      success: true,
      emailStatus: result,
      testCode: code,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (!email || !code || !newPassword || !confirmPassword) {
    return next(new BadRequestError("All fields are required"));
  }

  if (newPassword !== confirmPassword) {
    return next(new BadRequestError("Passwords do not match"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    const codeString = code.toString().padStart(4, "0");
    const hashedCode = crypto.createHash("sha256").update(codeString).digest("hex");

    if (!user.passwordResetToken || user.passwordResetToken !== hashedCode || user.passwordResetExpires < Date.now()) {
      return next(new BadRequestError("Invalid or expired reset code"));
    }

    // Set password directly - the pre-save hook will hash it automatically
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
};
export const Logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const deleteUserByEmail = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new BadRequestError("Email is required"));
  }

  try {
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // User is attached by authenticate middleware
    const user = req.user;

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        loginCount: user.loginCount || 0,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { name, email } = req.body;

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // Update allowed fields
    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined && email !== user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return next(new BadRequestError("Email is already taken"));
      }
      user.email = email;
      user.isVerified = false; // Require re-verification if email changes
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        loginCount: user.loginCount || 0,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};