import mongoose from "mongoose";
import { TestCase } from "../models/TestCase.js";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateTestCasesFromRAG } from "../ai/ragService.js";
import { nanoid } from "nanoid";

export async function createTestCase(testCaseData) {
  try {
    // If projectId is not provided, get it from feature
    if (!testCaseData.projectId && testCaseData.featureId) {
      // Check if featureId is a valid ObjectId
      const isValidObjectId = mongoose.Types.ObjectId.isValid(testCaseData.featureId) && 
                               testCaseData.featureId.toString().length === 24;
      
      let feature;
      if (isValidObjectId) {
        // If it's a valid ObjectId, try both _id and featureId
        feature = await Feature.findOne({
          $or: [{ _id: testCaseData.featureId }, { featureId: testCaseData.featureId }],
        }).select("projectId");
      } else {
        // If not a valid ObjectId (like "feature_123"), search only by featureId field
        feature = await Feature.findOne({ featureId: testCaseData.featureId }).select("projectId");
      }
      
      if (!feature) {
        throw new Error("Feature not found");
      }
      
      // Convert featureId to ObjectId (_id) for saving
      testCaseData.featureId = feature._id;
      testCaseData.projectId = feature.projectId;
    } else if (testCaseData.featureId) {
      // If projectId is provided but featureId is still a string, convert it
      const isValidObjectId = mongoose.Types.ObjectId.isValid(testCaseData.featureId) && 
                               testCaseData.featureId.toString().length === 24;
      
      if (!isValidObjectId) {
        // Find feature to get its _id
        const feature = await Feature.findOne({ featureId: testCaseData.featureId }).select("_id");
        if (feature) {
          testCaseData.featureId = feature._id;
        } else {
          throw new Error("Feature not found");
        }
      }
    }

    if (!testCaseData.projectId) {
      throw new Error("Project ID is required. Provide projectId or featureId.");
    }

    if (!testCaseData.featureId) {
      throw new Error("Feature ID is required.");
    }

    const testCaseId = `test_${nanoid(10)}`;
    const testCase = new TestCase({
      ...testCaseData,
      testCaseId,
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
    const testCase = await TestCase.findOne({
      $or: [{ _id: testCaseId }, { testCaseId }],
    })
      .populate("featureId", "name featureId")
      .populate("projectId", "name projectId")
      .lean();

    return testCase;
  } catch (error) {
    console.error("Error getting test case:", error);
    throw error;
  }
}

export async function getFeatureTestCases(featureId) {
  try {
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    });

    if (!feature) {
      throw new Error("Feature not found");
    }

    const testCases = await TestCase.find({ featureId: feature._id }).sort({
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
    // Check if projectId is a valid ObjectId (24 hex characters)
    const isValidObjectId = mongoose.Types.ObjectId.isValid(projectId) && projectId.toString().length === 24;
    
    let project;
    if (isValidObjectId) {
      // If it's a valid ObjectId, try both _id and projectId
      project = await Project.findOne({
        $or: [{ _id: projectId }, { projectId }],
      });
    } else {
      // If not a valid ObjectId (like "project_38c17371-e7e9"), search only by projectId field
      project = await Project.findOne({ projectId });
    }

    if (!project) {
      throw new Error("Project not found");
    }

    const query = { projectId: project._id };
    
    // Add optional filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }
    if (filters.featureId) {
      const feature = await Feature.findOne({
        $or: [{ _id: filters.featureId }, { featureId: filters.featureId }],
      });
      if (feature) {
        query.featureId = feature._id;
      }
    }

    const testCases = await TestCase.find(query)
      .populate("featureId", "name featureId description")
      .populate("projectId", "name projectId")
      .select("-__v")
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    // Clean up the response - remove unnecessary fields
    const cleanedTestCases = testCases.map((tc) => {
      const cleaned = { ...tc };
      // Remove MongoDB internal fields
      delete cleaned.__v;
      // Ensure featureId is properly formatted
      if (cleaned.featureId && typeof cleaned.featureId === 'object') {
        cleaned.featureId = {
          _id: cleaned.featureId._id,
          name: cleaned.featureId.name,
          featureId: cleaned.featureId.featureId,
          description: cleaned.featureId.description,
        };
      }
      // Ensure projectId is properly formatted
      if (cleaned.projectId && typeof cleaned.projectId === 'object') {
        cleaned.projectId = {
          _id: cleaned.projectId._id,
          name: cleaned.projectId.name,
          projectId: cleaned.projectId.projectId,
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
    // Check if testCaseId is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(testCaseId) && 
                             testCaseId.toString().length === 24;

    let query;
    if (isValidObjectId) {
      query = { $or: [{ _id: testCaseId }, { testCaseId }] };
    } else {
      query = { testCaseId };
    }

    // If featureId is being updated and it's a string, convert it to ObjectId
    if (updateData.featureId && typeof updateData.featureId === 'string') {
      const isValidFeatureObjectId = mongoose.Types.ObjectId.isValid(updateData.featureId) && 
                                      updateData.featureId.toString().length === 24;
      
      if (!isValidFeatureObjectId) {
        // Find feature by featureId string to get its _id
        const feature = await Feature.findOne({ featureId: updateData.featureId }).select("_id projectId");
        if (feature) {
          updateData.featureId = feature._id;
          // Also update projectId if not provided
          if (!updateData.projectId) {
            updateData.projectId = feature.projectId;
          }
        } else {
          throw new Error("Feature not found");
        }
      }
    }

    const testCase = await TestCase.findOneAndUpdate(
      query,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
      }
    )
    .populate("featureId", "name featureId description")
    .populate("projectId", "name projectId");

    return testCase;
  } catch (error) {
    console.error("Error updating test case:", error);
    throw error;
  }
}

export async function deleteTestCase(testCaseId) {
  try {
    await TestCase.findOneAndDelete({
      $or: [{ _id: testCaseId }, { testCaseId }],
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting test case:", error);
    throw error;
  }
}

export async function generateTestCasesForFeature(featureId, options = {}) {
  try {
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    }).populate("projectId");

    if (!feature) {
      throw new Error("Feature not found");
    }

    const project = feature.projectId;
    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const featureDescription = `${feature.name}\n\n${feature.description}\n\nAcceptance Criteria: ${feature.acceptanceCriteria?.join(", ") || "N/A"}`;

    const generatedTestCases = await generateTestCasesFromRAG(
      project.projectId,
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
    const feature = await Feature.findOne({
      $or: [{ _id: featureId }, { featureId }],
    }).populate("projectId");

    if (!feature) {
      throw new Error("Feature not found");
    }

    const testCases = [];
    for (const testCaseData of testCasesData) {
      const testCaseId = `test_${nanoid(10)}`;
      const testCase = new TestCase({
        ...testCaseData,
        testCaseId,
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