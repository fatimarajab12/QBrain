import mongoose from "mongoose";
import { TestCase } from "../models/TestCase.js";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateTestCasesFromRAG, convertTestCaseToGherkinWithAI } from "../ai/ragService.js";
import { vectorStore } from "../vector/vectorStore.js";
import { Document } from "@langchain/core/documents";


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
      // Keep isAIGenerated from testCaseData if provided, otherwise default to false
      isAIGenerated: testCaseData.isAIGenerated !== undefined ? testCaseData.isAIGenerated : false,
    });

    await testCase.save();

    // Generate and save Gherkin automatically
    try {
      const projectId = testCase.projectId.toString();
      const gherkin = await convertTestCaseToGherkin(testCase, true, projectId);
      testCase.gherkin = gherkin;
      await testCase.save();
      console.log(`Generated and saved Gherkin for test case ${testCase._id}`);
    } catch (gherkinError) {
      // Log error but don't fail the creation
      console.warn("Error generating Gherkin for test case:", gherkinError.message);
      // Fallback to rule-based conversion
      try {
        const projectId = testCase.projectId.toString();
        const gherkin = await convertTestCaseToGherkin(testCase, false, projectId);
        testCase.gherkin = gherkin;
        await testCase.save();
      } catch (fallbackError) {
        console.warn("Error with fallback Gherkin generation:", fallbackError.message);
      }
    }

    // Add all test cases (both manual and AI-generated) to vector database for chatbot support
    try {
      const projectId = testCase.projectId.toString();
      const featureId = testCase.featureId.toString();
      
      // Create test case content for vector database
      const testCaseContent = `Test Case: ${testCase.title}\n\nDescription: ${testCase.description}\n\nSteps:\n${(testCase.steps || []).map((step, idx) => `${idx + 1}. ${step}`).join("\n")}\n\nExpected Result: ${testCase.expectedResult}\n\nPriority: ${testCase.priority}\n\nStatus: ${testCase.status}\n\nPreconditions: ${(testCase.preconditions || []).join(", ")}`;
      
      const testCaseDocument = new Document({
        pageContent: testCaseContent,
        metadata: {
          projectId: projectId,
          source: "TestCase",
          testCaseId: testCase._id.toString(),
          featureId: featureId,
          type: "testcase",
          isAIGenerated: testCase.isAIGenerated || false,
          createdAt: new Date().toISOString(),
        },
      });

      // Add to vector database
      await vectorStore.upsertDocument(
        projectId,
        testCaseDocument,
        null, // embedding will be generated automatically
        { testCaseId: testCase._id.toString(), type: "testcase" }
      );

      console.log(`Added test case ${testCase._id} to vector database`);
    } catch (vectorError) {
      // Log error but don't fail the creation
      console.error("Error adding test case to vector database:", vectorError);
    }

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

