import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Feature name is required"],
      trim: true,
      maxlength: [200, "Feature name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "blocked"],
      default: "pending",
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    aiGenerationContext: {
      type: String,
      default: null,
    },
    acceptanceCriteria: {
      type: [String],
      default: [],
    },
    reasoning: {
      type: String,
      default: null,
    },
    matchedSections: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    coverageEvaluation: {
      coverageScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      srsSectionsCovered: {
        type: [String],
        default: [],
      },
      srsSectionsMissing: {
        type: [String],
        default: [],
      },
      coverageAnalysis: {
        type: String,
        default: null,
      },
      recommendations: {
        type: [String],
        default: [],
      },
      evaluatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

featureSchema.index({ projectId: 1, status: 1 });
featureSchema.index({ priority: 1 });
// Compound unique index to prevent duplicate feature names within the same project
featureSchema.index({ projectId: 1, name: 1 }, { 
  unique: true,
  partialFilterExpression: { name: { $exists: true } }
});

featureSchema.virtual("testCasesCount", {
  ref: "TestCase",
  localField: "_id",
  foreignField: "featureId",
  count: true,
});

featureSchema.virtual("bugsCount", {
  ref: "Bug",
  localField: "_id",
  foreignField: "featureId",
  count: true,
});

featureSchema.set("toJSON", { virtuals: true });
featureSchema.set("toObject", { virtuals: true });

export const Feature = mongoose.model("Feature", featureSchema);