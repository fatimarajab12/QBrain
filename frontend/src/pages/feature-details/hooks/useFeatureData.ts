import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { featureService } from "@/services/feature.service";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/feature";
import { Bug } from "@/types/bug";
import { logger } from "@/utils/logger";

export const useFeatureData = (featureId: string | undefined) => {
  const { toast } = useToast();

  const { data: feature, isLoading: isLoadingFeature, error: featureError } = useQuery<Feature | null>({
    queryKey: ['feature', featureId],
    queryFn: () => featureId ? featureService.getFeature(featureId) : null,
    enabled: !!featureId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: bugs = [], isLoading: isLoadingBugs, error: bugsError } = useQuery<Bug[]>({
    queryKey: ['feature-bugs', featureId],
    queryFn: () => featureId ? bugService.getFeatureBugs(featureId) : [],
    enabled: !!featureId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (featureError) {
      logger.error("Error fetching feature", featureError);
      toast({
        title: "Error",
        description: "Failed to load feature details",
        variant: "destructive",
      });
    }
  }, [featureError, toast]);

  useEffect(() => {
    if (bugsError) {
      logger.error("Error fetching bugs", bugsError);
      toast({
        title: "Error",
        description: bugsError instanceof Error ? bugsError.message : "Failed to load bugs",
        variant: "destructive",
      });
    }
  }, [bugsError, toast]);

  const [isUpdatingPriority, setIsUpdatingPriority] = useState(false);
  const queryClient = useQueryClient();

  const handlePriorityChange = useCallback(async (newPriority: "High" | "Medium" | "Low") => {
    if (!feature || !featureId) return;
    
    setIsUpdatingPriority(true);
    
    // Optimistic update
    const previousFeature = queryClient.getQueryData<Feature>(['feature', featureId]);
    queryClient.setQueryData<Feature>(['feature', featureId], (old) => 
      old ? { ...old, priority: newPriority } : old
    );
    
    try {
      const featureData = feature as Feature;
      await featureService.updateFeature(featureId, {
        name: featureData.name,
        description: featureData.description,
        priority: newPriority,
      });
      
      // Invalidate to refresh from server
      queryClient.invalidateQueries({ queryKey: ['feature', featureId] });
      
      toast({
        title: "Success",
        description: `Priority updated to ${newPriority}`,
      });
    } catch (error) {
      // Rollback on error
      if (previousFeature) {
        queryClient.setQueryData(['feature', featureId], previousFeature);
      }
      logger.error("Error updating priority:", error);
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPriority(false);
    }
  }, [feature, featureId, toast, queryClient]);

  return {
    feature: feature || null,
    isLoadingFeature,
    bugs: bugs as Bug[],
    isLoadingBugs,
    isUpdatingPriority,
    handlePriorityChange,
  };
};

