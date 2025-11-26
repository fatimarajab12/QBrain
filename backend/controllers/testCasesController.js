import * as testCaseService from "../services/testCaseService.js";

export const createTestCase = async (req, res) => {
  try {
    const testCaseData = req.body;

    if (!testCaseData.title || !testCaseData.featureId || !testCaseData.steps) {
      return res.status(400).json({
        success: false,
        message: "Title, feature ID, and steps are required",
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

export const getTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const testCase = await testCaseService.getTestCaseById(id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: "Test case not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testCase,
    });
  } catch (error) {
    console.error("Get test case error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting test case",
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
    const testCases = await testCaseService.getProjectTestCases(projectId);

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    console.error("Get project test cases error:", error);
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

    const testCase = await testCaseService.updateTestCase(id, updateData);

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