/**
 * Performance Metrics Service
 * Tracks and calculates performance metrics like Recall@K, Precision, Accuracy
 */

import mongoose from "mongoose";
import { PerformanceMetric } from "../models/PerformanceMetric.js";

export function calculateRecallAtK(rankedItems, relevantItems, k) {
  if (!rankedItems || rankedItems.length === 0) return 0;
  if (!relevantItems || relevantItems.length === 0) return 0;

  // Get top K items
  const topK = rankedItems.slice(0, k);

  const relevantInTopK = topK.filter(item => {
    return relevantItems.some(relevant => 
      relevant.id === item.id || 
      relevant._id === item._id ||
      relevant.name === item.name
    );
  }).length;

  const recall = relevantInTopK / relevantItems.length;
  return Math.round(recall * 100) / 100;
}


export function calculatePrecisionAtK(rankedItems, relevantItems, k) {
  if (!rankedItems || rankedItems.length === 0) return 0;
  if (k === 0) return 0;

  const topK = rankedItems.slice(0, k);
  const relevantInTopK = topK.filter(item => {
    return relevantItems.some(relevant => 
      relevant.id === item.id || 
      relevant._id === item._id ||
      relevant.name === item.name
    );
  }).length;

  const precision = relevantInTopK / k;
  return Math.round(precision * 100) / 100;
}


export function calculateAllRecallMetrics(rankedItems, relevantItems) {
  return {
    recallAt1: calculateRecallAtK(rankedItems, relevantItems, 1),
    recallAt5: calculateRecallAtK(rankedItems, relevantItems, 5),
    recallAt10: calculateRecallAtK(rankedItems, relevantItems, 10),
  };
}


export function calculateAccuracy(generatedItems, approvedItems) {
  if (!generatedItems || generatedItems.length === 0) return 0;

  const accuracy = approvedItems.length / generatedItems.length;
  return Math.round(accuracy * 100) / 100;
}


export async function trackPerformanceMetrics(projectId, type, metrics) {
  try {
    // Convert projectId to ObjectId if it's a string
    const projectIdObject = mongoose.Types.ObjectId.isValid(projectId)
      ? new mongoose.Types.ObjectId(projectId)
      : projectId;

    // Save to MongoDB
    const performanceMetric = new PerformanceMetric({
      projectId: projectIdObject,
      type,
      recallAt1: metrics.recallAt1 || 0,
      recallAt5: metrics.recallAt5 || 0,
      recallAt10: metrics.recallAt10 || 0,
      accuracy: metrics.accuracy || 0,
      precisionAt5: metrics.precisionAt5 || 0,
      precisionAt10: metrics.precisionAt10 || 0,
      totalGenerated: metrics.totalGenerated || 0,
      totalApproved: metrics.totalApproved || 0,
      totalRejected: metrics.totalRejected || 0,
      approvalRate: metrics.approvalRate || 0,
      rejectionRate: metrics.rejectionRate || 0,
    });

    await performanceMetric.save();

    console.log(`[Performance Metrics] Saved to MongoDB - Project: ${projectId}, Type: ${type}`);
    console.log(`  Recall@1: ${metrics.recallAt1 || 'N/A'}`);
    console.log(`  Recall@5: ${metrics.recallAt5 || 'N/A'}`);
    console.log(`  Recall@10: ${metrics.recallAt10 || 'N/A'}`);
    console.log(`  Accuracy: ${metrics.accuracy || 'N/A'}`);
    console.log(`  Precision@5: ${metrics.precisionAt5 || 'N/A'}`);

    return performanceMetric;
  } catch (error) {
    console.error("Error saving performance metrics to MongoDB:", error);
    // Don't throw error, just log it and return the metrics object
    console.log(`[Performance Metrics] Project: ${projectId}, Type: ${type}`);
    console.log(`  Recall@1: ${metrics.recallAt1 || 'N/A'}`);
    console.log(`  Recall@5: ${metrics.recallAt5 || 'N/A'}`);
    console.log(`  Recall@10: ${metrics.recallAt10 || 'N/A'}`);
    console.log(`  Accuracy: ${metrics.accuracy || 'N/A'}`);
    console.log(`  Precision@5: ${metrics.precisionAt5 || 'N/A'}`);
    return metrics;
  }
}


export function generatePerformanceReport(rankedItems, approvedItems, rejectedItems = []) {
  const recallMetrics = calculateAllRecallMetrics(rankedItems, approvedItems);
  const accuracy = calculateAccuracy(rankedItems, approvedItems);
  const precisionAt5 = calculatePrecisionAtK(rankedItems, approvedItems, 5);
  const precisionAt10 = calculatePrecisionAtK(rankedItems, approvedItems, 10);

  return {
    ...recallMetrics,
    accuracy,
    precisionAt5,
    precisionAt10,
    totalGenerated: rankedItems.length,
    totalApproved: approvedItems.length,
    totalRejected: rejectedItems.length,
    approvalRate: accuracy,
    rejectionRate: rankedItems.length > 0 ? rejectedItems.length / rankedItems.length : 0,
  };
}


export async function getPerformanceMetricsHistory(projectId, type, limit = 10) {
  try {
    const projectIdObject = mongoose.Types.ObjectId.isValid(projectId)
      ? new mongoose.Types.ObjectId(projectId)
      : projectId;

    const metrics = await PerformanceMetric.find({
      projectId: projectIdObject,
      type,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return metrics;
  } catch (error) {
    console.error("Error getting performance metrics history:", error);
    return [];
  }
}


export async function getAveragePerformanceMetrics(projectId, type) {
  try {
    const projectIdObject = mongoose.Types.ObjectId.isValid(projectId)
      ? new mongoose.Types.ObjectId(projectId)
      : projectId;

    const result = await PerformanceMetric.aggregate([
      {
        $match: {
          projectId: projectIdObject,
          type,
        },
      },
      {
        $group: {
          _id: null,
          avgRecallAt1: { $avg: "$recallAt1" },
          avgRecallAt5: { $avg: "$recallAt5" },
          avgRecallAt10: { $avg: "$recallAt10" },
          avgAccuracy: { $avg: "$accuracy" },
          avgPrecisionAt5: { $avg: "$precisionAt5" },
          totalRecords: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        avgRecallAt1: 0,
        avgRecallAt5: 0,
        avgRecallAt10: 0,
        avgAccuracy: 0,
        avgPrecisionAt5: 0,
        totalRecords: 0,
      };
    }

    return result[0];
  } catch (error) {
    console.error("Error getting average performance metrics:", error);
    return null;
  }
}

