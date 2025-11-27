import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema(
  {
    testCaseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Test case title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feature",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    steps: {
      type: [String],
      required: [true, "Test steps are required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one test step is required",
      },
    },
    expectedResult: {
      type: String,
      required: [true, "Expected result is required"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "passed", "failed", "blocked"],
      default: "pending",
    },
    preconditions: {
      type: [String],
      default: [],
    },
    postconditions: {
      type: [String],
      default: [],
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    aiGenerationContext: {
      type: String,
      default: null,
    },
    testData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (removed duplicate index: true from schema fields above)
testCaseSchema.index({ featureId: 1, status: 1 });
testCaseSchema.index({ projectId: 1 });
testCaseSchema.index({ testCaseId: 1 }, { unique: true });
testCaseSchema.index({ priority: 1 });

testCaseSchema.set("toJSON", { virtuals: true });
testCaseSchema.set("toObject", { virtuals: true });

export const TestCase = mongoose.model("TestCase", testCaseSchema);