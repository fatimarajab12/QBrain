import mongoose from "mongoose";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";
import { vectorStore } from "../vector/vectorStore.js";
import { Document } from "@langchain/core/documents";


function validateObjectId(id, fieldName = "ID") {
  if (!id) {
    throw new Error(`${fieldName} is required`);
  }
  
  // Convert to string if it's not already
  const idString = id.toString().trim();
  
  // Check if it's a valid ObjectId format (24 hex characters)
  if (mongoose.Types.ObjectId.isValid(idString) && idString.length === 24) {
    // Return as string - mongoose will handle conversion
    return idString;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters). Received: ${idString}`);
}

/**
 * Normalizes priority values to match the Feature model enum
 * Converts "Critical" to "High" and ensures valid enum values
 */
function normalizePriority(priority) {
  if (!priority) return "Medium";
  
  const normalized = priority.trim();
  
  // Map Critical to High
  if (normalized === "Critical" || normalized === "critical" || normalized === "CRITICAL") {
    return "High";
  }
  
  // Ensure it's a valid enum value
  const validPriorities = ["High", "Medium", "Low"];
  if (validPriorities.includes(normalized)) {
    return normalized;
  }
  
  // Default to Medium if invalid
  console.warn(`Invalid priority value "${priority}", defaulting to "Medium"`);
  return "Medium";
}

export async function createFeature(featureData) {
  try {
    // If featureType is provided, add it to metadata
    const { featureType, ...restFeatureData } = featureData;
    
    // Normalize priority before creating feature
    if (restFeatureData.priority) {
      restFeatureData.priority = normalizePriority(restFeatureData.priority);
    }
    
    // Check if feature with same name already exists in the project
    if (restFeatureData.projectId && restFeatureData.name) {
      const existingFeature = await Feature.findOne({
        projectId: restFeatureData.projectId,
        name: restFeatureData.name.trim()
      });
      
      if (existingFeature) {
        // If it's an AI-generated feature and we're trying to create another one with same name,
        // append a suffix to make it unique
        if (restFeatureData.isAIGenerated && existingFeature.isAIGenerated) {
          let counter = 1;
          let newName = `${restFeatureData.name.trim()} (${counter})`;
          
          // Keep checking until we find a unique name
          while (await Feature.findOne({ 
            projectId: restFeatureData.projectId, 
            name: newName 
          })) {
            counter++;
            newName = `${restFeatureData.name.trim()} (${counter})`;
          }
          
          restFeatureData.name = newName;
          console.log(`Feature name "${restFeatureData.name.trim()}" already exists. Using "${newName}" instead.`);
        } else {
          // For manual features or when trying to create manual feature with existing name
          throw new Error(`A feature with the name "${restFeatureData.name.trim()}" already exists in this project. Please use a different name or update the existing feature.`);
        }
      }
    }
    
    const feature = new Feature({
      ...restFeatureData,
    });

    // Add featureType to metadata if provided
    if (featureType) {
      if (!feature.metadata) {
        feature.metadata = new Map();
      }
      feature.metadata.set('featureType', featureType);
    }

    await feature.save();

    // Add all features (both manual and AI-generated) to vector database for chatbot support
    try {
      const projectId = feature.projectId.toString();
      
      // Create feature content for vector database
      const featureContent = `Feature: ${feature.name}\n\nDescription: ${feature.description}\n\nPriority: ${feature.priority}\n\nStatus: ${feature.status}\n\nAcceptance Criteria: ${(feature.acceptanceCriteria || []).join(", ")}`;
      
      const featureDocument = new Document({
        pageContent: featureContent,
        metadata: {
          projectId: projectId,
          source: "Feature",
          featureId: feature._id.toString(),
          type: "feature",
          isAIGenerated: feature.isAIGenerated || false,
          createdAt: new Date().toISOString(),
        },
      });

      // Add to vector database
      await vectorStore.upsertDocument(
        projectId,
        featureDocument,
        null, // embedding will be generated automatically
        { featureId: feature._id.toString(), type: "feature" }
      );

      console.log(`Added feature ${feature._id} to vector database`);
    } catch (vectorError) {
      // Log error but don't fail the creation
      console.error("Error adding feature to vector database:", vectorError);
    }

    // Calculate counts for the new feature
    const { TestCase } = await import("../models/TestCase.js");
    const { Bug } = await import("../models/Bug.js");
    
    const testCasesCount = await TestCase.countDocuments({ featureId: feature._id });
    const bugsCount = await Bug.countDocuments({ featureId: feature._id });
    
    // Convert to plain object and add counts
    const featureObj = feature.toObject();
    return {
      ...featureObj,
      testCasesCount,
      bugsCount,
    };
  } catch (error) {
    console.error("Error creating feature:", error);
    throw error;
  }
}

export async function getFeatureById(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    const feature = await Feature.findById(id)
      .populate("projectId", "_id name")
      .lean();

    if (!feature) {
      return null;
    }

    // Calculate counts
    const { TestCase } = await import("../models/TestCase.js");
    const { Bug } = await import("../models/Bug.js");
    
    const testCasesCount = await TestCase.countDocuments({ featureId: id });
    const bugsCount = await Bug.countDocuments({ featureId: id });
    
    return {
      ...feature,
      testCasesCount,
      bugsCount,
    };
  } catch (error) {
    console.error("Error getting feature:", error);
    throw error;
  }
}

export async function hasAIGeneratedFeatures(projectId) {
  try {
    const projectIdObj = validateObjectId(projectId, "Project ID");
    const count = await Feature.countDocuments({ 
      projectId: projectIdObj,
      isAIGenerated: true 
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking AI-generated features:", error);
    throw error;
  }
}

export async function getProjectFeatures(projectId) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] getProjectFeatures called with projectId:", projectId);
    }
    
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id userId");
    
    if (!project) {
      if (process.env.NODE_ENV === 'development') {
        console.error("[ERROR] Project not found with ID:", id.toString());
      }
      throw new Error("Project not found");
    }

    const features = await Feature.find({ projectId: id })
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    // Calculate counts for each feature using aggregation
    const { TestCase } = await import("../models/TestCase.js");
    const { Bug } = await import("../models/Bug.js");
    
    const featureIds = features.map(f => f._id);
    
    // Get test case counts
    const testCaseCounts = await TestCase.aggregate([
      { $match: { featureId: { $in: featureIds } } },
      { $group: { _id: "$featureId", count: { $sum: 1 } } }
    ]);
    
    // Get bug counts
    const bugCounts = await Bug.aggregate([
      { $match: { featureId: { $in: featureIds } } },
      { $group: { _id: "$featureId", count: { $sum: 1 } } }
    ]);
    
    // Create maps for quick lookup
    const testCaseCountMap = new Map(testCaseCounts.map(tc => [tc._id.toString(), tc.count]));
    const bugCountMap = new Map(bugCounts.map(b => [b._id.toString(), b.count]));
    
    // Add counts to features
    const featuresWithCounts = features.map(feature => ({
      ...feature,
      testCasesCount: testCaseCountMap.get(feature._id.toString()) || 0,
      bugsCount: bugCountMap.get(feature._id.toString()) || 0,
    }));

    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] Found", featuresWithCounts.length, "features for project:", id);
    }
    
    return featuresWithCounts;
  } catch (error) {
    console.error("Error getting project features:", error);
    throw error;
  }
}

export async function updateFeature(featureId, updateData) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Get the feature before update to check if it was AI-generated
    const existingFeature = await Feature.findById(id);
    if (!existingFeature) {
      throw new Error("Feature not found");
    }

    if (updateData.projectId) {
      updateData.projectId = validateObjectId(updateData.projectId, "Project ID");
      
      const project = await Project.findById(updateData.projectId).select("_id");
      if (!project) {
        throw new Error("Project not found");
      }
    }

    // Normalize priority if provided
    if (updateData.priority) {
      updateData.priority = normalizePriority(updateData.priority);
    }

    // Handle reasoning deletion (if set to null, remove it from database)
    const updateQuery = { $set: {} };
    const unsetQuery = { $unset: {} };
    
    for (const [key, value] of Object.entries(updateData)) {
      if (value === null && key === 'reasoning') {
        // Remove reasoning field from database
        unsetQuery.$unset[key] = "";
      } else {
        updateQuery.$set[key] = value;
      }
    }

    // Build final update query
    const finalUpdate = {};
    if (Object.keys(updateQuery.$set).length > 0) {
      Object.assign(finalUpdate, updateQuery);
    }
    if (Object.keys(unsetQuery.$unset).length > 0) {
      if (finalUpdate.$set) {
        finalUpdate.$unset = unsetQuery.$unset;
      } else {
        Object.assign(finalUpdate, unsetQuery);
      }
    }

    // Use the appropriate update query
    let feature;
    if (Object.keys(finalUpdate).length > 0) {
      feature = await Feature.findByIdAndUpdate(
        id,
        finalUpdate,
        { new: true, runValidators: true }
      );
    } else {
      feature = await Feature.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    // Update all features (both manual and AI-generated) in vector database for chatbot support
    try {
      // Handle projectId whether it's an ObjectId or populated object
      const projectId = typeof feature.projectId === 'object' && feature.projectId._id 
        ? feature.projectId._id.toString() 
        : feature.projectId.toString();
      
      // Create feature content for vector database
      const featureContent = `Feature: ${feature.name}\n\nDescription: ${feature.description}\n\nPriority: ${feature.priority}\n\nStatus: ${feature.status}\n\nAcceptance Criteria: ${(feature.acceptanceCriteria || []).join(", ")}`;
      
      const featureDocument = new Document({
        pageContent: featureContent,
        metadata: {
          projectId: projectId,
          source: "Feature",
          featureId: feature._id.toString(),
          type: "feature",
          isAIGenerated: feature.isAIGenerated || false,
          updatedAt: new Date().toISOString(),
        },
      });

      // Update or insert in vector database
      await vectorStore.upsertDocument(
        projectId,
        featureDocument,
        null, // embedding will be generated automatically
        { featureId: feature._id.toString(), type: "feature" }
      );

      console.log(`Updated feature ${feature._id} in vector database`);
    } catch (vectorError) {
      // Log error but don't fail the update
      console.error("Error updating feature in vector database:", vectorError);
    }

    // Calculate counts for the updated feature
    const { TestCase } = await import("../models/TestCase.js");
    const { Bug } = await import("../models/Bug.js");
    
    const testCasesCount = await TestCase.countDocuments({ featureId: feature._id });
    const bugsCount = await Bug.countDocuments({ featureId: feature._id });
    
    // Convert to plain object and add counts
    const featureObj = feature.toObject();
    return {
      ...featureObj,
      testCasesCount,
      bugsCount,
    };
  } catch (error) {
    console.error("Error updating feature:", error);
    throw error;
  }
}

export async function deleteFeature(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Get feature before deletion to check if it was AI-generated
    const feature = await Feature.findById(id);
    if (!feature) {
      return { success: false, message: "Feature not found" };
    }

    const { TestCase } = await import("../models/TestCase.js");
    await TestCase.deleteMany({ featureId: id });
    
    await Feature.findByIdAndDelete(id);

    // Delete all features (both manual and AI-generated) from vector database for chatbot support
    try {
      const projectId = feature.projectId.toString();
      
      // Delete from vector database
      await vectorStore.deleteDocumentsByMetadata(projectId, {
        featureId: feature._id.toString(),
        type: "feature"
      });

      console.log(`Deleted feature ${feature._id} from vector database`);
    } catch (vectorError) {
      // Log error but don't fail the deletion
      console.error("Error deleting feature from vector database:", vectorError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting feature:", error);
    throw error;
  }
}

export async function generateFeaturesFromSRS(projectId, options = {}) {
  try {
    const id = validateObjectId(projectId, "Project ID");

    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.srsDocument?.processed) {
      throw new Error("SRS document not processed. Please upload and process SRS first.");
    }

    const generatedFeaturesResult = await generateFeaturesFromRAG(project._id.toString(), options);
    
    // Handle both array (backward compatibility) and object (comprehensive retrieval) formats
    const generatedFeatures = Array.isArray(generatedFeaturesResult) 
      ? generatedFeaturesResult 
      : generatedFeaturesResult.features || [];

    const savedFeatures = [];
    const skippedFeatures = [];
    
    for (const featureData of generatedFeatures) {
      try {
        // Extract ranking and explanation data before saving
        const {
          relevanceScore,
          rankingScore,
          matchedChunksCount,
          reasoning,
          matchedSections,
          confidence,
          ...featureFields
        } = featureData;

        // Normalize priority before creating feature
        const normalizedFeatureFields = {
          ...featureFields,
          priority: featureFields.priority ? normalizePriority(featureFields.priority) : "Medium",
        };
        
        // Check if feature with same name already exists (for AI-generated features, we'll add suffix)
        const existingFeature = await Feature.findOne({
          projectId: id,
          name: normalizedFeatureFields.name?.trim()
        });
        
        if (existingFeature && !existingFeature.isAIGenerated) {
          // Skip if manual feature exists with same name
          skippedFeatures.push({
            name: normalizedFeatureFields.name,
            reason: "A manual feature with this name already exists"
          });
          console.log(`Skipping feature "${normalizedFeatureFields.name}" - manual feature with same name exists`);
          continue;
        }
        
        const feature = await createFeature({
          ...normalizedFeatureFields,
          projectId: id,
          isAIGenerated: true,
          aiGenerationContext: JSON.stringify({
            ...options,
            relevanceScore,
            rankingScore,
            matchedChunksCount,
          }),
          reasoning: reasoning || null,
          matchedSections: matchedSections || [],
          confidence: confidence || null,
        });
        savedFeatures.push(feature);
      } catch (error) {
        // If it's a duplicate key error, log and continue
        if (error.code === 11000 || error.message.includes("already exists")) {
          skippedFeatures.push({
            name: featureData.name,
            reason: error.message || "Duplicate feature name"
          });
          console.log(`Skipping duplicate feature "${featureData.name}":`, error.message);
          continue;
        }
        // For other errors, re-throw to stop the process
        throw error;
      }
    }
    
    if (skippedFeatures.length > 0) {
      console.log(`Skipped ${skippedFeatures.length} duplicate features:`, skippedFeatures);
    }

    return savedFeatures;
  } catch (error) {
    console.error("Error generating features from SRS:", error);
    throw error;
  }
}

export async function bulkCreateFeatures(projectId, featuresData) {
  try {
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    // Check for existing features to prevent duplicates
    const existingFeatures = await Feature.find({ projectId: id }).select("name").lean();
    const existingNames = new Set(
      existingFeatures.map(f => f.name.toLowerCase().trim())
    );

    // Filter out duplicates before creating
    const uniqueFeaturesData = featuresData.filter(featureData => {
      const normalizedName = (featureData.name || "").toLowerCase().trim();
      return !existingNames.has(normalizedName);
    });

    if (uniqueFeaturesData.length === 0) {
      console.log("All features already exist, skipping creation");
      return [];
    }

    if (uniqueFeaturesData.length < featuresData.length) {
      console.log(`Filtered out ${featuresData.length - uniqueFeaturesData.length} duplicate features`);
    }

    const features = [];
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (const featureData of uniqueFeaturesData) {
          try {
            // Double-check for duplicates within the transaction
            const normalizedName = (featureData.name || "").toLowerCase().trim();
            const existing = await Feature.findOne({
              projectId: id,
              name: { $regex: new RegExp(`^${normalizedName}$`, "i") }
            }).session(session);

            if (existing) {
              console.log(`Feature "${featureData.name}" already exists, skipping`);
              continue;
            }

            // Extract featureType and add to metadata if provided
            const { featureType, ...restFeatureData } = featureData;
            
            // Normalize priority before creating feature
            if (restFeatureData.priority) {
              restFeatureData.priority = normalizePriority(restFeatureData.priority);
            }
            
            const feature = new Feature({
              ...restFeatureData,
              projectId: id,
            });

            // Add featureType to metadata if provided
            if (featureType) {
              if (!feature.metadata) {
                feature.metadata = new Map();
              }
              feature.metadata.set('featureType', featureType);
            }

            await feature.save({ session });
            features.push(feature);
          } catch (saveError) {
            // Handle duplicate key error gracefully
            if (saveError.code === 11000) {
              console.log(`Feature "${featureData.name}" already exists (duplicate key), skipping`);
              continue;
            }
            throw saveError;
          }
        }
      });
    } finally {
      await session.endSession();
    }

    return features;
  } catch (error) {
    console.error("Error bulk creating features:", error);
    throw error;
  }
}

export async function getTestCasesCount(featureId) {
  try {
    const id = validateObjectId(featureId, "Feature ID");

    // Check if feature exists
    const feature = await Feature.findById(id).select("_id");
    if (!feature) {
      throw new Error("Feature not found");
    }

    // Count test cases for this feature
    const { TestCase } = await import("../models/TestCase.js");
    const count = await TestCase.countDocuments({ featureId: id });

    return {
      featureId: id,
      testCasesCount: count,
    };
  } catch (error) {
    console.error("Error getting test cases count:", error);
    throw error;
  }
}