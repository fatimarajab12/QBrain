// hooks/useFeatures.ts
import { useState, useEffect } from 'react';
import { Feature } from '@/types/feature';
import { featureService } from '@/services/feature.service';
import { useToast } from '@/hooks/use-toast';

export const useFeatures = (projectId?: string) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasAIGeneratedFeatures, setHasAIGeneratedFeatures] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchFeatures(projectId); 
    }
  }, [projectId]);

  // fetch data from server 
  const fetchFeatures = async (projectId: string, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const featuresData = await featureService.fetchFeatures(projectId);
      
      // Force state update with a completely new array and objects to ensure re-render
      // Use structuredClone to create deep copy and break any reference equality
      const newFeatures = structuredClone ? structuredClone(featuresData) : featuresData.map(f => ({ ...f }));
      console.log(`[fetchFeatures] Fetched ${newFeatures.length} features, updating state...`);
      setFeatures(newFeatures);
      console.log(`[fetchFeatures] State updated with ${newFeatures.length} features`);
      
      const hasAIFeatures = featuresData.some(feature => 
        feature.isAIGenerated ||
        feature.name.includes('AI Generated') || 
        feature.description.includes('AI Generated')
      );
      setHasAIGeneratedFeatures(hasAIFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      if (showLoading) {
        toast({
          title: "Error",
          description: "Failed to load project features",
          variant: "destructive",
        });
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const createFeature = async (featureData: { 
    name: string; 
    description: string; 
    priority?: "High" | "Medium" | "Low";
    featureType?: "FUNCTIONAL" | "DATA" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
    acceptanceCriteria?: string[];
    matchedSections?: string[];
    reasoning?: string;
  }) => {
    if (!projectId) return;
    
    setIsCreating(true);
    try {
      const createdFeature = await featureService.createFeature(projectId, featureData);
      setFeatures(prev => [...prev, createdFeature]);
      
      toast({
        title: "Success",
        description: "Feature created successfully",
      });
      
      return createdFeature;
    } catch (error) {
      console.error('Error creating feature:', error);
      toast({
        title: "Error",
        description: "Failed to create feature",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateFeatureStatus = async (featureId: number, status: Feature["status"]) => {
    try {
      const updatedFeature = await featureService.updateFeatureStatus(featureId, status);
      setFeatures(prev => prev.map(feature => 
        feature.id === updatedFeature.id ? updatedFeature : feature
      ));

      toast({
        title: "Success",
        description: "Feature status updated successfully",
      });
    } catch (error) {
      console.error('Error updating feature status:', error);
      toast({
        title: "Error",
        description: "Failed to update feature status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFeature = async (featureId: number, featureData: { name: string; description: string }) => {
    try {
      const updatedFeature = await featureService.updateFeature(featureId, featureData);
      setFeatures(prev => prev.map(feature => 
        feature.id === updatedFeature.id ? updatedFeature : feature
      ));

      toast({
        title: "Success",
        description: "Feature updated successfully",
      });
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteFeature = async (featureId: number) => {
    try {
      await featureService.deleteFeature(featureId);
      setFeatures(prev => prev.filter(feature => feature.id !== featureId));

      toast({
        title: "Success",
        description: "Feature deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Helper function for text extraction (simplified version)
  const extractTextFromFile = async (file: File): Promise<string> => {
    // This is a simplified version - in production you'd use proper libraries
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      return await file.text();
    }
    // For other file types, you'd need proper extraction logic
    return "File content extraction placeholder - please paste your requirements text directly for now.";
  };

  const generateFeaturesFromAI = async (file: File, extractedText?: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      // Use extracted text if available, otherwise extract from file
      let requirementsText = extractedText;
      
      if (!requirementsText && file) {
        toast({
          title: "Extracting Text",
          description: "Extracting text from document...",
        });
        requirementsText = await extractTextFromFile(file);
      }

      // Generate features directly from SRS using the backend endpoint
      const generatedFeatures = await featureService.generateAIFeatures(
        projectId,
        requirementsText ? { requirementsText } : {}
      );
      
      if (generatedFeatures && generatedFeatures.length > 0) {
        setFeatures(prev => [...prev, ...generatedFeatures]);
        setHasAIGeneratedFeatures(true);
        
        toast({
          title: "Success!",
          description: `Generated ${generatedFeatures.length} features with AI from SRS`,
        });
        
        return generatedFeatures;
      } else {
        toast({
          title: "No Features Generated",
          description: "No features were generated. Please check your SRS document.",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      console.error('Error generating features with AI:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate features from requirements",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Generate features directly from existing SRS
  const generateFeaturesFromSRS = async (options?: any) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      toast({
        title: "Generating Features",
        description: "AI is generating features from SRS document...",
      });

      const generatedFeatures = await featureService.generateAIFeatures(
        projectId,
        options
      );

      // Don't update state here - features will be approved separately
      return generatedFeatures;
    } catch (error) {
      console.error('Error generating features from SRS:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate features from SRS",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Approve and add generated features
  const approveFeatures = async (approvedFeatures: Feature[]) => {
    if (!projectId || approvedFeatures.length === 0) return;

    // Prevent multiple simultaneous calls
    if (isCreating) {
      console.log('Approval already in progress, skipping...');
      return;
    }

    setIsCreating(true);
    try {
      // First, fetch existing features to check for duplicates
      const existingFeatures = await featureService.fetchFeatures(projectId);
      const existingNames = new Set(
        existingFeatures.map(f => f.name.toLowerCase().trim())
      );

      // Filter out features that already exist (by name)
      const uniqueFeaturesToCreate = approvedFeatures.filter(feature => {
        const normalizedName = feature.name.toLowerCase().trim();
        return !existingNames.has(normalizedName);
      });

      if (uniqueFeaturesToCreate.length === 0) {
        toast({
          title: "No New Features",
          description: "All selected features already exist in the project.",
          variant: "destructive",
        });
        return [];
      }

      if (uniqueFeaturesToCreate.length < approvedFeatures.length) {
        toast({
          title: "Some Features Skipped",
          description: `${approvedFeatures.length - uniqueFeaturesToCreate.length} feature(s) were skipped because they already exist.`,
        });
      }

      // Use bulk create for better performance
      const featuresToCreate = uniqueFeaturesToCreate.map(feature => ({
        name: feature.name,
        description: feature.description,
        priority: feature.priority || "Medium",
        isAIGenerated: true,
        acceptanceCriteria: feature.acceptanceCriteria || [],
      }));

      await featureService.createAIFeatures(
        projectId,
        featuresToCreate
      );

      console.log(`[approveFeatures] Features created, waiting a moment before fetch...`);
      
      // Small delay to ensure database has committed the changes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Immediately fetch all features from server to update state
      // Use fetchFeatures from hook (without loading spinner) to ensure state update
      await fetchFeatures(projectId, false);
      
      console.log(`[approveFeatures] Features fetched and state updated`);

      toast({
        title: "Success!",
        description: `Approved and added ${uniqueFeaturesToCreate.length} feature(s) successfully`,
      });

      return [];
    } catch (error) {
      console.error('Error approving features:', error);
      toast({
        title: "Error",
        description: "Failed to approve features",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    features,
    isLoading,
    isCreating,
    isGeneratingAI,
    hasAIGeneratedFeatures,
    fetchFeatures,
    createFeature,
    updateFeatureStatus,
    updateFeature,
    deleteFeature,
    generateFeaturesFromAI,
    generateFeaturesFromSRS,
    approveFeatures,
  };
};