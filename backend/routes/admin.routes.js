import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all admin endpoints
router.use(authenticate);
router.use(requireAdmin);

router.get("/stats", adminController.getSystemStats);
router.get("/users", adminController.getUsers);
router.delete("/users/:userId", adminController.deleteUser);
router.patch("/users/:userId/role", adminController.updateUserRole);

export default router;


