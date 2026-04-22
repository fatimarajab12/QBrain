import { QueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { featureService } from "@/services/feature.service";
import { testCaseService } from "@/services/test-case.service";
import { bugService } from "@/services/bug.service";

export const prefetchProject = async (queryClient: QueryClient, projectId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.fetchProjectById(projectId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const prefetchFeatures = async (queryClient: QueryClient, projectId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['features', projectId],
    queryFn: () => featureService.fetchFeatures(projectId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const prefetchFeature = async (queryClient: QueryClient, featureId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['feature', featureId],
    queryFn: () => featureService.getFeature(featureId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const prefetchFeatureTestCases = async (queryClient: QueryClient, featureId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['test-cases', featureId],
    queryFn: () => testCaseService.fetchTestCases(featureId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const prefetchFeatureBugs = async (queryClient: QueryClient, featureId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['feature-bugs', featureId],
    queryFn: () => bugService.getFeatureBugs(featureId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const prefetchProjectData = async (queryClient: QueryClient, projectId: string) => {
  await Promise.all([
    prefetchProject(queryClient, projectId),
    prefetchFeatures(queryClient, projectId),
  ]);
};

export const prefetchFeatureData = async (queryClient: QueryClient, featureId: string, projectId?: string) => {
  const promises = [
    prefetchFeature(queryClient, featureId),
    prefetchFeatureTestCases(queryClient, featureId),
    prefetchFeatureBugs(queryClient, featureId),
  ];
  
  if (projectId) {
    promises.push(prefetchProject(queryClient, projectId));
  }
  
  await Promise.all(promises);
};

