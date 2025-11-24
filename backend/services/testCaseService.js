// Test Case Service - MongoDB + AI integration
import { TestCase } from "../models/TestCase.js";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateTestCasesFromRAG } from "../ai/ragService.js";
import { nanoid } from "nanoid";

/**
 * Create a new test case
 * @param {Object} testCaseData - Test case data
 * @returns {Promise<Object>} Created test case
 */
export async function createTestCase(testCaseData) {
  try {
    const testCaseId = `test_${nanoid(10)}`;
    const testCase = new TestCase({
      ...testCaseData,
      testCaseId,
    });

    await testCase.save();
    return testCase;
  } catch (error) {
    console.error("Error creating test case:", error);
    throw error;
  }
}

/**
 * Get test case by ID
 * @param {string} testCaseId - Test case ID or MongoDB _id
 * @returns {Promise<Object>} Test case
 */
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

/**
 * Get all test cases for a feature
 * @param {string} featureId - Feature ID
 * @returns {Promise<Array>} Test cases array
 */
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

/**
 * Get all test cases for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<Array>} Test cases array
 */
export async function getProjectTestCases(projectId) {
  try {
    const project = await Project.findOne({
      $or: [{ _id: projectId }, { projectId }],
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const testCases = await TestCase.find({ projectId: project._id }).sort({
      createdAt: -1,
    });

    return testCases;
  } catch (error) {
    console.error("Error getting project test cases:", error);
    throw error;
  }
}

/**
 * Update test case
 * @param {string} testCaseId - Test case ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated test case
 */
export async function updateTestCase(testCaseId, updateData) {
  try {
    const testCase = await TestCase.findOneAndUpdate(
      { $or: [{ _id: testCaseId }, { testCaseId }] },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return testCase;
  } catch (error) {
    console.error("Error updating test case:", error);
    throw error;
  }
}

/**
 * Delete test case
 * @param {string} testCaseId - Test case ID
 * @returns {Promise<void>}
 */
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

/**
 * Generate test cases for a feature using AI/RAG
 * @param {string} featureId - Feature ID
 * @param {Object} options - Generation options
 * @returns {Promise<Array>} Generated test cases
 */
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

    // Build feature description for context
    const featureDescription = `${feature.name}\n\n${feature.description}\n\nAcceptance Criteria: ${feature.acceptanceCriteria?.join(", ") || "N/A"}`;

    // Generate test cases using RAG
    const generatedTestCases = await generateTestCasesFromRAG(
      project.projectId,
      featureDescription,
      options
    );

    // Save test cases to MongoDB
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

/**
 * Bulk create test cases
 * @param {string} featureId - Feature ID
 * @param {Array<Object>} testCasesData - Array of test case data
 * @returns {Promise<Array>} Created test cases
 */
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

