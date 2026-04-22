import mongoose from "mongoose";

const dailyActiveUserSchema = new mongoose.Schema(
  {
    // UTC day bucket at 00:00:00.000Z
    day: {
      type: Date,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure one record per user per day (for exact DAU)
dailyActiveUserSchema.index({ day: 1, userId: 1 }, { unique: true });

export const DailyActiveUser = mongoose.model("DailyActiveUser", dailyActiveUserSchema);


