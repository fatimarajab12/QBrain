import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bug } from '@/types/bug';
import { bugService } from '@/services/bug.service';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

type BugStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type BugSeverity = "Low" | "Medium" | "High" | "Critical";

interface CreateBugData {
  title: string;
  description?: string;
  featureId: string;
  projectId?: string;
  severity?: BugSeverity;
  priority?: "P0" | "P1" | "P2" | "P3";
  status?: BugStatus;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  reproducibility?: "Always" | "Often" | "Sometimes" | "Rare" | "Unable";
  environment?: {
    os?: string;
    browser?: string;
    browserVersion?: string;
    appType?: "Web" | "Mobile" | "API";
    appVersion?: string;
    build?: string;
  };
  component?: string;
  labels?: string[];
  affectedUrl?: string;
  firstOccurrenceDate?: string;
  lastOccurrenceDate?: string;
  attachments?: string[];
}

export const useBugs = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: bugs = [], 
    isLoading, 
    error: bugsError 
  } = useQuery<Bug[]>({
    queryKey: ['bugs', projectId],
    queryFn: () => projectId ? bugService.getProjectBugs(projectId) : [],
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (bugsError) {
      logger.error('Failed to load bugs', bugsError);
      toast({
        title: "Error",
        description: bugsError instanceof Error ? bugsError.message : "Failed to load bugs",
        variant: "destructive",
      });
    }
  }, [bugsError, toast]);

  const createBugMutation = useMutation({
    mutationFn: async ({ bugData, files }: { bugData: CreateBugData; files?: File[] }) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      return await bugService.createBug({
        ...bugData,
        projectId: bugData.projectId || projectId,
      }, files);
    },
    onMutate: async ({ bugData }) => {
      await queryClient.cancelQueries({ queryKey: ['bugs', projectId] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['bugs', projectId]);
      
      const tempId = `temp-${Date.now()}`;
      const optimisticBug: Bug = {
        _id: tempId,
        title: bugData.title,
        description: bugData.description || '',
        featureId: bugData.featureId,
        projectId: bugData.projectId || projectId!,
        severity: bugData.severity || 'Medium',
        priority: bugData.priority || 'P2',
        status: bugData.status || 'Open',
        stepsToReproduce: bugData.stepsToReproduce || [],
        expectedBehavior: bugData.expectedBehavior || '',
        actualBehavior: bugData.actualBehavior || '',
        reproducibility: bugData.reproducibility || 'Sometimes',
        environment: bugData.environment || {
          os: '',
          browser: '',
          browserVersion: '',
          appType: 'Web',
          appVersion: '',
          build: '',
        },
        component: bugData.component || '',
        labels: bugData.labels || [],
        affectedUrl: bugData.affectedUrl || '',
        attachments: bugData.attachments || [],
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Bug[]>(['bugs', projectId], (old = []) => [optimisticBug, ...old]);
      
      return { previousBugs, tempId };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['bugs', projectId], context.previousBugs);
      }
      logger.error('Error creating bug', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bug",
        variant: "destructive",
      });
    },
    onSuccess: (createdBug, variables, context) => {
      if (context?.tempId) {
        queryClient.setQueryData<Bug[]>(['bugs', projectId], (old = []) => 
          old.map(b => b._id === context.tempId ? createdBug : b)
        );
      }
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['feature-bugs'] });
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
      await queryClient.cancelQueries({ queryKey: ['bugs', projectId] });
      await queryClient.cancelQueries({ queryKey: ['feature-bugs'] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['bugs', projectId]);
      
      queryClient.setQueryData<Bug[]>(['bugs', projectId], (old = []) =>
        old.map(b => b._id === bugId ? { ...b, status, updatedAt: new Date().toISOString() } : b)
      );
      
      queryClient.setQueryData<Bug[]>(['feature-bugs'], (old = []) =>
        old.map(b => b._id === bugId ? { ...b, status, updatedAt: new Date().toISOString() } : b)
      );
      
      return { previousBugs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['bugs', projectId], context.previousBugs);
      }
      logger.error('Error updating bug status', error);
      toast({
        title: "Error",
        description: "Failed to update bug status",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Status Updated",
        description: `Bug status updated to ${variables.status}`,
      });
    },
  });

  const updateBugMutation = useMutation({
    mutationFn: async ({ bugId, updateData }: { bugId: string; updateData: Partial<Bug> }) => {
      return await bugService.updateBug(bugId, updateData);
    },
    onMutate: async ({ bugId, updateData }) => {
      await queryClient.cancelQueries({ queryKey: ['bugs', projectId] });
      await queryClient.cancelQueries({ queryKey: ['feature-bugs'] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['bugs', projectId]);
      
      queryClient.setQueryData<Bug[]>(['bugs', projectId], (old = []) =>
        old.map(b => b._id === bugId ? { ...b, ...updateData, updatedAt: new Date().toISOString() } : b)
      );
      
      return { previousBugs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['bugs', projectId], context.previousBugs);
      }
      logger.error('Error updating bug', error);
      toast({
        title: "Error",
        description: "Failed to update bug",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['feature-bugs'] });
      toast({
        title: "Success",
        description: "Bug updated successfully",
      });
    },
  });

  const deleteBugMutation = useMutation({
    mutationFn: async (bugId: string) => {
      await bugService.deleteBug(bugId);
      return bugId;
    },
    onMutate: async (bugId) => {
      await queryClient.cancelQueries({ queryKey: ['bugs', projectId] });
      await queryClient.cancelQueries({ queryKey: ['feature-bugs'] });
      const previousBugs = queryClient.getQueryData<Bug[]>(['bugs', projectId]);
      
      queryClient.setQueryData<Bug[]>(['bugs', projectId], (old = []) =>
        old.filter(b => b._id !== bugId)
      );
      
      queryClient.setQueryData<Bug[]>(['feature-bugs'], (old = []) =>
        old.filter(b => b._id !== bugId)
      );
      
      return { previousBugs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBugs) {
        queryClient.setQueryData(['bugs', projectId], context.previousBugs);
      }
      logger.error('Error deleting bug', error);
      toast({
        title: "Error",
        description: "Failed to delete bug",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bug deleted successfully",
      });
    },
  });

  const createBug = useCallback(async (bugData: CreateBugData, files?: File[]) => {
    return await createBugMutation.mutateAsync({ bugData, files });
  }, [createBugMutation]);

  const updateBugStatus = useCallback(async (bugId: string, status: BugStatus) => {
    return await updateBugStatusMutation.mutateAsync({ bugId, status });
  }, [updateBugStatusMutation]);

  const updateBug = useCallback(async (bugId: string, updateData: Partial<Bug>) => {
    return await updateBugMutation.mutateAsync({ bugId, updateData });
  }, [updateBugMutation]);

  const deleteBug = useCallback(async (bugId: string) => {
    return await deleteBugMutation.mutateAsync(bugId);
  }, [deleteBugMutation]);

  return {
    bugs,
    isLoading,
    isCreating: createBugMutation.isPending,
    isUpdating: updateBugMutation.isPending || updateBugStatusMutation.isPending,
    isDeleting: deleteBugMutation.isPending,
    createBug,
    updateBugStatus,
    updateBug,
    deleteBug,
  };
};

