import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TestCase } from '@/types/test-case';
import { testCaseService } from '@/services/test-case.service';
import { useToast } from '@/hooks/use-toast';

type TestCaseStatus = "passed" | "failed" | "pending" | "in_progress" | "blocked";
type TestCasePriority = "high" | "medium" | "low";

interface CreateTestCaseData extends Omit<TestCase, '_id'> {}

export const useTestCases = (featureId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);

  const { 
    data: testCases = [], 
    isLoading,
    error: testCasesError 
  } = useQuery<TestCase[]>({
    queryKey: ['test-cases', featureId],
    queryFn: () => featureId ? testCaseService.fetchTestCases(featureId) : [],
    enabled: !!featureId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { 
    data: hasAIGeneratedTestCases = false,
    isLoading: isCheckingAITestCases 
  } = useQuery<boolean>({
    queryKey: ['test-cases-ai-check', featureId],
    queryFn: () => featureId ? testCaseService.hasAIGeneratedTestCases(featureId) : false,
    enabled: !!featureId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (testCasesError) {
      toast({
        title: "Error",
        description: "Failed to load test cases",
        variant: "destructive",
      });
    }
  }, [testCasesError, toast]);

  const createTestCaseMutation = useMutation({
    mutationFn: async ({ featureId, testCaseData }: { 
      featureId: string; 
      testCaseData: CreateTestCaseData;
    }) => {
      return await testCaseService.createTestCase({
        ...testCaseData,
        featureId: featureId,
        projectId: undefined
      });
    },
    onMutate: async ({ testCaseData }) => {
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      const optimisticTestCase: TestCase = {
        _id: `temp-${Date.now()}`,
        ...testCaseData,
      };

      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) => [...old, optimisticTestCase]);
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add test case",
        variant: "destructive",
      });
    },
    onSuccess: (createdTestCase) => {
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) => 
        old.map(tc => tc._id === `temp-${createdTestCase._id}` ? createdTestCase : tc).filter(tc => !tc._id.startsWith('temp-'))
      );
      queryClient.invalidateQueries({ queryKey: ['test-cases', featureId] });
      toast({
        title: "Success",
        description: "Test case added successfully",
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
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, ...testCase } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case",
        variant: "destructive",
      });
    },
    onSuccess: (updatedTestCase, variables) => {
      // Update query data with the response from server
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) =>
        old.map(tc => tc._id === variables.testCaseId ? updatedTestCase : tc)
      );
      queryClient.invalidateQueries({ queryKey: ['test-cases', featureId] });
      setEditingTestCase(null);
      toast({
        title: "Success",
        description: "Test case updated successfully",
      });
    },
  });

  const deleteTestCaseMutation = useMutation({
    mutationFn: async (testCaseId: string) => {
      await testCaseService.deleteTestCase(testCaseId);
      return testCaseId;
    },
    onMutate: async (testCaseId) => {
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) =>
        old.filter(tc => tc._id !== testCaseId)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete test case",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });
    },
  });

  const updateTestCaseStatusMutation = useMutation({
    mutationFn: async ({ testCaseId, status }: { 
      testCaseId: string; 
      status: "passed" | "failed";
    }) => {
      return await testCaseService.updateTestCaseStatus(testCaseId, status);
    },
    onMutate: async ({ testCaseId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, status } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case status",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Status Updated",
        description: `Test case marked as ${variables.status}`,
      });
    },
  });

  const updateTestCasePriorityMutation = useMutation({
    mutationFn: async ({ testCaseId, priority }: { 
      testCaseId: string; 
      priority: TestCasePriority;
    }) => {
      return await testCaseService.updateTestCase(testCaseId, { priority });
    },
    onMutate: async ({ testCaseId, priority }) => {
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) =>
        old.map(tc => tc._id === testCaseId ? { ...tc, priority } : tc)
      );
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update test case priority",
        variant: "destructive",
      });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Priority Updated",
        description: `Test case priority changed to ${variables.priority}`,
      });
    },
  });

  const bulkCreateTestCasesMutation = useMutation({
    mutationFn: async ({ featureId, testCases }: { 
      featureId: string; 
      testCases: CreateTestCaseData[];
    }) => {
      return await testCaseService.bulkCreateTestCases(featureId, testCases);
    },
    onMutate: async ({ testCases }) => {
      await queryClient.cancelQueries({ queryKey: ['test-cases', featureId] });
      const previousTestCases = queryClient.getQueryData<TestCase[]>(['test-cases', featureId]);
      
      const optimisticTestCases: TestCase[] = testCases.map((tc, index) => ({
        _id: `temp-bulk-${Date.now()}-${index}`,
        ...tc,
      }));

      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) => [...old, ...optimisticTestCases]);
      
      return { previousTestCases };
    },
    onError: (error, variables, context) => {
      if (context?.previousTestCases) {
        queryClient.setQueryData(['test-cases', featureId], context.previousTestCases);
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create test cases",
        variant: "destructive",
      });
    },
    onSuccess: (createdTestCases) => {
      queryClient.setQueryData<TestCase[]>(['test-cases', featureId], (old = []) => {
        const filtered = old.filter(tc => !tc._id.startsWith('temp-bulk-'));
        return [...filtered, ...createdTestCases];
      });
      queryClient.invalidateQueries({ queryKey: ['test-cases', featureId] });
      queryClient.invalidateQueries({ queryKey: ['test-cases-ai-check', featureId] });
      toast({
        title: "Test Cases Created",
        description: `Successfully created ${createdTestCases.length} test case(s)`,
      });
    },
  });

  const createTestCase = useCallback(async (testCaseData: CreateTestCaseData) => {
    if (!featureId) {
      toast({
        title: "Error",
        description: "Feature ID is required",
        variant: "destructive",
      });
      return;
    }
    return await createTestCaseMutation.mutateAsync({ featureId, testCaseData });
  }, [featureId, createTestCaseMutation, toast]);

  const updateTestCase = useCallback(async (testCase: TestCase) => {
    return await updateTestCaseMutation.mutateAsync({ testCaseId: testCase._id, testCase });
  }, [updateTestCaseMutation]);

  const deleteTestCase = useCallback(async (testCaseId: string) => {
    return await deleteTestCaseMutation.mutateAsync(testCaseId);
  }, [deleteTestCaseMutation]);

  const updateTestCaseStatus = useCallback(async (testCaseId: string, status: "passed" | "failed") => {
    return await updateTestCaseStatusMutation.mutateAsync({ testCaseId, status });
  }, [updateTestCaseStatusMutation]);

  const updateTestCasePriority = useCallback(async (testCaseId: string, priority: TestCasePriority) => {
    return await updateTestCasePriorityMutation.mutateAsync({ testCaseId, priority });
  }, [updateTestCasePriorityMutation]);

  const generateTestCases = useCallback(async (options?: Record<string, unknown>) => {
    if (!featureId) {
      toast({
        title: "Error",
        description: "Feature ID is required",
        variant: "destructive",
      });
      return [];
    }

    try {
      return await testCaseService.generateAITestCases(featureId, options);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate test cases",
        variant: "destructive",
      });
      throw error;
    }
  }, [featureId, toast]);

  const bulkCreateTestCases = useCallback(async (testCases: CreateTestCaseData[]) => {
    if (!featureId) {
      toast({
        title: "Error",
        description: "Feature ID is required",
        variant: "destructive",
      });
      return;
    }

    return await bulkCreateTestCasesMutation.mutateAsync({ featureId, testCases });
  }, [featureId, bulkCreateTestCasesMutation, toast]);

  const isCreating = useMemo(() => 
    createTestCaseMutation.isPending || bulkCreateTestCasesMutation.isPending,
    [createTestCaseMutation.isPending, bulkCreateTestCasesMutation.isPending]
  );

  return {
    testCases,
    isLoading,
    isCreating,
    isUpdating: updateTestCaseMutation.isPending,
    editingTestCase,
    setEditingTestCase,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    updateTestCaseStatus,
    updateTestCasePriority,
    generateTestCases,
    bulkCreateTestCases,
    hasAIGeneratedTestCases,
    isCheckingAITestCases,
  };
};
