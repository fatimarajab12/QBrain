import { Project } from '@/types/project';

/**
 * Creates a mock project for testing
 * @param overrides - Partial project object to override default values
 * @returns A mock Project object
 */
export const createMockProject = (overrides?: Partial<Project>): Project => ({
  _id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Creates multiple mock projects
 */
export const createMockProjects = (count: number, overrides?: Partial<Project>): Project[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockProject({
      _id: `project-${i + 1}`,
      name: `Project ${i + 1}`,
      ...overrides,
    })
  );
};

