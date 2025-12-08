import mongoose from "mongoose";
import { Feature } from "../models/Feature.js";
import { Project } from "../models/Project.js";
import { generateFeaturesFromRAG } from "../ai/ragService.js";
import { vectorStore } from "../vector/vectorStore.js";
import { Document } from "@langchain/core/documents";


function validateObjectId(id, fieldName = "ID") {
  if (!id) return null;
  
  if (mongoose.Types.ObjectId.isValid(id) && id.toString().length === 24) {
    return id;
  }
  
  throw new Error(`Invalid ${fieldName}: Must be a valid MongoDB ObjectId (24 hex characters)`);
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

    return feature;
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

    return feature;
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
    const id = validateObjectId(projectId, "Project ID");
    
    const project = await Project.findById(id).select("_id");
    if (!project) {
      throw new Error("Project not found");
    }

    const features = await Feature.find({ projectId: id })
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    return features;
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

    const feature = await Feature.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

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

    return feature;
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
    for (const featureData of generatedFeatures) {
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