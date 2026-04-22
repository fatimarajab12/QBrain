import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testCaseService } from "@/services/test-case.service";
import { useToast } from "@/hooks/use-toast";
import { TestCase } from "@/types/test-case";
import { logger } from "@/utils/logger";

interface CreateTestCaseData extends Omit<TestCase, '_id'> {}

export const useProjectTestCases = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: testCases = [], 
    isLoading, 
    error: testCasesError 
  } = useQuery<TestCase[]>({
    queryKey: ['project-test-cases', projectId],
    queryFn: () => projectId ? testCaseService.fetchProjectTestCases(projectId) : [],
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const createTestCaseMutation = useMutation({
    mutationFn: async ({ testCaseData, featureId }: { 
      testCaseData: CreateTestCaseData; 
      featureId?: string;
    }) => {
      if (!featureId) {
        throw new Error("Feature ID is required to create a test case");
      }
      return await testCaseService.createTestCase({
        ...testCaseData,
        featureId,
        projectId: projectId,
      } as CreateTestCaseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-test-cases', projectId] });
      toast({
        title: "Success",
        description: "Test case created successfully",
      });
    },
    onError: (error) => {
      logger.error('Error creating test case', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test case",
        variant: "destructive",
      });
    },
  });

  const updateTestCaseMutation = useMutation({
    mutationFn: async ({ testCaseId, testCase }: { 
      testCaseId: string; 
      testCase: TestCase;
    }) => {
      return await testCaseService.updateTestCase(testCaseId, testCase);
    },
    onMutate: async ({ testCaseId, testCase }) => {
      await queryClient.cancelQueries({ queryKey: ['project-test-cases', projectId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['project-test-cases', projectId]);
      
      queryClient.setQueryData<TestCase[]>(['project-test-cases', projectId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, ...testCase } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['project-test-cases', projectId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-test-cases', projectId] });
      toast({
        title: "Success",
        description: "Test case updated successfully",
      });
    },
  });

  const deleteTestCaseMutation = useMutation({
    mutationFn: async (testCaseId: string) => {
      return await testCaseService.deleteTestCase(testCaseId);
    },
    onMutate: async (testCaseId) => {
      await queryClient.cancelQueries({ queryKey: ['project-test-cases', projectId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['project-test-cases', projectId]);
      
      queryClient.setQueryData<TestCase[]>(['project-test-cases', projectId], (old = []) =>
        old.filter(tc => tc._id !== testCaseId)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['project-test-cases', projectId], context.previousTestCases);
      }
      logger.error('Error deleting test case', error);
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-test-cases', projectId] });
      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });
    },
  });

  const updateTestCaseStatusMutation = useMutation({
    mutationFn: async ({ testCaseId, status }: { 
      testCaseId: string; 
      status: TestCase["status"];
    }) => {
      const testCase = testCases.find(tc => tc._id === testCaseId);
      if (!testCase) {
        throw new Error("Test case not found");
      }
      return await testCaseService.updateTestCase(testCaseId, { ...testCase, status });
    },
    onMutate: async ({ testCaseId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['project-test-cases', projectId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['project-test-cases', projectId]);
      
      queryClient.setQueryData<TestCase[]>(['project-test-cases', projectId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, status } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['project-test-cases', projectId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case status",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-test-cases', projectId] });
    },
  });

  const updateTestCasePriorityMutation = useMutation({
    mutationFn: async ({ testCaseId, priority }: { 
      testCaseId: string; 
      priority: TestCase["priority"];
    }) => {
      const testCase = testCases.find(tc => tc._id === testCaseId);
      if (!testCase) {
        throw new Error("Test case not found");
      }
      return await testCaseService.updateTestCase(testCaseId, { ...testCase, priority });
    },
    onMutate: async ({ testCaseId, priority }) => {
      await queryClient.cancelQueries({ queryKey: ['project-test-cases', projectId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['project-test-cases', projectId]);
      
      queryClient.setQueryData<TestCase[]>(['project-test-cases', projectId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, priority } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['project-test-cases', projectId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case priority",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-test-cases', projectId] });
    },
  });

  return {
    testCases,
    isLoading,
    error: testCasesError,
    isCreating: createTestCaseMutation.isPending,
    isUpdating: updateTestCaseMutation.isPending,
    isDeleting: deleteTestCaseMutation.isPending,
    createTestCase: async (testCaseData: CreateTestCaseData, featureId?: string) => {
      return await createTestCaseMutation.mutateAsync({ testCaseData, featureId });
    },
    updateTestCase: async (testCaseId: string, testCase: TestCase) => {
      return await updateTestCaseMutation.mutateAsync({ testCaseId, testCase });
    },
    deleteTestCase: async (testCaseId: string) => {
      return await deleteTestCaseMutation.mutateAsync(testCaseId);
    },
    updateTestCaseStatus: async (testCaseId: string, status: TestCase["status"]) => {
      return await updateTestCaseStatusMutation.mutateAsync({ testCaseId, status });
    },
    updateTestCasePriority: async (testCaseId: string, priority: TestCase["priority"]) => {
      return await updateTestCasePriorityMutation.mutateAsync({ testCaseId, priority });
    },
  };
};

