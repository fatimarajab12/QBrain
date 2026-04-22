import { vi } from 'vitest';

/**
 * Creates a mock localStorage implementation for testing
 * @returns Mock localStorage object with all required methods
 */
export const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

/**
 * Sets up localStorage mock in the global window object
 * @param mock - The localStorage mock to use
 */
export const setupLocalStorageMock = (mock: ReturnType<typeof createLocalStorageMock>) => {
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  });
};

