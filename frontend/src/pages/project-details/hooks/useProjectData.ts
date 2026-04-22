import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { bugService } from "@/services/bug.service";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";
import { Bug } from "@/types/bug";

export const useProjectData = (projectId: string | undefined) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const activeTab = (searchParams.get('tab') || 'features') as "features" | "bugs";

  const setActiveTab = useCallback((tab: "features" | "bugs") => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === 'features') {
      newSearchParams.delete('tab');
    } else {
      newSearchParams.set('tab', tab);
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const { data: project } = useQuery<Project | null>({
    queryKey: ['project', projectId],
    queryFn: () => projectId ? projectService.fetchProjectById(projectId) : null,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: bugs, isLoading: isLoadingBugs, error: bugsError } = useQuery<Bug[]>({
    queryKey: ['bugs', projectId],
    queryFn: () => projectId ? bugService.getProjectBugs(projectId) : [],
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (bugsError) {
      toast({
        title: "Error",
        description: bugsError instanceof Error ? bugsError.message : "Failed to load bugs",
        variant: "destructive",
      });
    }
  }, [bugsError, toast]);

  return {
    activeTab,
    setActiveTab,
    project: project || null,
    bugs: (bugs ?? []) as Bug[],
    isLoadingBugs,
  };
};

