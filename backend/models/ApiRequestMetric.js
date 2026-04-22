import mongoose from "mongoose";

const apiRequestMetricSchema = new mongoose.Schema(
  {
    // UTC day bucket at 00:00:00.000Z
    day: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    authenticated: {
      type: Number,
      default: 0,
    },
    admin: {
      type: Number,
      default: 0,
    },

    // latency / status breakdown (best-effort)
    totalDurationMs: {
      type: Number,
      default: 0,
    },
    ok: {
      type: Number,
      default: 0,
    },
    clientError: {
      type: Number,
      default: 0,
    },
    serverError: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const ApiRequestMetric = mongoose.model("ApiRequestMetric", apiRequestMetricSchema);


