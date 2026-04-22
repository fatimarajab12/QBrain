import { useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feature } from '@/types/feature';
import { featureService } from '@/services/feature.service';
import { useToast } from '@/hooks/use-toast';

type FeatureType = "FUNCTIONAL" | "DATA" | "DATA_MODEL" | "WORKFLOW" | "QUALITY" | "INTERFACE" | "REPORT" | "CONSTRAINT" | "NOTIFICATION";
type FeaturePriority = "High" | "Medium" | "Low";
type FeatureStatus = Feature["status"];

interface CreateFeatureData {
  name: string;
  description: string;
  priority?: FeaturePriority;
  featureType?: FeatureType;
  acceptanceCriteria?: string[];
  matchedSections?: string[];
  reasoning?: string;
}

interface UpdateFeatureData {
  name: string;
  description: string;
}

export const useFeatures = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: features = [], 
    isLoading, 
    error: featuresError 
  } = useQuery<Feature[]>({
    queryKey: ['features', projectId],
    queryFn: () => projectId ? featureService.fetchFeatures(projectId) : [],
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (featuresError) {
      toast({
        title: "Error",
        description: "Failed to load project features",
        variant: "destructive",
      });
    }
  }, [featuresError, toast]);

  const hasAIGeneratedFeatures = useMemo(() => 
    features.some(feature => feature.isAIGenerated), 
    [features]
  );

  const createFeatureMutation = useMutation({
    mutationFn: async ({ projectId, featureData }: { 
      projectId: string; 
      featureData: CreateFeatureData;
    }) => {
      return await featureService.createFeature(projectId, featureData);
    },
    onMutate: async ({ featureData }) => {
      await queryClient.cancelQueries({ queryKey: ['features', projectId] });
      const previousFeatures = queryClient.getQueryData<Feature[]>(['features', projectId]);
      
      const tempId = `temp-${Date.now()}`;
      const optimisticFeature: Feature = {
        _id: tempId,
        name: featureData.name,
        description: featureData.description,
        priority: featureData.priority || "Medium",
        status: "pending",
        featureType: featureData.featureType as Feature["featureType"],
        acceptanceCriteria: featureData.acceptanceCriteria,
        matchedSections: featureData.matchedSections,
        projectId: projectId!,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Feature[]>(['features', projectId], (old = []) => [...old, optimisticFeature]);
      
      return { previousFeatures, tempId };
    },
    onError: (error, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(['features', projectId], context.previousFeatures);
      }
      toast({
        title: "Error Creating Feature",
        description: error instanceof Error ? error.message : "Failed to create feature",
        variant: "destructive",
      });
    },
    onSuccess: (createdFeature, variables, context) => {
      if (context?.tempId) {
        queryClient.setQueryData<Feature[]>(['features', projectId], (old = []) => 
          old.map(f => f._id === context.tempId ? createdFeature : f)
        );
      }
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
      toast({
        title: "Success",
        description: `Feature "${createdFeature.name}" created successfully`,
      });
    },
  });

  const updateFeatureStatusMutation = useMutation({
    mutationFn: async ({ featureId, status }: { featureId: string; status: FeatureStatus }) => {
      return await featureService.updateFeatureStatus(featureId, status);
    },
    onMutate: async ({ featureId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['features', projectId] });
      const previousFeatures = queryClient.getQueryData<Feature[]>(['features', projectId]);
      
      queryClient.setQueryData<Feature[]>(['features', projectId], (old = []) =>
        old.map(f => f._id === featureId ? { ...f, status } : f)
      );
      
      return { previousFeatures };
    },
    onError: (error, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(['features', projectId], context.previousFeatures);
      }
      toast({
        title: "Error",
        description: "Failed to update feature status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature status updated successfully",
      });
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, featureData }: { 
      featureId: string; 
      featureData: UpdateFeatureData;
    }) => {
      return await featureService.updateFeature(featureId, featureData);
    },
    onMutate: async ({ featureId, featureData }) => {
      await queryClient.cancelQueries({ queryKey: ['features', projectId] });
      const previousFeatures = queryClient.getQueryData<Feature[]>(['features', projectId]);
      
      queryClient.setQueryData<Feature[]>(['features', projectId], (old = []) =>
        old.map(f => f._id === featureId ? { ...f, ...featureData } : f)
      );
      
      return { previousFeatures };
    },
    onError: (error, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(['features', projectId], context.previousFeatures);
      }
      toast({
        title: "Error",
        description: "Failed to update feature",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature updated successfully",
      });
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      await featureService.deleteFeature(featureId);
      return featureId;
    },
    onMutate: async (featureId) => {
      await queryClient.cancelQueries({ queryKey: ['features', projectId] });
      const previousFeatures = queryClient.getQueryData<Feature[]>(['features', projectId]);
      
      queryClient.setQueryData<Feature[]>(['features', projectId], (old = []) =>
        old.filter(f => f._id !== featureId)
      );
      
      return { previousFeatures };
    },
    onError: (error, variables, context) => {
      if (context?.previousFeatures) {
        queryClient.setQueryData(['features', projectId], context.previousFeatures);
      }
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Feature deleted successfully",
      });
    },
  });

  const generateFeaturesFromAIMutation = useMutation({
    mutationFn: async ({ projectId, file, extractedText }: { 
      projectId: string; 
      file?: File; 
      extractedText?: string;
    }) => {
      return await featureService.generateAIFeatures(
        projectId,
        extractedText ? { requirementsText: extractedText } : {}
      );
    },
  });

  const generateFeaturesFromSRSMutation = useMutation({
    mutationFn: async ({ projectId, options }: { 
      projectId: string; 
      options?: Record<string, unknown>;
    }) => {
      return await featureService.generateAIFeatures(projectId, options);
    },
  });

  const approveFeaturesMutation = useMutation({
    mutationFn: async ({ projectId, approvedFeatures }: { 
      projectId: string; 
      approvedFeatures: Feature[];
    }) => {
      const existingFeatures = await featureService.fetchFeatures(projectId);
      const existingNames = new Set(
        existingFeatures.map(f => f.name.toLowerCase().trim())
      );

      const uniqueFeaturesToCreate = approvedFeatures.filter(feature => {
        const normalizedName = feature.name.toLowerCase().trim();
        return !existingNames.has(normalizedName);
      });

      if (uniqueFeaturesToCreate.length === 0) {
        return [];
      }

      const featuresToCreate = uniqueFeaturesToCreate.map(feature => ({
        name: feature.name,
        description: feature.description,
        priority: feature.priority || "Medium",
        isAIGenerated: true,
        acceptanceCriteria: feature.acceptanceCriteria || [],
      }));

      return await featureService.createAIFeatures(projectId, featuresToCreate);
    },
    onSuccess: (createdFeatures) => {
      queryClient.invalidateQueries({ queryKey: ['features', projectId] });
      toast({
        title: "Success!",
        description: `Approved and added ${createdFeatures.length} feature(s) successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve features",
        variant: "destructive",
      });
    },
  });

  const createFeature = useCallback(async (featureData: CreateFeatureData) => {
    if (!projectId) {
      const errorMsg = "Project ID is missing. Please ensure you are creating the feature within a valid project.";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      throw new Error(errorMsg);
    }
    
    return await createFeatureMutation.mutateAsync({ projectId, featureData });
  }, [projectId, createFeatureMutation, toast]);

  const updateFeatureStatus = useCallback(async (featureId: string, status: FeatureStatus) => {
    return await updateFeatureStatusMutation.mutateAsync({ featureId, status });
  }, [updateFeatureStatusMutation]);

  const updateFeature = useCallback(async (featureId: string, featureData: UpdateFeatureData) => {
    return await updateFeatureMutation.mutateAsync({ featureId, featureData });
  }, [updateFeatureMutation]);

  const deleteFeature = useCallback(async (featureId: string) => {
    return await deleteFeatureMutation.mutateAsync(featureId);
  }, [deleteFeatureMutation]);

  const generateFeaturesFromAI = useCallback(async (file: File, extractedText?: string) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let requirementsText = extractedText;
      
      if (!requirementsText && file) {
        toast({
          title: "Extracting Text",
          description: "Extracting text from document...",
        });
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          requirementsText = await file.text();
        } else {
          requirementsText = "File content extraction placeholder - please paste your requirements text directly for now.";
        }
      }

      const generatedFeatures = await generateFeaturesFromAIMutation.mutateAsync({
        projectId,
        file,
        extractedText: requirementsText,
      });
      
      if (generatedFeatures && generatedFeatures.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['features', projectId] });
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate features",
        variant: "destructive",
      });
      throw error;
    }
  }, [projectId, generateFeaturesFromAIMutation, queryClient, toast]);

  const generateFeaturesFromSRS = useCallback(async (options?: Record<string, unknown>) => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating Features",
        description: "AI is generating features from SRS document...",
      });

      return await generateFeaturesFromSRSMutation.mutateAsync({ projectId, options });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate features from SRS",
        variant: "destructive",
      });
      throw error;
    }
  }, [projectId, generateFeaturesFromSRSMutation, toast]);

  const approveFeatures = useCallback(async (approvedFeatures: Feature[]) => {
    if (!projectId || approvedFeatures.length === 0) return;

    if (approveFeaturesMutation.isPending) {
      return;
    }

    const createdFeatures = await approveFeaturesMutation.mutateAsync({ 
      projectId, 
      approvedFeatures 
    });

    if (createdFeatures.length === 0) {
      toast({
        title: "No New Features",
        description: "All selected features already exist in the project.",
        variant: "destructive",
      });
    } else if (createdFeatures.length < approvedFeatures.length) {
      toast({
        title: "Some Features Skipped",
        description: `${approvedFeatures.length - createdFeatures.length} feature(s) were skipped because they already exist.`,
      });
    }

    return [];
  }, [projectId, approveFeaturesMutation, toast]);

  return {
    features,
    isLoading,
    isCreating: createFeatureMutation.isPending,
    isGeneratingAI: generateFeaturesFromAIMutation.isPending || generateFeaturesFromSRSMutation.isPending,
    hasAIGeneratedFeatures,
    createFeature,
    updateFeatureStatus,
    updateFeature,
    deleteFeature,
    generateFeaturesFromAI,
    generateFeaturesFromSRS,
    approveFeatures,
  };
};
