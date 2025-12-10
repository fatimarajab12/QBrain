import mongoose from "mongoose";
import { Bug } from "../models/Bug.js";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";

function validateObjectId(id, fieldName = "ID") {
  if (!id) return null;
  
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return id;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters)`);
}

export async function createBug(bugData) {
  try {
    if (bugData.featureId) {
      bugData.featureId = validateObjectId(bugData.featureId, "Feature ID");
      
      const feature = await Feature.findById(bugData.featureId).select("projectId");
      if (!feature) {
        throw new Error("Feature not found");
      }
      
      if (!bugData.projectId) {
        bugData.projectId = feature.projectId;
      }
    }

    if (bugData.projectId) {
      bugData.projectId = validateObjectId(bugData.projectId, "Project ID");
      
      const project = await Project.findById(bugData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    if (!bugData.projectId) {
      throw new Error("Project ID is required. Provide projectId or featureId.");
    }

    if (!bugData.featureId) {
      throw new Error("Feature ID is required.");
    }

    if (!bugData.reportedBy) {
      throw new Error("Reported by (user ID) is required.");
    }

    bugData.reportedBy = validateObjectId(bugData.reportedBy, "Reported By");

    if (bugData.assignedTo) {
      bugData.assignedTo = validateObjectId(bugData.assignedTo, "Assigned To");
    }

    const bug = new Bug(bugData);
    await bug.save();

    return bug;
  } catch (error) {
    console.error("Error creating bug:", error);
    throw error;
  }
}

export async function getBugById(bugId) {
  try {
    const id = validateObjectId(bugId, "Bug ID");

    const bug = await Bug.findById(id)
      .populate("featureId", "name description")
      .populate("projectId", "name")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    if (!bug) {
      throw new Error("Bug not found");
    }

    return bug;
  } catch (error) {
    console.error("Error getting bug by ID:", error);
    throw error;
  }
}

export async function getProjectBugs(projectId, filters = {}) {
  try {
    const id = validateObjectId(projectId, "Project ID");

    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const query = { projectId: id };

    // Apply filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.featureId) {
      query.featureId = validateObjectId(filters.featureId, "Feature ID");
    }

    if (filters.assignedTo) {
      query.assignedTo = validateObjectId(filters.assignedTo, "Assigned To");
    }

    const bugs = await Bug.find(query)
      .populate("featureId", "name description")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return bugs;
  } catch (error) {
    console.error("Error getting project bugs:", error);
    throw error;
  }
}

export async function getFeatureBugs(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const feature = await Feature.findById(id).select("_id");
    if (!feature) {
      throw new Error("Feature not found");
    }

    const bugs = await Bug.find({ featureId: id })
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });

    return bugs;
  } catch (error) {
    console.error("Error getting feature bugs:", error);
    throw error;
  }
}

export async function updateBug(bugId, updateData) {
  try {
    const id = validateObjectId(bugId, "Bug ID");
    
    const existingBug = await Bug.findById(id);
    if (!existingBug) {
      throw new Error("Bug not found");
    }

    if (updateData.featureId) {
      updateData.featureId = validateObjectId(updateData.featureId, "Feature ID");
      const feature = await Feature.findById(updateData.featureId).select("_id");
      if (!feature) {
        throw new Error("Feature not found");
      }
    }

    if (updateData.projectId) {
      updateData.projectId = validateObjectId(updateData.projectId, "Project ID");
      const project = await Project.findById(updateData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    if (updateData.reportedBy) {
      updateData.reportedBy = validateObjectId(updateData.reportedBy, "Reported By");
    }

    if (updateData.assignedTo) {
      updateData.assignedTo = validateObjectId(updateData.assignedTo, "Assigned To");
    }

    // Handle status changes
    if (updateData.status) {
      const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
      if (!validStatuses.includes(updateData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      // Set resolvedAt or closedAt based on status
      if (updateData.status === "Resolved" && existingBug.status !== "Resolved") {
        updateData.resolvedAt = new Date();
      } else if (updateData.status === "Closed" && existingBug.status !== "Closed") {
        updateData.closedAt = new Date();
      }
    }

    const bug = await Bug.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("featureId", "name description")
      .populate("projectId", "name")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email");

    return bug;
  } catch (error) {
    console.error("Error updating bug:", error);
    throw error;
  }
}

export async function deleteBug(bugId) {
  try {
    const id = validateObjectId(bugId, "Bug ID");

    const bug = await Bug.findByIdAndDelete(id);
    if (!bug) {
      throw new Error("Bug not found");
    }

    return bug;
  } catch (error) {
    console.error("Error deleting bug:", error);
    throw error;
  }
}

export async function getBugStats(projectId) {
  try {
    const id = validateObjectId(projectId, "Project ID");

    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const stats = await Bug.aggregate([
      { $match: { projectId: id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          },
          closed: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          },
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", "Critical"] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ["$severity", "High"] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ["$severity", "Medium"] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ["$severity", "Low"] }, 1, 0] }
          },
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
  } catch (error) {
    console.error("Error getting bug stats:", error);
    throw error;
  }
}

