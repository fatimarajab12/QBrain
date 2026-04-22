import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { ApiRequestMetric } from "../models/ApiRequestMetric.js";
import { DailyActiveUser } from "../models/DailyActiveUser.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../utils/AppError.js";

const normalizeRole = (role) => (typeof role === "string" ? role.toLowerCase().trim() : "");

const countAdmins = async () => {
  return await User.countDocuments({ role: "admin" });
};

const startOfUtcDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

export const getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProjects] = await Promise.all([
      User.countDocuments({}),
      Project.countDocuments({}),
    ]);

    // Usage metrics
    const today = startOfUtcDay(new Date());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6); // include today => 7 buckets

    const [
      totalLoginsAgg,
      requestsAllTimeAgg,
      requests7dAgg,
      activeUsers7d,
      newUsers7d,
      newProjects7d,
    ] = await Promise.all([
      User.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ["$loginCount", 0] } } } }]),
      ApiRequestMetric.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
            authenticated: { $sum: "$authenticated" },
            admin: { $sum: "$admin" },
            totalDurationMs: { $sum: { $ifNull: ["$totalDurationMs", 0] } },
            ok: { $sum: { $ifNull: ["$ok", 0] } },
            clientError: { $sum: { $ifNull: ["$clientError", 0] } },
            serverError: { $sum: { $ifNull: ["$serverError", 0] } },
          },
        },
      ]),
      ApiRequestMetric.aggregate([
        { $match: { day: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
            authenticated: { $sum: "$authenticated" },
            admin: { $sum: "$admin" },
            totalDurationMs: { $sum: { $ifNull: ["$totalDurationMs", 0] } },
            ok: { $sum: { $ifNull: ["$ok", 0] } },
            clientError: { $sum: { $ifNull: ["$clientError", 0] } },
            serverError: { $sum: { $ifNull: ["$serverError", 0] } },
          },
        },
      ]),
      DailyActiveUser.countDocuments({ day: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Project.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    const totalLogins = totalLoginsAgg?.[0]?.total || 0;
    const apiRequestsAllTime = requestsAllTimeAgg?.[0]?.total || 0;
    const apiRequestsLast7Days = requests7dAgg?.[0]?.total || 0;
    const adminRequestsLast7Days = requests7dAgg?.[0]?.admin || 0;
    const okRequestsLast7Days = requests7dAgg?.[0]?.ok || 0;
    const clientErrorRequestsLast7Days = requests7dAgg?.[0]?.clientError || 0;
    const serverErrorRequestsLast7Days = requests7dAgg?.[0]?.serverError || 0;
    const totalDurationMsLast7Days = requests7dAgg?.[0]?.totalDurationMs || 0;
    const avgLatencyMsLast7Days =
      apiRequestsLast7Days > 0 ? Math.round(totalDurationMsLast7Days / apiRequestsLast7Days) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        // Keep existing field for UI, but make it meaningful
        activeAPIUsage: `${apiRequestsLast7Days} req / 7d`,
        serverStatus: "Online",

        // New usage fields (optional for frontend)
        totalLogins,
        apiRequestsAllTime,
        apiRequestsLast7Days,
        activeUsersLast7Days: activeUsers7d,
        adminRequestsLast7Days,
        newUsersLast7Days: newUsers7d,
        newProjectsLast7Days: newProjects7d,
        avgLatencyMsLast7Days,
        okRequestsLast7Days,
        clientErrorRequestsLast7Days,
        serverErrorRequestsLast7Days,
        uptimeSeconds: Math.floor(process.uptime()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select("_id name email isVerified role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const normalized = users.map((u) => ({
      ...u,
      role: u.role || "user",
    }));

    return res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(new BadRequestError("User ID is required"));
    }

    if (req.userId?.toString() === userId.toString()) {
      return next(new ForbiddenError("You cannot delete your own account"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    const currentRole = user.role || "user";
    if (currentRole === "admin") {
      const admins = await countAdmins();
      if (admins <= 1) {
        return next(new ForbiddenError("Cannot delete the last admin"));
      }
    }

    // Delete all user's projects and their associated data
    const userProjects = await Project.find({ userId: userId });
    
    if (userProjects.length > 0) {
      const { deleteProject } = await import("../services/projectService.js");
      const logger = (await import("../utils/logger.js")).default;
      
      logger.info(`Starting deletion of ${userProjects.length} project(s) for user ${userId}...`);
      
      for (const project of userProjects) {
        try {
          await deleteProject(project._id.toString());
          logger.info(`Successfully deleted project ${project._id} for user ${userId}`);
        } catch (projectError) {
          logger.error(`Error deleting project ${project._id} for user ${userId}:`, projectError);
          // Continue with other projects even if one fails
        }
      }
      
      logger.info(`Finished deleting all projects for user ${userId}`);
    }

    // Delete the user
    await User.deleteOne({ _id: userId });

    return res.status(200).json({
      success: true,
      message: `User and ${userProjects.length} associated project(s) deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const role = normalizeRole(req.body?.role);

    if (!userId) {
      return next(new BadRequestError("User ID is required"));
    }

    if (!role || !["user", "admin"].includes(role)) {
      return next(new BadRequestError("Invalid role. Allowed roles: user, admin"));
    }

    if (req.userId?.toString() === userId.toString()) {
      return next(new ForbiddenError("You cannot change your own role"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    const currentRole = user.role || "user";
    if (currentRole === "admin" && role !== "admin") {
      const admins = await countAdmins();
      if (admins <= 1) {
        return next(new ForbiddenError("Cannot demote the last admin"));
      }
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};


