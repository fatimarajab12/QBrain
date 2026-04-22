import { Feature } from '@/types/feature';

/**
 * Creates a mock feature for testing
 * @param overrides - Partial feature object to override default values
 * @returns A mock Feature object
 */
export const createMockFeature = (overrides?: Partial<Feature>): Feature => ({
  _id: 'feature-1',
  name: 'Test Feature',
  description: 'Test Description',
  status: 'pending',
  progress: 0,
  projectId: 'project-1',
  priority: 'Medium',
  testCasesCount: 0,
  bugsCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates multiple mock features
 */
export const createMockFeatures = (count: number, overrides?: Partial<Feature>): Feature[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockFeature({
      _id: `feature-${i + 1}`,
      name: `Feature ${i + 1}`,
      ...overrides,
    })
  );
};

/**
 * Creates a mock AI-generated feature
 */
export const createMockAIFeature = (overrides?: Partial<Feature>): Feature => {
  return createMockFeature({
    isAIGenerated: true,
    name: 'AI Generated Feature',
    ...overrides,
  });
};

/**
 * Creates mock features with different statuses
 */
export const createMockFeaturesWithStatuses = (): Feature[] => {
  return [
    createMockFeature({ _id: '1', status: 'pending', progress: 0 }),
    createMockFeature({ _id: '2', status: 'in-progress', progress: 50 }),
    createMockFeature({ _id: '3', status: 'completed', progress: 100 }),
    createMockFeature({ _id: '4', status: 'blocked', progress: 0 }),
  ];
};

