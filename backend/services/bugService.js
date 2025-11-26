import { Bug } from "../models/Bug.js";
import { Project } from "../models/Project.js";
import { Feature } from "../models/Feature.js";
import { analyzeBugWithRAG } from "../ai/ragService.js";
import { nanoid } from "nanoid";

export async function createBug(bugData) {
  try {
    const bugId = `bug_${nanoid(10)}`;
    const bug = new Bug({
      ...bugData,
      bugId,
    });

    await bug.save();
    return bug;
  } catch (error) {
    console.error("Error creating bug:", error);
    throw error;
  }
}

export async function getBugById(bugId) {
  try {
    const bug = await Bug.findOne({
      $or: [{ _id: bugId }, { bugId }],
    })
      .populate("projectId", "name projectId")
      .populate("featureId", "name featureId")
      .populate("testCaseId", "title testCaseId")
      .populate("reportedBy", "name email")
      .populate("assignedTo", "name email")
      .lean();

    return bug;
  } catch (error) {
    console.error("Error getting bug:", error);
    throw error;
  }
}

export async function getProjectBugs(projectId, filters = {}) {
  try {
    const project = await Project.findOne({
      $or: [{ _id: projectId }, { projectId }],
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const query = { projectId: project._id };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.featureId) {
      const feature = await Feature.findOne({
        $or: [{ _id: filters.featureId }, { featureId: filters.featureId }],
      });
      if (feature) {
        query.featureId = feature._id;
      }
    }

    const bugs = await Bug.find(query)
      .populate("featureId", "name featureId")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    return bugs;
  } catch (error) {
    console.error("Error getting project bugs:", error);
    throw error;
  }
}

export async function updateBug(bugId, updateData) {
  try {
    const bug = await Bug.findOneAndUpdate(
      { $or: [{ _id: bugId }, { bugId }] },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return bug;
  } catch (error) {
    console.error("Error updating bug:", error);
    throw error;
  }
}

export async function deleteBug(bugId) {
  try {
    await Bug.findOneAndDelete({
      $or: [{ _id: bugId }, { bugId }],
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting bug:", error);
    throw error;
  }
}

export async function analyzeBug(bugId) {
  try {
    const bug = await Bug.findOne({
      $or: [{ _id: bugId }, { bugId }],
    }).populate("projectId");

    if (!bug) {
      throw new Error("Bug not found");
    }

    const project = bug.projectId;
    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const bugDescription = `${bug.title}\n\n${bug.description}\n\nSteps to Reproduce: ${bug.stepsToReproduce?.join("\n") || "N/A"}\n\nActual Result: ${bug.actualResult || "N/A"}`;

    const analysis = await analyzeBugWithRAG(project.projectId, bugDescription);

    bug.aiAnalysis = {
      ...analysis,
      analyzedAt: new Date(),
    };
    await bug.save();

    return bug;
  } catch (error) {
    console.error("Error analyzing bug:", error);
    throw error;
  }
}