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

export const Project = mongoose.model("Project", projectSchema);