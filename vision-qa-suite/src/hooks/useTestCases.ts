// hooks/useTestCases.ts
import { useState, useEffect } from 'react';
import { TestCase } from '@/types/test-case';
import { testCaseService } from '@/services/test-case.service';
import { useToast } from '@/hooks/use-toast';

export const useTestCases = (featureId?: number) => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (featureId) {
      fetchTestCases(featureId);
    }
  }, [featureId]);

  // Fix: Accept number parameter instead of string
  const fetchTestCases = async (featureId: number) => {
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
        featureId: featureId, // No need for parseInt since featureId is already number
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

  const deleteTestCase = async (testCaseId: number) => {
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

  const updateTestCaseStatus = async (testCaseId: number, status: "passed" | "failed") => {
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

  const updateTestCasePriority = async (testCaseId: number, priority: "high" | "medium" | "low") => {
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
      const generatedTestCases = await testCaseService.generateAITestCases(featureId.toString(), options);
      setTestCases(prev => [...prev, ...generatedTestCases]);
      
      toast({
        title: "Test Cases Generated",
        description: `Successfully generated ${generatedTestCases.length} test cases`,
      });
      
      return generatedTestCases;
    } catch (error: any) {
      console.error('Error generating test cases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate test cases",
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
  };
};