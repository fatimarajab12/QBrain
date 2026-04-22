import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeatures } from './useFeatures';
import { featureService } from '@/services/feature.service';
import { Feature } from '@/types/feature';
import { createMockFeature, createMockAIFeature } from '@/__tests__/helpers';

// ============================================================================
// Mock Setup
// ============================================================================

const mockToast = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/services/feature.service');

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// ============================================================================
// Test Suite
// ============================================================================

describe('useFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initialization Tests
  // ==========================================================================

  describe('initialization', () => {
    it('should load features when projectId is provided', async () => {
      const mockFeatures = [createMockFeature()];
      (featureService.fetchFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(featureService.fetchFeatures).toHaveBeenCalledWith('project-1');
      expect(result.current.features).toEqual(mockFeatures);
    });

    it('should not fetch features when projectId is not provided', () => {
      const { result } = renderHook(() => useFeatures(), { wrapper });

      expect(featureService.fetchFeatures).not.toHaveBeenCalled();
      expect(result.current.features).toEqual([]);
    });

    it('should show error toast when features fail to load', async () => {
      const error = new Error('Failed to load features');
      (featureService.fetchFeatures as any).mockRejectedValue(error);

      renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load project features',
          variant: 'destructive',
        });
      });
    });
  });

  // ==========================================================================
  // hasAIGeneratedFeatures Tests
  // ==========================================================================

  describe('hasAIGeneratedFeatures', () => {
    it('should return true when feature has isAIGenerated flag', async () => {
      const mockFeatures = [createMockAIFeature()];
      (featureService.fetchFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasAIGeneratedFeatures).toBe(true);
    });

    it('should return false when feature name includes "AI Generated" but isAIGenerated is false', async () => {
      const mockFeatures = [createMockFeature({ name: 'AI Generated Feature', isAIGenerated: false })];
      (featureService.fetchFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // hasAIGeneratedFeatures now only checks isAIGenerated flag, not name/description
      expect(result.current.hasAIGeneratedFeatures).toBe(false);
    });

    it('should return false when feature description includes "AI Generated" but isAIGenerated is false', async () => {
      const mockFeatures = [createMockFeature({ description: 'AI Generated description', isAIGenerated: false })];
      (featureService.fetchFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // hasAIGeneratedFeatures now only checks isAIGenerated flag, not name/description
      expect(result.current.hasAIGeneratedFeatures).toBe(false);
    });

    it('should return false when no AI generated features exist', async () => {
      const mockFeatures = [createMockFeature({ isAIGenerated: false })];
      (featureService.fetchFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.hasAIGeneratedFeatures).toBe(false);
    });
  });

  // ==========================================================================
  // createFeature Tests
  // ==========================================================================

  describe('createFeature', () => {
    it('should create feature successfully with optimistic update', async () => {
      const mockFeature = createMockFeature({ _id: 'new-feature', name: 'New Feature' });
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.createFeature as any).mockResolvedValue(mockFeature);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let createdFeature: Feature;
      await act(async () => {
        createdFeature = await result.current.createFeature({
          name: 'New Feature',
          description: 'New Description',
        });
      });

      expect(createdFeature!).toEqual(mockFeature);
      expect(featureService.createFeature).toHaveBeenCalledWith('project-1', {
        name: 'New Feature',
        description: 'New Description',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: `Feature "${mockFeature.name}" created successfully`,
      });
    });

    it('should throw error when projectId is missing', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper });

      await act(async () => {
        await expect(
          result.current.createFeature({
            name: 'New Feature',
            description: 'New Description',
          })
        ).rejects.toThrow('Project ID is missing');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Project ID is missing. Please ensure you are creating the feature within a valid project.',
        variant: 'destructive',
      });
      expect(featureService.createFeature).not.toHaveBeenCalled();
    });

    it('should rollback optimistic update on error', async () => {
      const initialFeatures = [createMockFeature()];
      const error = new Error('Failed to create feature');
      (featureService.fetchFeatures as any).mockResolvedValue(initialFeatures);
      (featureService.createFeature as any).mockRejectedValue(error);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(
          result.current.createFeature({
            name: 'New Feature',
            description: 'New Description',
          })
        ).rejects.toThrow('Failed to create feature');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error Creating Feature',
        description: 'Failed to create feature',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // updateFeatureStatus Tests
  // ==========================================================================

  describe('updateFeatureStatus', () => {
    it('should update feature status successfully with optimistic update', async () => {
      const mockFeature = createMockFeature({ status: 'in-progress' });
      (featureService.fetchFeatures as any).mockResolvedValue([createMockFeature()]);
      (featureService.updateFeatureStatus as any).mockResolvedValue(mockFeature);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateFeatureStatus('feature-1', 'in-progress');
      });

      expect(featureService.updateFeatureStatus).toHaveBeenCalledWith('feature-1', 'in-progress');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Feature status updated successfully',
      });
    });

    it('should rollback optimistic update on error', async () => {
      const initialFeature = createMockFeature({ status: 'pending' });
      const error = new Error('Failed to update status');
      (featureService.fetchFeatures as any).mockResolvedValue([initialFeature]);
      (featureService.updateFeatureStatus as any).mockRejectedValue(error);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(
          result.current.updateFeatureStatus('feature-1', 'in-progress')
        ).rejects.toThrow('Failed to update status');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update feature status',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // updateFeature Tests
  // ==========================================================================

  describe('updateFeature', () => {
    it('should update feature successfully with optimistic update', async () => {
      const updatedFeature = createMockFeature({
        name: 'Updated Feature',
        description: 'Updated Description',
      });
      (featureService.fetchFeatures as any).mockResolvedValue([createMockFeature()]);
      (featureService.updateFeature as any).mockResolvedValue(updatedFeature);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateFeature('feature-1', {
          name: 'Updated Feature',
          description: 'Updated Description',
        });
      });

      expect(featureService.updateFeature).toHaveBeenCalledWith('feature-1', {
        name: 'Updated Feature',
        description: 'Updated Description',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Feature updated successfully',
      });
    });

    it('should rollback optimistic update on error', async () => {
      const initialFeature = createMockFeature();
      const error = new Error('Failed to update feature');
      (featureService.fetchFeatures as any).mockResolvedValue([initialFeature]);
      (featureService.updateFeature as any).mockRejectedValue(error);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(
          result.current.updateFeature('feature-1', {
            name: 'Updated Feature',
            description: 'Updated Description',
          })
        ).rejects.toThrow('Failed to update feature');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update feature',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // deleteFeature Tests
  // ==========================================================================

  describe('deleteFeature', () => {
    it('should delete feature successfully with optimistic update', async () => {
      (featureService.fetchFeatures as any).mockResolvedValue([createMockFeature()]);
      (featureService.deleteFeature as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.deleteFeature('feature-1');
      });

      expect(featureService.deleteFeature).toHaveBeenCalledWith('feature-1');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Feature deleted successfully',
      });
    });

    it('should rollback optimistic update on error', async () => {
      const initialFeature = createMockFeature();
      const error = new Error('Failed to delete feature');
      (featureService.fetchFeatures as any).mockResolvedValue([initialFeature]);
      (featureService.deleteFeature as any).mockRejectedValue(error);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(result.current.deleteFeature('feature-1')).rejects.toThrow('Failed to delete feature');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete feature',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // generateFeaturesFromAI Tests
  // ==========================================================================

  describe('generateFeaturesFromAI', () => {
    it('should generate features successfully with extracted text', async () => {
      const mockFeatures = [
        createMockAIFeature({ name: 'AI Feature 1' }),
        createMockAIFeature({ name: 'AI Feature 2' }),
      ];
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.generateAIFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let generatedFeatures: Feature[];
      await act(async () => {
        generatedFeatures = await result.current.generateFeaturesFromAI(
          new File(['test'], 'test.txt', { type: 'text/plain' }),
          'Requirements text'
        );
      });

      expect(generatedFeatures!).toEqual(mockFeatures);
      expect(featureService.generateAIFeatures).toHaveBeenCalledWith('project-1', {
        requirementsText: 'Requirements text',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success!',
        description: `Generated ${mockFeatures.length} features with AI from SRS`,
      });
    });

    it('should extract text from .txt file', async () => {
      const mockFeatures = [createMockFeature({ isAIGenerated: true })];
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.generateAIFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Create a proper File mock with text() method
      const fileContent = 'file content';
      const blob = new Blob([fileContent], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });
      
      // Mock the text() method since jsdom doesn't support it
      file.text = vi.fn().mockResolvedValue(fileContent);

      await act(async () => {
        await result.current.generateFeaturesFromAI(file);
      });

      expect(file.text).toHaveBeenCalled();
      expect(featureService.generateAIFeatures).toHaveBeenCalledWith('project-1', {
        requirementsText: fileContent,
      });
    });

    it('should show error when projectId is missing', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper });

      await act(async () => {
        await result.current.generateFeaturesFromAI(
          new File(['test'], 'test.txt', { type: 'text/plain' })
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Project ID is required',
        variant: 'destructive',
      });
      expect(featureService.generateAIFeatures).not.toHaveBeenCalled();
    });

    it('should show message when no features are generated', async () => {
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.generateAIFeatures as any).mockResolvedValue([]);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.generateFeaturesFromAI(
          new File(['test'], 'test.txt', { type: 'text/plain' }),
          'Requirements text'
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No Features Generated',
        description: 'No features were generated. Please check your SRS document.',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // generateFeaturesFromSRS Tests
  // ==========================================================================

  describe('generateFeaturesFromSRS', () => {
    it('should generate features from SRS successfully', async () => {
      const mockFeatures = [createMockAIFeature()];
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.generateAIFeatures as any).mockResolvedValue(mockFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.generateFeaturesFromSRS({ someOption: 'value' });
      });

      expect(featureService.generateAIFeatures).toHaveBeenCalledWith('project-1', {
        someOption: 'value',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Generating Features',
        description: 'AI is generating features from SRS document...',
      });
    });

    it('should show error when projectId is missing', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper });

      await act(async () => {
        await result.current.generateFeaturesFromSRS();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Project ID is required',
        variant: 'destructive',
      });
      expect(featureService.generateAIFeatures).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // approveFeatures Tests
  // ==========================================================================

  describe('approveFeatures', () => {
    it('should approve and create unique features successfully', async () => {
      const existingFeatures = [createMockFeature({ name: 'Existing Feature' })];
      const approvedFeatures = [
        createMockFeature({ name: 'New Feature 1' }),
        createMockFeature({ name: 'New Feature 2' }),
      ];
      const createdFeatures = [
        createMockFeature({ _id: 'new-1', name: 'New Feature 1' }),
        createMockFeature({ _id: 'new-2', name: 'New Feature 2' }),
      ];

      (featureService.fetchFeatures as any).mockResolvedValue(existingFeatures);
      (featureService.createAIFeatures as any).mockResolvedValue(createdFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.approveFeatures(approvedFeatures);
      });

      expect(featureService.createAIFeatures).toHaveBeenCalledWith('project-1', [
        {
          name: 'New Feature 1',
          description: 'Test Description',
          priority: 'Medium',
          isAIGenerated: true,
          acceptanceCriteria: [],
        },
        {
          name: 'New Feature 2',
          description: 'Test Description',
          priority: 'Medium',
          isAIGenerated: true,
          acceptanceCriteria: [],
        },
      ]);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success!',
        description: `Approved and added ${createdFeatures.length} feature(s) successfully`,
      });
    });

    it('should skip duplicate features', async () => {
      const existingFeatures = [createMockFeature({ name: 'Existing Feature' })];
      const approvedFeatures = [
        createMockFeature({ name: 'Existing Feature' }), // Duplicate
        createMockFeature({ name: 'New Feature' }),
      ];
      const createdFeatures = [createMockFeature({ _id: 'new-1', name: 'New Feature' })];

      (featureService.fetchFeatures as any).mockResolvedValue(existingFeatures);
      (featureService.createAIFeatures as any).mockResolvedValue(createdFeatures);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.approveFeatures(approvedFeatures);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Some Features Skipped',
        description: '1 feature(s) were skipped because they already exist.',
      });
    });

    it('should show message when all features are duplicates', async () => {
      const existingFeatures = [createMockFeature({ name: 'Existing Feature' })];
      const approvedFeatures = [createMockFeature({ name: 'Existing Feature' })];

      (featureService.fetchFeatures as any).mockResolvedValue(existingFeatures);
      (featureService.createAIFeatures as any).mockResolvedValue([]);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.approveFeatures(approvedFeatures);
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No New Features',
        description: 'All selected features already exist in the project.',
        variant: 'destructive',
      });
    });

    it('should return early when projectId is missing', async () => {
      const { result } = renderHook(() => useFeatures(), { wrapper });

      await act(async () => {
        await result.current.approveFeatures([createMockFeature()]);
      });

      expect(featureService.createAIFeatures).not.toHaveBeenCalled();
    });

    it('should return early when approvedFeatures is empty', async () => {
      (featureService.fetchFeatures as any).mockResolvedValue([]);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.approveFeatures([]);
      });

      expect(featureService.createAIFeatures).not.toHaveBeenCalled();
    });

    it('should handle errors during approval', async () => {
      const error = new Error('Failed to approve features');
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      (featureService.createAIFeatures as any).mockRejectedValue(error);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await expect(
          result.current.approveFeatures([createMockFeature()])
        ).rejects.toThrow('Failed to approve features');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to approve features',
        variant: 'destructive',
      });
    });
  });

  // ==========================================================================
  // Loading States Tests
  // ==========================================================================

  describe('loading states', () => {
    it('should show isCreating as true during feature creation', async () => {
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      
      let resolveCreate: (value: Feature) => void;
      const createPromise = new Promise<Feature>((resolve) => {
        resolveCreate = resolve;
      });
      (featureService.createFeature as any).mockReturnValue(createPromise);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let createFeaturePromise: Promise<Feature>;
      await act(async () => {
        createFeaturePromise = result.current.createFeature({
          name: 'New Feature',
          description: 'Description',
        });
      });

      // Check loading state immediately after starting
      await waitFor(() => expect(result.current.isCreating).toBe(true), { timeout: 1000 });
      
      // Resolve the promise
      await act(async () => {
        resolveCreate!(createMockFeature());
        await createFeaturePromise!;
      });
      
      await waitFor(() => expect(result.current.isCreating).toBe(false));
    });

    it('should show isGeneratingAI as true during AI generation', async () => {
      (featureService.fetchFeatures as any).mockResolvedValue([]);
      
      let resolveGenerate: (value: Feature[]) => void;
      const generatePromise = new Promise<Feature[]>((resolve) => {
        resolveGenerate = resolve;
      });
      (featureService.generateAIFeatures as any).mockReturnValue(generatePromise);

      const { result } = renderHook(() => useFeatures('project-1'), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const blob = new Blob(['test'], { type: 'text/plain' });
      const file = new File([blob], 'test.txt', { type: 'text/plain' });

      let generateFeaturePromise: Promise<Feature[]>;
      await act(async () => {
        generateFeaturePromise = result.current.generateFeaturesFromAI(file, 'Requirements');
      });

      // Check loading state immediately after starting
      await waitFor(() => expect(result.current.isGeneratingAI).toBe(true), { timeout: 1000 });
      
      // Resolve the promise
      await act(async () => {
        resolveGenerate!([createMockAIFeature()]);
        await generateFeaturePromise!;
      });
      
      await waitFor(() => expect(result.current.isGeneratingAI).toBe(false));
    });
  });
});

