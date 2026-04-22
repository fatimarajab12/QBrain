import { ApiRequestMetric } from "../models/ApiRequestMetric.js";
import { DailyActiveUser } from "../models/DailyActiveUser.js";
import jwt from "jsonwebtoken";

const startOfUtcDay = (date = new Date()) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

/**
 * Usage tracking middleware
 * - Counts API requests per day
 * - Tracks Daily Active Users (unique per day)
 *
 * Notes:
 * - Best-effort: never blocks requests if metrics write fails.
 */
export const trackUsage = (req, res, next) => {
  // Only count API routes
  if (!req.path?.startsWith("/api")) return next();

  const start = Date.now();
  const day = startOfUtcDay(new Date());
  const isAdminRoute = req.path.startsWith("/api/admin");

  // Capture userId best-effort:
  // - If authenticate middleware already ran, prefer req.userId/req.user
  // - Otherwise, decode JWT from Authorization header (no DB lookup)
  let userId = req.userId || req.user?._id || null;
  if (!userId) {
    try {
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded?._id || decoded?.id || null; // support legacy tokens during rollout
      }
    } catch (e) {
      userId = null;
    }
  }

  const isAuthenticated = Boolean(userId);

  res.on("finish", async () => {
    try {
      const durationMs = Date.now() - start;
      const status = Number(res.statusCode) || 0;
      const ok = status >= 200 && status < 300;
      const clientError = status >= 400 && status < 500;
      const serverError = status >= 500;

      // Increment daily counters
      await ApiRequestMetric.updateOne(
        { day },
        {
          $inc: {
            total: 1,
            authenticated: isAuthenticated ? 1 : 0,
            admin: isAdminRoute ? 1 : 0,
            totalDurationMs: durationMs,
            ok: ok ? 1 : 0,
            clientError: clientError ? 1 : 0,
            serverError: serverError ? 1 : 0,
          },
        },
        { upsert: true }
      );

      // Track DAU for authenticated users
      if (isAuthenticated) {
        await DailyActiveUser.updateOne(
          { day, userId },
          { $setOnInsert: { day, userId } },
          { upsert: true }
        );
      }
    } catch (e) {
      // swallow errors (metrics must not break product)
    }
  });

  return next();
};


