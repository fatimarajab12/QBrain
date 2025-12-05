import mongoose from "mongoose";

const performanceMetricSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["features", "testCases"],
      required: true,
    },
    recallAt1: {
      type: Number,
      default: 0,
    },
    recallAt5: {
      type: Number,
      default: 0,
    },
    recallAt10: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    precisionAt5: {
      type: Number,
      default: 0,
    },
    precisionAt10: {
      type: Number,
      default: 0,
    },
    totalGenerated: {
      type: Number,
      default: 0,
    },
    totalApproved: {
      type: Number,
      default: 0,
    },
    totalRejected: {
      type: Number,
      default: 0,
    },
    approvalRate: {
      type: Number,
      default: 0,
    },
    rejectionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
performanceMetricSchema.index({ projectId: 1, type: 1, createdAt: -1 });

export const PerformanceMetric = mongoose.model("PerformanceMetric", performanceMetricSchema);

