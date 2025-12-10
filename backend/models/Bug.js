import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Bug title is required"],
      trim: true,
      maxlength: [200, "Bug title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    featureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feature",
      required: [true, "Feature ID is required"],
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    stepsToReproduce: {
      type: [String],
      default: [],
    },
    expectedBehavior: {
      type: String,
      trim: true,
      default: "",
    },
    actualBehavior: {
      type: String,
      trim: true,
      default: "",
    },
    environment: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    resolution: {
      type: String,
      trim: true,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
bugSchema.index({ projectId: 1, status: 1 });
bugSchema.index({ featureId: 1, status: 1 });
bugSchema.index({ severity: 1, status: 1 });
bugSchema.index({ reportedBy: 1 });

export const Bug = mongoose.model("Bug", bugSchema);

