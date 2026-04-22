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
    attachmentDetails: [{
      filename: String,
      originalname: String,
      path: String,
      size: Number,
      mimetype: String,
    }],
    priority: {
      type: String,
      enum: ["P0", "P1", "P2", "P3"],
      default: "P2",
    },
    reproducibility: {
      type: String,
      enum: ["Always", "Often", "Sometimes", "Rare", "Unable"],
      default: "Sometimes",
    },
    component: {
      type: String,
      trim: true,
      default: "",
    },
    labels: {
      type: [String],
      default: [],
    },
    affectedUrl: {
      type: String,
      trim: true,
      default: "",
    },
    firstOccurrenceDate: {
      type: Date,
      default: null,
    },
    lastOccurrenceDate: {
      type: Date,
      default: null,
    },
    environment: {
      os: {
        type: String,
        trim: true,
        default: "",
      },
      browser: {
        type: String,
        trim: true,
        default: "",
      },
      browserVersion: {
        type: String,
        trim: true,
        default: "",
      },
      appType: {
        type: String,
        enum: ["Web", "Mobile", "API"],
        default: "Web",
      },
      appVersion: {
        type: String,
        trim: true,
        default: "",
      },
      build: {
        type: String,
        trim: true,
        default: "",
      },
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
bugSchema.index({ priority: 1, status: 1 });
bugSchema.index({ component: 1 });
bugSchema.index({ labels: 1 });
bugSchema.index({ reportedBy: 1 });

export const Bug = mongoose.model("Bug", bugSchema);

