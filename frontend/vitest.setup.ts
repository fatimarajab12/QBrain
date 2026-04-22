import { vi } from "vitest";

// Ensure React is in development mode for tests
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = 'development';
}

// Ensure clean mocks between tests.
afterEach(() => {
  vi.restoreAllMocks();
});


