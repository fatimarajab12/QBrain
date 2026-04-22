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
    // Validation
    if (!name || !email || !password) {
      return next(new BadRequestError("Name, email, and password are required"));
    }

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return next(new BadRequestError("Please enter a valid email address"));
    }

    // Validate name length
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return next(new BadRequestError("Name must be at least 2 characters long"));
    }
    if (trimmedName.length > 50) {
      return next(new BadRequestError("Name cannot exceed 50 characters"));
    }

    // Validate password length
    if (password.length < 6) {
      return next(new BadRequestError("Password must be at least 6 characters long"));
    }

    // Check if user already exists (using normalized email)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new BadRequestError("User already exists with this email"));
    }

    // Create new user with normalized data
    newUser = new User({ 
      name: trimmedName, 
      email: normalizedEmail, 
      password 
    });

    // Optional bootstrap: allow first admin assignment via env
    // Set INITIAL_ADMIN_EMAIL in backend .env to promote a specific email to admin on signup.
    if (
      process.env.INITIAL_ADMIN_EMAIL &&
      normalizedEmail === process.env.INITIAL_ADMIN_EMAIL.toLowerCase().trim()
    ) {
      newUser.role = "admin";
    }

    const emailVerificationToken = newUser.generateEmailVerificationToken();
    // Note: generateEmailVerificationToken already sets emailVerificationToken and emailVerificationExpires
    // Save the user to persist the token
    await newUser.save();

    await emailService.sendVerificationEmail(
      normalizedEmail,
      trimmedName,
      emailVerificationToken
    );

    const token = jwt.sign(
      { _id: newUser._id, email: newUser.email },
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
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          isVerified: newUser.isVerified,
          role: newUser.role || "user",
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
      { _id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data and token
    return res.status(200).json({
      success: true,
      message: "Signin successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || "user",
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
    const normalizedEmail =
      typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!normalizedEmail) {
      return next(new BadRequestError("Email is required"));
    }

    // Find target first to apply safety checks
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // Prevent deleting self
    if (req.userId?.toString() === user._id.toString()) {
      return next(new ForbiddenError("You cannot delete your own account"));
    }

    // Prevent deleting last admin
    const currentRole = user.role || "user";
    if (currentRole === "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1) {
        return next(new ForbiddenError("Cannot delete the last admin"));
      }
    }

    // Delete all user's projects and their associated data
    const { Project } = await import("../models/Project.js");
    const userProjects = await Project.find({ userId: user._id });
    
    if (userProjects.length > 0) {
      const { deleteProject } = await import("../services/projectService.js");
      const logger = (await import("../utils/logger.js")).default;
      
      logger.info(`Starting deletion of ${userProjects.length} project(s) for user ${user._id}...`);
      
      for (const project of userProjects) {
        try {
          await deleteProject(project._id.toString());
          logger.info(`Successfully deleted project ${project._id} for user ${user._id}`);
        } catch (projectError) {
          logger.error(`Error deleting project ${project._id} for user ${user._id}:`, projectError);
          // Continue with other projects even if one fails
        }
      }
      
      logger.info(`Finished deleting all projects for user ${user._id}`);
    }

    // Delete the user
    await User.deleteOne({ _id: user._id });

    return res.status(200).json({ 
      success: true, 
      message: `User and ${userProjects.length} associated project(s) deleted successfully` 
    });
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
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || "user",
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
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role || "user",
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

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!req.user || !req.user._id) {
      return next(new NotFoundError("User not found"));
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new BadRequestError("Current password, new password, and confirmation are required"));
    }

    if (newPassword !== confirmPassword) {
      return next(new BadRequestError("New passwords do not match"));
    }

    if (newPassword.length < 6) {
      return next(new BadRequestError("New password must be at least 6 characters long"));
    }

    // Reload user with password field (authenticate middleware excludes it)
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return next(new UnauthorizedError("Current password is incorrect"));
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return next(new BadRequestError("New password must be different from current password"));
    }

    // Set new password - the pre-save hook will hash it automatically
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    next(error);
  }
};