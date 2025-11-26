import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    featureId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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

featureSchema.index({ projectId: 1, status: 1 });
featureSchema.index({ featureId: 1 });
featureSchema.index({ priority: 1 });

featureSchema.virtual("testCasesCount", {
  ref: "TestCase",
  localField: "_id",
  foreignField: "featureId",
  count: true,
});

featureSchema.set("toJSON", { virtuals: true });
featureSchema.set("toObject", { virtuals: true });

export const Feature = mongoose.model("Feature", featureSchema);