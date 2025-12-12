import * as testCaseService from "../services/testCaseService.js";
import { convertTestCaseToGherkin, convertTestCasesToGherkin } from "../services/testCaseService.js";
import { BadRequestError, NotFoundError } from "../utils/AppError.js";

export const createTestCase = async (req, res, next) => {
  try {
    const testCaseData = req.body;

    if (!testCaseData || !testCaseData.title || !testCaseData.steps) {
      return next(new BadRequestError("Title and steps are required"));
    }

    // featureId can be in body or params
    if (req.params.featureId) {
      testCaseData.featureId = req.params.featureId;
    }

    if (!testCaseData.featureId) {
      return next(new BadRequestError("Feature ID is required (in body or params)"));
    }

    const testCase = await testCaseService.createTestCase(testCaseData);

    res.status(201).json({
      success: true,
      message: "Test case created successfully",
      data: testCase,
    });
  } catch (error) {
    next(error);
  }
};

export const createTestCaseForFeature = async (req, res, next) => {
  try {
    const { featureId } = req.params;
    const testCaseData = { ...req.body, featureId };

    if (!testCaseData.title || !testCaseData.steps) {
      return next(new BadRequestError("Title and steps are required"));
    }

    const testCase = await testCaseService.createTestCase(testCaseData);

    res.status(201).json({
      success: true,
      message: "Test case created successfully",
      data: testCase,
    });
  } catch (error) {
    if (error.message === "Feature not found") {
      return next(new NotFoundError("Feature not found"));
    }
    next(error);
  }
};

export const getTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const testCase = await testCaseService.getTestCaseById(id);

    if (!testCase) {
      // If test case not found, try to get test cases by feature ID
      try {
        const testCases = await testCaseService.getFeatureTestCases(id);
        return res.status(200).json({
          success: true,
          count: testCases.length,
          data: testCases,
          message: `Found ${testCases.length} test cases for feature`,
        });
      } catch (featureError) {
        // If feature lookup also fails, return original 404
        return res.status(404).json({
          success: false,
          message: "Test case not found",
          exists: false,
        });
      }
    }

    res.status(200).json({
      success: true,
      exists: true,
      message: "Test case found",
      data: testCase,
    });
  } catch (error) {
    next(error);
  }
};

export const checkTestCaseExists = async (req, res, next) => {
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
    next(error);
  }
};

export const checkHasAIGeneratedTestCases = async (req, res, next) => {
  try {
    const { featureId } = req.params;
    const hasAIGenerated = await testCaseService.hasAIGeneratedTestCases(featureId);

    res.status(200).json({
      success: true,
      hasAIGenerated,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeatureTestCases = async (req, res, next) => {
  try {
    const { featureId } = req.params;
    const testCases = await testCaseService.getFeatureTestCases(featureId);

    res.status(200).json({
      success: true,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectTestCases = async (req, res, next) => {
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
    if (error.message === "Project not found") {
      return next(new NotFoundError("Project not found"));
    }
    next(error);
  }
};

export const updateTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate that updateData is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new BadRequestError("Update data is required"));
    }

    const { testCaseId, _id, createdAt, __v, ...allowedUpdates } = updateData;

    if (Object.keys(allowedUpdates).length === 0) {
      return next(new BadRequestError("No valid fields to update"));
    }

    const testCase = await testCaseService.updateTestCase(id, allowedUpdates);

    if (!testCase) {
      return next(new NotFoundError("Test case not found"));
    }

    res.status(200).json({
      success: true,
      message: "Test case updated successfully",
      data: testCase,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTestCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    await testCaseService.deleteTestCase(id);

    res.status(200).json({
      success: true,
      message: "Test case deleted successfully",
    });
  } catch (error) {
    if (error.message === "Test case not found" || error.message === "Test case not found or already deleted") {
      return next(new NotFoundError(error.message));
    }
    next(error);
  }
};

export const generateTestCases = async (req, res, next) => {
  try {
    const { featureId } = req.params;
    // Safely extract options from request body
    const options = (req.body && req.body.options) ? req.body.options : {};

    const testCases = await testCaseService.generateTestCasesForFeature(featureId, options);

    res.status(200).json({
      success: true,
      message: `Generated ${testCases.length} test cases successfully`,
      count: testCases.length,
      data: testCases,
    });
  } catch (error) {
    next(error);
  }
};

export const bulkCreateTestCases = async (req, res, next) => {
  try {
    const { featureId, testCases } = req.body;

    if (!featureId || !Array.isArray(testCases) || testCases.length === 0) {
      return next(new BadRequestError("Feature ID and test cases array are required"));
    }

    const createdTestCases = await testCaseService.bulkCreateTestCases(featureId, testCases);

    res.status(201).json({
      success: true,
      message: `Created ${createdTestCases.length} test cases successfully`,
      count: createdTestCases.length,
      data: createdTestCases,
    });
  } catch (error) {
    next(error);
  }
};

export const convertToGherkin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { useAI = "true" } = req.query; // Default to AI enabled
    const testCase = await testCaseService.getTestCaseById(id);

    if (!testCase) {
      return next(new NotFoundError("Test case not found"));
    }

    // Get projectId from testCase (handle both populated and non-populated cases)
    let projectId = null;
    if (testCase.projectId) {
      projectId = typeof testCase.projectId === 'object' && testCase.projectId._id
        ? testCase.projectId._id.toString()
        : testCase.projectId.toString();
    }
    const shouldUseAI = useAI === "true" || useAI === true;

    // Convert to Gherkin (AI if enabled, otherwise rule-based)
    const gherkin = await testCaseService.convertTestCaseToGherkin(
      testCase,
      shouldUseAI,
      projectId
    );

    res.status(200).json({
      success: true,
      message: `Test case converted to Gherkin successfully using ${shouldUseAI ? 'AI' : 'rule-based'} conversion`,
      data: {
        gherkin,
        testCaseId: testCase._id,
        testCaseTitle: testCase.title,
        conversionMethod: shouldUseAI ? 'AI' : 'rule-based',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const convertFeatureTestCasesToGherkin = async (req, res, next) => {
  try {
    const { featureId } = req.params;
    const { featureName } = req.query;

    const testCases = await testCaseService.getFeatureTestCases(featureId);

    if (!testCases || testCases.length === 0) {
      return next(new NotFoundError("No test cases found for this feature"));
    }

    const gherkin = convertTestCasesToGherkin(testCases, featureName || null);

    res.status(200).json({
      success: true,
      message: `Converted ${testCases.length} test cases to Gherkin successfully`,
      data: {
        gherkin,
        featureId,
        testCasesCount: testCases.length,
      },
    });
  } catch (error) {
    next(error);
  }
};