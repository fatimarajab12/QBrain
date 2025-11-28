import mongoose from "mongoose";
import { TestCase } from "../models/TestCase.js";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateTestCasesFromRAG } from "../ai/ragService.js";


function validateObjectId(id, fieldName = "ID") {
  if (!id) return null;
  
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return id;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters)`);
}

export async function createTestCase(testCaseData) {
  try {
    if (testCaseData.featureId) {
      testCaseData.featureId = validateObjectId(testCaseData.featureId, "Feature ID");
      
      const feature = await Feature.findById(testCaseData.featureId).select("projectId");
      if (!feature) {
        throw new Error("Feature not found");
      }
      
      if (!testCaseData.projectId) {
        testCaseData.projectId = feature.projectId;
      }
    }

    if (testCaseData.projectId) {
      testCaseData.projectId = validateObjectId(testCaseData.projectId, "Project ID");
      
      const project = await Project.findById(testCaseData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    if (!testCaseData.projectId) {
      throw new Error("Project ID is required. Provide projectId or featureId.");
    }

    if (!testCaseData.featureId) {
      throw new Error("Feature ID is required.");
    }

    const testCase = new TestCase({
      ...testCaseData,
      isAIGenerated: false, // Explicitly mark as manual creation
    });

    await testCase.save();
    return testCase;
  } catch (error) {
    console.error("Error creating test case:", error);
    throw error;
  }
}

export async function getTestCaseById(testCaseId) {
  try {
    const id = validateObjectId(testCaseId, "Test Case ID");

    const testCase = await TestCase.findById(id)
      .populate("featureId", "_id name description")
      .populate("projectId", "_id name")
      .lean();

    return testCase;
  } catch (error) {
    console.error("Error getting test case:", error);
    throw error;
  }
}

export async function getFeatureTestCases(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");
    
    const feature = await Feature.findById(id).select("_id");
    if (!feature) {
      throw new Error("Feature not found");
    }

    const testCases = await TestCase.find({ featureId: id }).sort({
      priority: -1,
      createdAt: -1,
    });

    return testCases;
  } catch (error) {
    console.error("Error getting feature test cases:", error);
    throw error;
  }
}

export async function getProjectTestCases(projectId, filters = {}) {
  try {
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const query = { projectId: id };
    
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.featureId) {
      const featureId = validateObjectId(filters.featureId, "Feature ID");
      query.featureId = featureId;
    }

    const testCases = await TestCase.find(query)
      .populate("featureId", "_id name description")
      .populate("projectId", "_id name")
      .select("-__v")
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    const cleanedTestCases = testCases.map((tc) => {
      const cleaned = { ...tc };
      delete cleaned.__v;
      
      if (cleaned.featureId && typeof cleaned.featureId === 'object') {
        cleaned.featureId = {
          _id: cleaned.featureId._id,
          name: cleaned.featureId.name,
          description: cleaned.featureId.description,
        };
      }
      if (cleaned.projectId && typeof cleaned.projectId === 'object') {
        cleaned.projectId = {
          _id: cleaned.projectId._id,
          name: cleaned.projectId.name,
        };
      }
      return cleaned;
    });

    return cleanedTestCases;
  } catch (error) {
    console.error("Error getting project test cases:", error);
    throw error;
  }
}

export async function updateTestCase(testCaseId, updateData) {
  try {
    const id = validateObjectId(testCaseId, "Test Case ID");

    if (updateData.featureId) {
      updateData.featureId = validateObjectId(updateData.featureId, "Feature ID");
      
      const feature = await Feature.findById(updateData.featureId).select("projectId");
      if (!feature) {
        throw new Error("Feature not found");
      }
      
      if (!updateData.projectId) {
        updateData.projectId = feature.projectId;
      }
    }

    if (updateData.projectId) {
      updateData.projectId = validateObjectId(updateData.projectId, "Project ID");
      
      const project = await Project.findById(updateData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    const testCase = await TestCase.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
      }
    )
    .populate("featureId", "_id name description")
    .populate("projectId", "_id name");

    return testCase;
  } catch (error) {
    console.error("Error updating test case:", error);
    throw error;
  }
}

export async function deleteTestCase(testCaseId) {
  try {
    const id = validateObjectId(testCaseId, "Test Case ID");

    const testCase = await TestCase.findByIdAndDelete(id);
    if (!testCase) {
      return { success: false, message: "Test case not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting test case:", error);
    throw error;
  }
}

export async function generateTestCasesForFeature(featureId, options = {}) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const feature = await Feature.findById(id).populate("projectId");
    if (!feature) {
      throw new Error("Feature not found");
    }

    const project = feature.projectId;
    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const featureDescription = `${feature.name}\n\n${feature.description}\n\nAcceptance Criteria: ${feature.acceptanceCriteria?.join(", ") || "N/A"}`;

    const generatedTestCases = await generateTestCasesFromRAG(
      project._id.toString(),
      featureDescription,
      options
    );

    const savedTestCases = [];
    for (const testCaseData of generatedTestCases) {
      const testCase = await createTestCase({
        ...testCaseData,
        featureId: feature._id,
        projectId: project._id,
        isAIGenerated: true,
        aiGenerationContext: JSON.stringify(options),
      });
      savedTestCases.push(testCase);
    }

    return savedTestCases;
  } catch (error) {
    console.error("Error generating test cases for feature:", error);
    throw error;
  }
}

export async function bulkCreateTestCases(featureId, testCasesData) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const feature = await Feature.findById(id).populate("projectId");
    if (!feature) {
      throw new Error("Feature not found");
    }

    const testCases = [];
    for (const testCaseData of testCasesData) {
      const testCase = new TestCase({
        ...testCaseData,
        featureId: feature._id,
        projectId: feature.projectId._id,
      });
      await testCase.save();
      testCases.push(testCase);
    }

    return testCases;
  } catch (error) {
    console.error("Error bulk creating test cases:", error);
    throw error;
  }
}