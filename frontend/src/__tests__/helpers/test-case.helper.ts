import { TestCase } from '@/types/test-case';

/**
 * Creates a mock test case for testing
 * @param overrides - Partial test case object to override default values
 * @returns A mock TestCase object
 */
export const createMockTestCase = (overrides?: Partial<TestCase>): TestCase => ({
  _id: 'test-case-1',
  title: 'Test Case Title',
  priority: 'medium',
  status: 'pending',
  preconditions: [],
  steps: [],
  expectedResult: 'Expected result',
  bugReports: [],
  featureId: 'feature-1',
  projectId: 'project-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates multiple mock test cases
 */
export const createMockTestCases = (count: number, overrides?: Partial<TestCase>): TestCase[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockTestCase({
      _id: `test-case-${i + 1}`,
      title: `Test Case ${i + 1}`,
      ...overrides,
    })
  );
};

/**
 * Creates mock test cases with different statuses
 */
export const createMockTestCasesWithStatuses = (): TestCase[] => {
  return [
    createMockTestCase({ _id: '1', status: 'pending' }),
    createMockTestCase({ _id: '2', status: 'passed' }),
    createMockTestCase({ _id: '3', status: 'failed' }),
  ];
};

