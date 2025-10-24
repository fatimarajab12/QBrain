// hooks/useFeatures.ts
import { useState, useEffect } from 'react';
import { Feature } from '@/types/feature';
import { featureService } from '@/services/feature.service';
import { useToast } from '@/hooks/use-toast';

export const useFeatures = (projectId?: string) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchFeatures(parseInt(projectId));
    }
  }, [projectId]);

  const fetchFeatures = async (projectId: number) => {
    try {
      setIsLoading(true);
      const featuresData = await featureService.fetchFeatures(projectId);
      setFeatures(featuresData);
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

  return {
    features,
    isLoading,
    isCreating,
    fetchFeatures,
    createFeature,
    updateFeatureStatus,
  };
};