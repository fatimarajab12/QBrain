import { User } from '@/types/auth';

/**
 * Creates a mock user for testing
 * @param overrides - Partial user object to override default values
 * @returns A mock User object
 */
export const createMockUser = (overrides?: Partial<User>): User => ({
  _id: '123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides,
});

/**
 * Creates a mock admin user
 */
export const createMockAdminUser = (overrides?: Partial<User>): User => {
  return createMockUser({
    _id: 'admin-123',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isVerified: true,
    ...overrides,
  });
};

