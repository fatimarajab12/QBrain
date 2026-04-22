import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    srsDocument: {
      fileName: String,
      filePath: String,
      uploadedAt: Date,
      processed: Boolean,
      chunksCount: Number,
    },
    vectorCollectionName: String,
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1 });
projectSchema.index({ status: 1 });

// Virtual fields for counts
projectSchema.virtual("featuresCount", {
  ref: "Feature",
  localField: "_id",
  foreignField: "projectId",
  count: true,
});

projectSchema.virtual("testCasesCount", {
  ref: "TestCase",
  localField: "_id",
  foreignField: "projectId",
  count: true,
});

projectSchema.virtual("bugsCount", {
  ref: "Bug",
  localField: "_id",
  foreignField: "projectId",
  count: true,
});

projectSchema.set("toJSON", { virtuals: true });
projectSchema.set("toObject", { virtuals: true });

export const Project = mongoose.model("Project", projectSchema);