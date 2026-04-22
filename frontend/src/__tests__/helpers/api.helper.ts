import { vi } from 'vitest';

/**
 * Creates a mock fetch response
 */
export const createMockResponse = <T = unknown>(
  data: T,
  options: {
    ok?: boolean;
    status?: number;
    statusText?: string;
    contentType?: string;
  } = {}
) => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    contentType = 'application/json',
  } = options;

  return {
    ok,
    status,
    statusText,
    headers: {
      get: vi.fn((header: string) => {
        if (header === 'content-type') return contentType;
        return null;
      }),
    },
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(typeof data === 'string' ? data : JSON.stringify(data)),
  };
};

/**
 * Creates a mock error response
 */
export const createMockErrorResponse = (
  message: string,
  status: number = 400
) => {
  return createMockResponse(
    { message, success: false },
    {
      ok: false,
      status,
      statusText: 'Error',
    }
  );
};

/**
 * Creates a mock success response with data wrapper
 */
export const createMockSuccessResponse = <T = unknown>(data: T) => {
  return createMockResponse({
    success: true,
    data,
  });
};

/**
 * Mocks global fetch function
 */
export const mockFetch = (response: ReturnType<typeof createMockResponse>) => {
  (global.fetch as any) = vi.fn().mockResolvedValue(response);
};

/**
 * Resets fetch mock
 */
export const resetFetchMock = () => {
  vi.clearAllMocks();
};

