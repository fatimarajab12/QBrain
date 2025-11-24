import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [200, "Project name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active",
    },
    srsDocument: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      processed: {
        type: Boolean,
        default: false,
      },
      chunksCount: {
        type: Number,
        default: 0,
      },
    },
    vectorCollectionName: {
      type: String,
      default: null,
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

// Indexes for performance
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ projectId: 1 });

// Virtual for features count
projectSchema.virtual("featuresCount", {
  ref: "Feature",
  localField: "_id",
  foreignField: "projectId",
  count: true,
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

export const Project = mongoose.model("Project", projectSchema);

