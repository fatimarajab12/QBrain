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
  const fetchFeatures = async (projectId: string) => {
    try {
      setIsLoading(true);
      const featuresData = await featureService.fetchFeatures(parseInt(projectId));
      //state to save data 
      setFeatures(featuresData);
      
      //
      
      const hasAIFeatures = featuresData.some(feature => 
        feature.name.includes('AI Generated') || feature.description.includes('AI Generated')
      );
      setHasAIGeneratedFeatures(hasAIFeatures);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: "Error",
        description: "Failed to load project features",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFeature = async (featureData: { name: string; description: string }) => {
    if (!projectId) return;
    
    setIsCreating(true);
    try {
      const createdFeature = await featureService.createFeature(parseInt(projectId), featureData);
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
      
      if (!requirementsText) {
        toast({
          title: "Extracting Text",
          description: "Extracting text from document...",
        });
        requirementsText = await extractTextFromFile(file);
      }

      // Step 1: Analyze requirements with AI
      toast({
        title: "Analyzing Requirements",
        description: "AI is analyzing your requirements...",
      });

      const analysisResult = await featureService.analyzeRequirements(requirementsText);
      
      // Step 2: Create features from AI analysis
      toast({
        title: "Creating Features",
        description: "Generating features and test cases...",
      });

      const createdFeatures = await featureService.createAIFeatures(
        parseInt(projectId), 
        analysisResult.features
      );

      // Step 3: Update state
      setFeatures(prev => [...prev, ...createdFeatures]);
      setHasAIGeneratedFeatures(true);

      toast({
        title: "Success!",
        description: `Generated ${createdFeatures.length} features with AI`,
      });

      return createdFeatures;
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
  };
};