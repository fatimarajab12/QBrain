import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    bugId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Bug title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Bug description is required"],
      trim: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feature",
      index: true,
    },
    testCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestCase",
      index: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed", "rejected"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    stepsToReproduce: {
      type: [String],
      default: [],
    },
    actualResult: {
      type: String,
      trim: true,
    },
    expectedResult: {
      type: String,
      trim: true,
    },
    environment: {
      type: String,
      trim: true,
    },
    discoveredDuring: {
      type: String,
      enum: ["testing", "development", "production", "code_review", "other"],
      default: "testing",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    aiAnalysis: {
      rootCause: String,
      relatedRequirements: [String],
      suggestedFix: String,
      analyzedAt: Date,
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

bugSchema.index({ projectId: 1, status: 1 });
bugSchema.index({ featureId: 1 });
bugSchema.index({ bugId: 1 });
bugSchema.index({ severity: 1, priority: 1 });
bugSchema.index({ reportedBy: 1 });

bugSchema.set("toJSON", { virtuals: true });
bugSchema.set("toObject", { virtuals: true });

export const Bug = mongoose.model("Bug", bugSchema);