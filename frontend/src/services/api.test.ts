import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from './api';
import { 
  createLocalStorageMock, 
  setupLocalStorageMock,
  createMockResponse,
  createMockErrorResponse,
  createMockSuccessResponse,
  mockFetch,
  resetFetchMock,
} from '@/__tests__/helpers';

// ============================================================================
// Test Configuration
// ============================================================================

// Mock global fetch
(globalThis as any).fetch = vi.fn();

describe('apiClient', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  // ==========================================================================
  // Setup & Teardown
  // ==========================================================================

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
    resetFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Test Suites
  // ==========================================================================

  describe('getToken (internal)', () => {
    describe('success cases', () => {
      it('should get token from localStorage', () => {
        localStorageMock.setItem('authToken', 'test-token-123');
        expect(localStorageMock.getItem('authToken')).toBe('test-token-123');
      });
    });

    describe('error cases', () => {
      it('should return null when token does not exist', () => {
        expect(localStorageMock.getItem('authToken')).toBeNull();
      });
    });
  });

  describe('parseResponse (internal)', () => {
    describe('success cases', () => {
      it('should parse JSON response', async () => {
        const mockData = { id: 1, name: 'Test' };
        mockFetch(createMockResponse(mockData));

        const result = await apiClient.get('/test');
        
        expect(result).toEqual(mockData);
      });

      it('should parse text response', async () => {
        mockFetch(createMockResponse('plain text response', { contentType: 'text/plain' }));

        const result = await apiClient.get('/test');
        
        expect(result).toBe('plain text response');
      });

      it('should return null for 204 No Content', async () => {
        mockFetch(createMockResponse(null, { status: 204, contentType: '' }));

        const result = await apiClient.delete('/test');
        
        expect(result).toBeNull();
      });
    });
  });

  describe('request', () => {
    it('should make GET request with correct URL', async () => {
      const mockData = { data: 'test' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce(mockData),
      });

      await apiClient.get('/test-endpoint');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test-endpoint'),
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });

    it('should include Authorization header when token exists', async () => {
      localStorageMock.setItem('authToken', 'test-token-123');
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await apiClient.get('/test');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should not include Authorization header when token does not exist', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await apiClient.get('/test');

      const callArgs = (globalThis.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should add Content-Type header for JSON body', async () => {
      const data = { name: 'Test' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await apiClient.post('/test', data);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should not add Content-Type header for FormData', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await apiClient.request('/test', {
        method: 'POST',
        body: formData,
      });

      const callArgs = (globalThis.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers).not.toHaveProperty('Content-Type');
    });

    it('should extract data from response wrapper', async () => {
      const wrappedData = { data: { id: 1, name: 'Test' } };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce(wrappedData),
      });

      const result = await apiClient.get('/test');
      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should throw error when response is not ok', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({
          message: 'Resource not found',
        }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Resource not found');
    });

    it('should throw error with status when no message in payload', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw error when success is false', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({
          success: false,
          message: 'Operation failed',
        }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Operation failed');
    });

    it('should merge custom headers', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({}),
      });

      await apiClient.request('/test', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      const callArgs = (globalThis.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers['X-Custom-Header']).toBe('custom-value');
    });
  });

  describe('get', () => {
    it('should make GET request', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({ data: 'test' }),
      });

      await apiClient.get('/test');

      expect(globalThis.fetch).toHaveBeenCalled();
      const callArgs = (globalThis.fetch as any).mock.calls[0];
      expect(callArgs[0]).toContain('/test');
    });
  });

  describe('post', () => {
    it('should make POST request with JSON body', async () => {
      const data = { name: 'Test', email: 'test@example.com' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({ data: { id: 1 } }),
      });

      await apiClient.post('/test', data);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('put', () => {
    it('should make PUT request with JSON body', async () => {
      const data = { name: 'Updated Test' };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockResolvedValueOnce({ data: { id: 1 } }),
      });

      await apiClient.put('/test/1', data);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        })
      );
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: {
          get: vi.fn(() => ''),
        },
      });

      await apiClient.delete('/test/1');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors gracefully', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'application/json'),
        },
        json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
        text: vi.fn().mockResolvedValueOnce(null),
      });

      const result = await apiClient.get('/test');
      expect(result).toBeNull();
    });

    it('should handle text parse errors gracefully', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn(() => 'text/plain'),
        },
        json: vi.fn().mockRejectedValueOnce(new Error('Not JSON')),
        text: vi.fn().mockRejectedValueOnce(new Error('Parse error')),
      });

      const result = await apiClient.get('/test');
      expect(result).toBeNull();
    });
  });
});

