import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { Bug } from "@/types/bug";
import { logger } from "@/utils/logger";

interface UseFeatureBugsProps {
  featureId: string | undefined;
  projectId: string | undefined;
}

type BugStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type BugSeverity = "Low" | "Medium" | "High" | "Critical";

export const useFeatureBugs = ({ featureId, projectId }: UseFeatureBugsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBugMutation = useMutation({
    mutationFn: async (bugData: {
      title: string;
      description?: string;
      severity?: BugSeverity;
      status?: BugStatus;
    }) => {
      if (!featureId || !projectId) {
        throw new Error("Feature ID and Project ID are required");
      }
      return await bugService.createBugForFeature(featureId, projectId, {
        title: bugData.title,
        description: bugData.description,
        severity: bugData.severity || "Medium",
        status: bugData.status || "Open",
      });
    },
    onMutate: async (bugData) => {
      await queryClient.cancelQueries({ queryKey: ['feature-bugs', featureId] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['feature-bugs', featureId]);
      
      const optimisticBug: Bug = {
        _id: `temp-${Date.now()}`,
        title: bugData.title,
        description: bugData.description || '',
        featureId: featureId!,
        projectId: projectId!,
        severity: bugData.severity || 'Medium',
        priority: 'P2',
        status: bugData.status || 'Open',
        stepsToReproduce: [],
        expectedBehavior: '',
        actualBehavior: '',
        reproducibility: 'Sometimes',
        environment: {
          os: '',
          browser: '',
          browserVersion: '',
          appType: 'Web',
          appVersion: '',
          build: '',
        },
        component: '',
        labels: [],
        affectedUrl: '',
        attachments: [],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Bug[]>(['feature-bugs', featureId], (old = []) => [optimisticBug, ...old]);
      
      return { previousBugs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['feature-bugs', featureId], context.previousBugs);
      }
      logger.error("Error adding bug", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bug",
        variant: "destructive",
      });
    },
    onSuccess: (createdBug) => {
      queryClient.setQueryData<Bug[]>(['feature-bugs', featureId], (old = []) => 
        old.map(b => b._id === `temp-${createdBug._id}` ? createdBug : b).filter(b => !b._id.startsWith('temp-'))
      );
      queryClient.invalidateQueries({ queryKey: ['feature-bugs', featureId] });
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      toast({
        title: "Success",
        description: "Bug created successfully",
      });
    },
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: async ({ bugId, status }: { bugId: string; status: BugStatus }) => {
      return await bugService.updateBugStatus(bugId, status);
    },
    onMutate: async ({ bugId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['feature-bugs', featureId] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['feature-bugs', featureId]);
      
      queryClient.setQueryData<Bug[]>(['feature-bugs', featureId], (old = []) =>
        old.map(b => b._id === bugId ? { ...b, status, updatedAt: new Date().toISOString() } : b)
      );
      
      return { previousBugs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['feature-bugs', featureId], context.previousBugs);
      }
      logger.error("Error updating bug status", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bug status",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feature-bugs', featureId] });
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      toast({
        title: "Success",
        description: `Bug status updated to ${variables.status}`,
      });
    },
  });

  const handleAddBug = useCallback(async (bugData: {
    title: string;
    description?: string;
    featureId: string;
    projectId?: string;
    severity?: BugSeverity;
    status?: BugStatus;
  }) => {
    return await createBugMutation.mutateAsync({
      title: bugData.title,
      description: bugData.description,
      severity: bugData.severity,
      status: bugData.status,
    });
  }, [createBugMutation]);

  const handleUpdateBugStatus = useCallback(async (bugId: string, status: BugStatus) => {
    return await updateBugStatusMutation.mutateAsync({ bugId, status });
  }, [updateBugStatusMutation]);

  return {
    handleAddBug,
    handleUpdateBugStatus,
  };
};

