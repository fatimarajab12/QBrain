import express from "express";
import * as bugsController from "../controllers/bugsController.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/projects/:projectId", bugsController.getProjectBugs);
router.get("/features/:featureId", bugsController.getFeatureBugs);
router.get("/projects/:projectId/stats", bugsController.getBugStats);

// Bug creation routes with file upload support
router.post(
  "/projects/:projectId/features/:featureId",
  bugsController.bugUpload.array("attachments", 10), // Allow up to 10 files
  bugsController.createBugForFeature
);
router.post(
  "/features/:featureId",
  bugsController.bugUpload.array("attachments", 10),
  bugsController.createBugForFeature
);
router.post(
  "/",
  bugsController.bugUpload.array("attachments", 10),
  bugsController.createBug
);

// Upload attachment for existing bug
router.post(
  "/:id/attachments",
  bugsController.bugUpload.single("attachment"),
  bugsController.uploadBugAttachment
);

router.get("/:id", bugsController.getBug);
router.put("/:id", bugsController.updateBug);
router.patch("/:id", bugsController.updateBug);
router.delete("/:id", bugsController.deleteBug);

export default router;

