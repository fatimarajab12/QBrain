import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bugService } from '@/services/bug.service';
import { useToast } from '@/hooks/use-toast';
import { Bug } from '@/types/bug';
import { logger } from '@/utils/logger';
import { useNavigate } from 'react-router-dom';

type BugStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export const useBug = (bugId?: string, projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { 
    data: bug, 
    isLoading, 
    error: bugError 
  } = useQuery<Bug | null>({
    queryKey: ['bug', bugId],
    queryFn: () => bugId ? bugService.getBug(bugId) : null,
    enabled: !!bugId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: async ({ bugId, status }: { bugId: string; status: BugStatus }) => {
      return await bugService.updateBugStatus(bugId, status);
    },
    onMutate: async ({ bugId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['bug', bugId] });
      const previousBug = queryClient.getQueryData<Bug>(['bug', bugId]);
      
      queryClient.setQueryData<Bug>(['bug', bugId], (old) => 
        old ? { ...old, status, updatedAt: new Date().toISOString() } : old
      );
      
      return { previousBug };
    },
    onError: (error, variables, context) => {
      if (context?.previousBug) {
        queryClient.setQueryData(['bug', variables.bugId], context.previousBug);
      }
      logger.error('Error updating bug status', error);
      toast({
        title: "Error",
        description: "Failed to update bug status",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['feature-bugs'] });
      toast({
        title: "Success",
        description: `Bug status updated to ${variables.status}`,
      });
    },
  });

  const updateBugMutation = useMutation({
    mutationFn: async ({ bugId, updateData }: { bugId: string; updateData: Partial<Bug> }) => {
      return await bugService.updateBug(bugId, updateData);
    },
    onMutate: async ({ bugId, updateData }) => {
      await queryClient.cancelQueries({ queryKey: ['bug', bugId] });
      const previousBug = queryClient.getQueryData<Bug>(['bug', bugId]);
      
      queryClient.setQueryData<Bug>(['bug', bugId], (old) => 
        old ? { ...old, ...updateData, updatedAt: new Date().toISOString() } : old
      );
      
      return { previousBug };
    },
    onError: (error, variables, context) => {
      if (context?.previousBug) {
        queryClient.setQueryData(['bug', variables.bugId], context.previousBug);
      }
      logger.error('Error updating bug', error);
      toast({
        title: "Error",
        description: "Failed to update bug",
        variant: "destructive",
      });
    },
    onSuccess: (updatedBug, variables) => {
      queryClient.setQueryData(['bug', variables.bugId], updatedBug);
      queryClient.invalidateQueries({ queryKey: ['bug', variables.bugId] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['feature-bugs'] });
      queryClient.removeQueries({ queryKey: ['bug', bugId] });
      toast({
        title: "Success",
        description: "Bug deleted successfully",
      });
      if (projectId) {
        navigate(`/projects/${projectId}?tab=bugs`);
      }
    },
    onError: (error) => {
      logger.error('Error deleting bug', error);
      toast({
        title: "Error",
        description: "Failed to delete bug",
        variant: "destructive",
      });
    },
  });

  const updateBugStatus = async (status: BugStatus) => {
    if (!bugId || !bug) return;
    return await updateBugStatusMutation.mutateAsync({ bugId, status });
  };

  const updateBug = async (updateData: Partial<Bug>) => {
    if (!bugId) return;
    return await updateBugMutation.mutateAsync({ bugId, updateData });
  };

  const deleteBug = async () => {
    if (!bugId) return;
    return await deleteBugMutation.mutateAsync(bugId);
  };

  return {
    bug: bug || null,
    isLoading,
    error: bugError,
    isUpdating: updateBugMutation.isPending || updateBugStatusMutation.isPending,
    isDeleting: deleteBugMutation.isPending,
    updateBugStatus,
    updateBug,
    deleteBug,
  };
};

