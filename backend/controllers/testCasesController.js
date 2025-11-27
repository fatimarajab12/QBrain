import * as testCaseService from "../services/testCaseService.js";

export const createTestCase = async (req, res) => {
  try {
    const testCaseData = req.body;

    if (!testCaseData || !testCaseData.title || !testCaseData.steps) {
      return res.status(400).json({
        success: false,
        message: "Title and steps are required",
      });
    }

    // featureId can be in body or params
    if (req.params.featureId) {
      testCaseData.featureId = req.params.featureId;
    }

    if (!testCaseData.featureId) {
      return res.status(400).json({
        success: false,
        message: "Feature ID is required (in body or params)",
      });
    }

    const testCase = await testCaseService.createTestCase(testCaseData);

    res.status(201).json({
      success: true,
      message: "Test case created successfully",
      data: testCase,
    });
  } catch (error) {
    console.error("Create test case error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating test case",
      error: error.message,
    });
  }
};

export const createTestCaseForFeature = async (req, res) => {
  try {
    const { featureId } = req.params;
    const testCaseData = { ...req.body, featureId };

    if (!testCaseData.title || !testCaseData.steps) {
      return res.status(400).json({
        success: false,
        message: "Title and steps are required",
      });
    }

    const testCase = await testCaseService.createTestCase(testCaseData);

    res.status(201).json({
      success: true,
      message: "Test case created successfully",
      data: testCase,
    });
  } catch (error) {
    console.error("Create test case for feature error:", error);
    
    if (error.message === "Feature not found") {
      return res.status(404).json({
        success: false,
        message: "Feature not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating test case",
      error: error.message,
    });
  }
};

export const getTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const testCase = await testCaseService.getTestCaseById(id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
        exists: false,
      });
    }

    res.status(200).json({
      success: true,
      exists: true,
      message: "Test case found",
      data: testCase,
    });
  } catch (error) {
    console.error("Get test case error:", error);
    res.status(500).json({
      success: false,
      exists: false,
      message: "Error getting test case",
      error: error.message,
    });
  }
};

export const checkTestCaseExists = async (req, res) => {
  try {
    const { id } = req.params;
    const testCase = await testCaseService.getTestCaseById(id);

    res.status(200).json({
      success: true,
      exists: !!testCase,
      message: testCase ? "Test case exists" : "Test case not found",
      data: testCase || null,
    });
  } catch (error) {
    console.error("Check test case exists error:", error);
    res.status(500).json({
      success: false,
      exists: false,
      message: "Error checking test case",
      error: error.message,
    });
  }
};

export const getFeatureTestCases = async (req, res) => {
  try {
    const { featureId } = req.params;
    const testCases = await testCaseService.getFeatureTestCases(featureId);

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    console.error("Get feature test cases error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting test cases",
      error: error.message,
    });
  }
};

export const getProjectTestCases = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, featureId } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (featureId) filters.featureId = featureId;

    const testCases = await testCaseService.getProjectTestCases(projectId, filters);

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    console.error("Get project test cases error:", error);
    
    // Handle specific error cases
    if (error.message === "Project not found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error getting test cases",
      error: error.message,
    });
  }
};

export const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate that updateData is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Update data is required",
      });
    }

    // Remove fields that should not be updated
    const { testCaseId, _id, createdAt, __v, ...allowedUpdates } = updateData;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const testCase = await testCaseService.updateTestCase(id, allowedUpdates);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test case updated successfully",
      data: testCase,
    });
  } catch (error) {
    console.error("Update test case error:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
        details: error.errors,
      });
    }

    // Handle cast errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating test case",
      error: error.message,
    });
  }
};

export const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    await testCaseService.deleteTestCase(id);

    res.status(200).json({
      success: true,
      message: "Test case deleted successfully",
    });
  } catch (error) {
    console.error("Delete test case error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting test case",
      error: error.message,
    });
  }
};

export const generateTestCases = async (req, res) => {
  try {
    const { featureId } = req.params;
    const options = req.body.options || {};

    const testCases = await testCaseService.generateTestCasesForFeature(featureId, options);

    res.status(200).json({
      success: true,
      message: `Generated ${testCases.length} test cases successfully`,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    console.error("Generate test cases error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating test cases",
      error: error.message,
    });
  }
};

export const bulkCreateTestCases = async (req, res) => {
  try {
    const { featureId, testCases } = req.body;

    if (!featureId || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Feature ID and test cases array are required",
      });
    }

    const createdTestCases = await testCaseService.bulkCreateTestCases(featureId, testCases);

    res.status(201).json({
      success: true,
      message: `Created ${createdTestCases.length} test cases successfully`,
      count: createdTestCases.length,
      data: createdTestCases,
    });
  } catch (error) {
    console.error("Bulk create test cases error:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk creating test cases",
      error: error.message,
    });
  }
};