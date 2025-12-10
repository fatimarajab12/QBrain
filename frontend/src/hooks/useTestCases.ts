// hooks/useTestCases.ts
import { useState, useEffect } from 'react';
import { TestCase } from '@/types/test-case';
import { testCaseService } from '@/services/test-case.service';
import { useToast } from '@/hooks/use-toast';

export const useTestCases = (featureId?: string) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [hasAIGeneratedTestCases, setHasAIGeneratedTestCases] = useState(false);
  const [isCheckingAITestCases, setIsCheckingAITestCases] = useState(false);
  const { toast } = useToast();

  // Check if feature already has AI-generated test cases on mount
  useEffect(() => {
    const checkAIGeneratedTestCases = async () => {
      if (!featureId) return;
      
      setIsCheckingAITestCases(true);
      try {
        const hasAI = await testCaseService.hasAIGeneratedTestCases(featureId);
        setHasAIGeneratedTestCases(hasAI);
      } catch (error) {
        console.error('Error checking AI-generated test cases:', error);
      } finally {
        setIsCheckingAITestCases(false);
      }
    };

    checkAIGeneratedTestCases();
  }, [featureId]);

  useEffect(() => {
    if (featureId) {
      fetchTestCases(featureId);
    }
  }, [featureId]);

  // Accept string parameter (MongoDB ObjectId)
  const fetchTestCases = async (featureId: string) => {
    try {
      setIsLoading(true);
      const testCasesData = await testCaseService.fetchTestCases(featureId);
      setTestCases(testCasesData);
    } catch (error) {
      console.error('Error fetching test cases:', error);
      toast({
        title: "Error",
        description: "Failed to load test cases",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTestCase = async (testCaseData: Omit<TestCase, 'id'>) => {
    if (!featureId) return;
    
    setIsCreating(true);
    try {
      const testCaseToAdd = await testCaseService.createTestCase({
        ...testCaseData,
        featureId: featureId, // featureId is now string (MongoDB ObjectId)
        projectId: undefined
      });

      setTestCases(prev => [...prev, testCaseToAdd]);
      toast({
        title: "Success",
        description: "Test case added successfully",
      });
      
      return testCaseToAdd;
    } catch (error) {
      console.error('Error adding test case:', error);
      toast({
        title: "Error",
        description: "Failed to add test case",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateTestCase = async (testCase: TestCase) => {
    setIsUpdating(true);
    try {
      const updatedTestCase = await testCaseService.updateTestCase(testCase.id, testCase);
      setTestCases(prev => 
        prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
      );
      setEditingTestCase(null);
      
      toast({
        title: "Success",
        description: "Test case updated successfully",
      });
      
      return updatedTestCase;
    } catch (error) {
      console.error('Error updating test case:', error);
      toast({
        title: "Error",
        description: "Failed to update test case",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTestCase = async (testCaseId: string) => {
    try {
      await testCaseService.deleteTestCase(testCaseId);
      setTestCases(prev => prev.filter(tc => tc.id !== testCaseId));
      
      toast({
        title: "Success",
        description: "Test case deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting test case:', error);
      toast({
        title: "Error",
        description: "Failed to delete test case",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTestCaseStatus = async (testCaseId: string, status: "passed" | "failed") => {
    try {
      const updatedTestCase = await testCaseService.updateTestCaseStatus(testCaseId, status);
      setTestCases(prev => 
        prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
      );

      toast({
        title: "Status Updated",
        description: `Test case marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating test case status:', error);
      toast({
        title: "Error",
        description: "Failed to update test case status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateTestCasePriority = async (testCaseId: string, priority: "high" | "medium" | "low") => {
    try {
      const updatedTestCase = await testCaseService.updateTestCase(testCaseId, { priority });
      setTestCases(prev => 
        prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
      );

      toast({
        title: "Priority Updated",
        description: `Test case priority changed to ${priority}`,
      });
    } catch (error) {
      console.error('Error updating test case priority:', error);
      toast({
        title: "Error",
        description: "Failed to update test case priority",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateTestCases = async (options?: any) => {
    // This function is kept for backward compatibility but now just returns generated test cases
    // The actual approval is handled by AITestCaseGenerationDialog
    if (!featureId) {
      toast({
        title: "Error",
        description: "Feature ID is required",
        variant: "destructive",
      });
      return [];
    }

    try {
      const generatedTestCases = await testCaseService.generateAITestCases(featureId, options);
      return generatedTestCases;
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate test cases",
        variant: "destructive",
      });
      throw error;
    }
  };

  const bulkCreateTestCases = async (testCases: Omit<TestCase, 'id'>[]) => {
    if (!featureId) {
      toast({
        title: "Error",
        description: "Feature ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const createdTestCases = await testCaseService.bulkCreateTestCases(featureId, testCases);
      setTestCases(prev => [...prev, ...createdTestCases]);
      setHasAIGeneratedTestCases(true); // Mark that AI test cases exist
      
      toast({
        title: "Test Cases Created",
        description: `Successfully created ${createdTestCases.length} test case(s)`,
      });
      
      return createdTestCases;
    } catch (error: any) {
      console.error('Error bulk creating test cases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create test cases",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    testCases,
    isLoading,
    isCreating,
    isUpdating,
    editingTestCase,
    setEditingTestCase,
    fetchTestCases,
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