export async function hasAIGeneratedTestCases(featureId) {
  try {
    const featureIdObj = validateObjectId(featureId, "Feature ID");
    const count = await TestCase.countDocuments({ 
      featureId: featureIdObj,
      isAIGenerated: true 
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking AI-generated test cases:", error);
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

    // Get the test case before update to check if it was AI-generated
    const existingTestCase = await TestCase.findById(id);
    if (!existingTestCase) {
      throw new Error("Test case not found");
    }

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

    // Check if test case was found and updated
    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Regenerate and save Gherkin automatically after update (rule-based only, not AI)
    try {
      const projectId = typeof testCase.projectId === 'object' && testCase.projectId._id 
        ? testCase.projectId._id.toString() 
        : testCase.projectId.toString();
      // Use rule-based conversion for updates (not AI)
      const gherkin = await convertTestCaseToGherkin(testCase, false, projectId);
      testCase.gherkin = gherkin;
      await testCase.save();
      console.log(`Regenerated and saved Gherkin (rule-based) for test case ${testCase._id}`);
    } catch (gherkinError) {
      // Log error but don't fail the update
      console.warn("Error regenerating Gherkin for test case:", gherkinError.message);
    }

    // Update all test cases (both manual and AI-generated) in vector database for chatbot support
    try {
      // Handle projectId and featureId whether they're ObjectIds or populated objects
      const projectId = typeof testCase.projectId === 'object' && testCase.projectId._id 
        ? testCase.projectId._id.toString() 
        : testCase.projectId.toString();
      
      const featureId = typeof testCase.featureId === 'object' && testCase.featureId._id 
        ? testCase.featureId._id.toString() 
        : testCase.featureId.toString();
      
      // Create test case content for vector database
      const testCaseContent = `Test Case: ${testCase.title}\n\nDescription: ${testCase.description}\n\nSteps:\n${(testCase.steps || []).map((step, idx) => `${idx + 1}. ${step}`).join("\n")}\n\nExpected Result: ${testCase.expectedResult}\n\nPriority: ${testCase.priority}\n\nStatus: ${testCase.status}\n\nPreconditions: ${(testCase.preconditions || []).join(", ")}`;
      
      const testCaseDocument = new Document({
        pageContent: testCaseContent,
        metadata: {
          projectId: projectId,
          source: "TestCase",
          testCaseId: testCase._id.toString(),
          featureId: featureId,
          type: "testcase",
          isAIGenerated: testCase.isAIGenerated || false,
          updatedAt: new Date().toISOString(),
          
        },
      });

      // Update or insert in vector database
      await vectorStore.upsertDocument(
        projectId,
        testCaseDocument,
        null, // embedding will be generated automatically
        { testCaseId: testCase._id.toString(), type: "testcase" }
      );

      console.log(`Updated test case ${testCase._id} in vector database`);
    } catch (vectorError) {
      // Log error but don't fail the update
      console.error("Error updating test case in vector database:", vectorError);
    }

    return testCase;
  } catch (error) {
    console.error("Error updating test case:", error);
    throw error;
  }
}

export async function deleteTestCase(testCaseId) {
  try {
    const id = validateObjectId(testCaseId, "Test Case ID");

    // Get test case before deletion to check if it was AI-generated
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Delete from MongoDB
    const deletedTestCase = await TestCase.findByIdAndDelete(id);
    if (!deletedTestCase) {
      throw new Error("Test case not found or already deleted");
    }

    // Delete all test cases (both manual and AI-generated) from vector database for chatbot support
    try {
      const projectId = testCase.projectId.toString();
      
      // Delete from vector database
      await vectorStore.deleteDocumentsByMetadata(projectId, {
        testCaseId: testCase._id.toString(),
        type: "testcase"
      });

      console.log(`Deleted test case ${testCase._id} from vector database`);
    } catch (vectorError) {
      // Log error but don't fail the deletion
      console.error("Error deleting test case from vector database:", vectorError);
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

    // Build comprehensive feature description
    const featureDescription = `${feature.name}\n\n${feature.description || ""}\n\nAcceptance Criteria: ${feature.acceptanceCriteria?.join(", ") || "N/A"}\n\nReasoning: ${feature.reasoning || "N/A"}`;

    // Extract feature metadata for test case generation
    // Handle both Map and plain object formats
    let featureType = "FUNCTIONAL"; // Default
    if (feature.metadata) {
      if (feature.metadata instanceof Map) {
        featureType = feature.metadata.get('featureType') || featureType;
      } else if (typeof feature.metadata === 'object') {
        featureType = feature.metadata.featureType || featureType;
      }
    }
    
    const matchedSections = feature.matchedSections || [];
    const featurePriority = feature.priority || "Medium";

    // Prepare enhanced options with feature information
    const enhancedOptions = {
      ...options,
      featureType: featureType,
      matchedSections: matchedSections,
      featurePriority: featurePriority,
      useComprehensiveRetrieval: options.useComprehensiveRetrieval !== false, // Default to true
    };

    console.log(`Generating test cases for feature: ${feature.name} (Type: ${featureType}, Sections: ${matchedSections.join(", ") || "none"})`);

    const generatedTestCases = await generateTestCasesFromRAG(
      project._id.toString(),
      featureDescription,
      enhancedOptions
    );

    const savedTestCases = [];
    for (const testCaseData of generatedTestCases) {
      // Set priority based on feature priority if not specified in test case
      const testCasePriority = testCaseData.priority || 
                               (featurePriority === "High" ? "high" : 
                                featurePriority === "Low" ? "low" : "medium");

      const testCase = await createTestCase({
        ...testCaseData,
        featureId: feature._id,
        projectId: project._id,
        priority: testCasePriority,
        isAIGenerated: true,
        aiGenerationContext: JSON.stringify({
          ...enhancedOptions,
          featureName: feature.name,
          featureType: featureType,
          matchedSections: matchedSections,
        }),
      });
      savedTestCases.push(testCase);
    }

    console.log(`Generated ${savedTestCases.length} test cases for feature: ${feature.name}`);
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

/**
 * Convert a test case to Gherkin format
 * @param {Object} testCase - The test case object
 * @param {boolean} useAI - Whether to use AI for conversion (default: true)
 * @param {string} projectId - Project ID for AI context retrieval
 * @returns {Promise<string>|string} - Gherkin formatted string
 */
export async function convertTestCaseToGherkin(testCase, useAI = true, projectId = null) {
  // Use AI conversion if enabled and projectId is available
  if (useAI && projectId) {
    try {
      return await convertTestCaseToGherkinWithAI(testCase, projectId, {
        includeFeatureContext: true,
        improveWording: true
      });
    } catch (error) {
      console.warn("AI conversion failed, falling back to rule-based conversion:", error.message);
      // Fallback to rule-based conversion
    }
  }
  
  // Rule-based conversion (fallback or when AI is disabled)
  // Clean feature name (remove special characters, keep spaces)
  const featureName = (testCase.title || 'Test Feature')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim() || 'Test Feature';
  
  let gherkin = `Feature: ${featureName}\n`;
  
  // Add description if available
  if (testCase.description) {
    gherkin += `  ${testCase.description}\n`;
  }
  
  // Add scenario
  const scenarioName = testCase.title || 'Test Scenario';
  gherkin += `\n  Scenario: ${scenarioName}\n`;
  
  // Add preconditions as Given steps
  if (testCase.preconditions && Array.isArray(testCase.preconditions) && testCase.preconditions.length > 0) {
    testCase.preconditions.forEach((precondition, index) => {
      const keyword = index === 0 ? 'Given' : 'And';
      const formattedPrecondition = String(precondition).trim();
      // Remove existing keywords if present
      const cleanedPrecondition = formattedPrecondition.replace(/^(Given|When|Then|And)\s+/i, '');
      gherkin += `    ${keyword} ${cleanedPrecondition}\n`;
    });
  }
  
  // Add steps as When/And steps
  if (testCase.steps && Array.isArray(testCase.steps) && testCase.steps.length > 0) {
    const hasPreconditions = testCase.preconditions && testCase.preconditions.length > 0;
    testCase.steps.forEach((step, index) => {
      const keyword = !hasPreconditions && index === 0 ? 'When' : 'And';
      const formattedStep = String(step).trim();
      // Remove existing keywords if present
      const cleanedStep = formattedStep.replace(/^(Given|When|Then|And)\s+/i, '');
      gherkin += `    ${keyword} ${cleanedStep}\n`;
    });
  }
  
  // Add expected result as Then step
  if (testCase.expectedResult) {
    const formattedResult = String(testCase.expectedResult).trim();
    // Remove existing keywords if present
    const cleanedResult = formattedResult.replace(/^(Given|When|Then|And)\s+/i, '');
    gherkin += `    Then ${cleanedResult}\n`;
  }
  
  return gherkin;
}

/**
 * Convert multiple test cases to Gherkin format
 * @param {Array} testCases - Array of test case objects
 * @param {string} featureName - Optional feature name (defaults to first test case title)
 * @returns {string} - Gherkin formatted string with multiple scenarios
 */
export function convertTestCasesToGherkin(testCases, featureName = null) {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error('Test cases array is required and must not be empty');
  }
  
  // Use provided feature name or derive from first test case
  const feature = featureName || 
    (testCases[0].title || 'Test Feature')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim() || 'Test Feature';
  
  let gherkin = `Feature: ${feature}\n`;
  
  // Add description from first test case if available
  if (testCases[0].description) {
    gherkin += `  ${testCases[0].description}\n`;
  }
  
  // Add each test case as a scenario
  testCases.forEach((testCase, index) => {
    const scenarioName = testCase.title || `Scenario ${index + 1}`;
    gherkin += `\n  Scenario: ${scenarioName}\n`;
    
    // Add preconditions
    if (testCase.preconditions && Array.isArray(testCase.preconditions) && testCase.preconditions.length > 0) {
      testCase.preconditions.forEach((precondition, idx) => {
        const keyword = idx === 0 ? 'Given' : 'And';
        const formattedPrecondition = String(precondition).trim().replace(/^(Given|When|Then|And)\s+/i, '');
        gherkin += `    ${keyword} ${formattedPrecondition}\n`;
      });
    }
    
    // Add steps
    if (testCase.steps && Array.isArray(testCase.steps) && testCase.steps.length > 0) {
      const hasPreconditions = testCase.preconditions && testCase.preconditions.length > 0;
      testCase.steps.forEach((step, idx) => {
        const keyword = !hasPreconditions && idx === 0 ? 'When' : 'And';
        const formattedStep = String(step).trim().replace(/^(Given|When|Then|And)\s+/i, '');
        gherkin += `    ${keyword} ${formattedStep}\n`;
      });
    }
    
    // Add expected result
    if (testCase.expectedResult) {
      const formattedResult = String(testCase.expectedResult).trim().replace(/^(Given|When|Then|And)\s+/i, '');
      gherkin += `    Then ${formattedResult}\n`;
    }
  });
  
  return gherkin;
}