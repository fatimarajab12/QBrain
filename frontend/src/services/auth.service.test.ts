import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { authService } from './auth.service';
import {
  createLocalStorageMock,
  setupLocalStorageMock,
  createMockResponse,
  createMockErrorResponse,
  createMockSuccessResponse,
  mockFetch,
  resetFetchMock,
  createMockUser,
} from '@/__tests__/helpers';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock global fetch
(globalThis as any).fetch = vi.fn();

describe('authService', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
    resetFetchMock();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Login Tests
  // ==========================================================================

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser();
      const mockToken = 'test-token-123';
      const mockResponse = {
        success: true,
        token: mockToken,
        user: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isVerified: false,
        },
      };

      mockFetch(createMockResponse(mockResponse));

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user._id).toBe(mockUser._id);
      expect(result.user.name).toBe(mockUser.name);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(result.user.isVerified).toBe(false); // Default value
      expect(result.token).toBe(mockToken);
      expect(localStorageMock.getItem('authToken')).toBe(mockToken);
      expect(localStorageMock.getItem('userId')).toBe(mockUser._id);
    });

    it('should handle invalid credentials', async () => {
      const errorResponse = {
        success: false,
        message: 'Invalid email or password',
      };

      mockFetch(createMockErrorResponse(errorResponse.message, 401));

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should handle network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Cannot connect to server');
    });

    it('should handle non-JSON error responses', async () => {
      mockFetch(
        createMockResponse('Error', {
          ok: false,
          status: 500,
          contentType: 'text/plain',
        })
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Server error: 500');
    });

    it('should handle invalid response format', async () => {
      mockFetch(
        createMockResponse({}, {
          ok: true,
          contentType: 'text/html',
        })
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid response format from server');
    });

    it('should handle missing token in response', async () => {
      mockFetch(
        createMockResponse({
          success: true,
          user: { _id: '123', name: 'Test', email: 'test@example.com' },
          // Missing token
        })
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid response from server');
    });

    it('should handle missing user in response', async () => {
      mockFetch(
        createMockResponse({
          success: true,
          token: 'test-token',
          // Missing user
        })
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid response from server');
    });
  });

  // ==========================================================================
  // Signup Tests
  // ==========================================================================

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockUser = createMockUser();
      const mockToken = 'test-token-123';
      const mockVerificationToken = 'verify-token-456';
      const mockResponse = {
        success: true,
        data: {
          user: {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            isVerified: false,
          },
          token: mockToken,
          verificationToken: mockVerificationToken,
        },
      };

      mockFetch(createMockResponse(mockResponse));

      const result = await authService.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user._id).toBe(mockUser._id);
      expect(result.user.name).toBe(mockUser.name);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(result.token).toBe(mockToken);
      expect(result.verificationToken).toBe(mockVerificationToken);
      // Should NOT store token/user in localStorage for signup
      expect(localStorageMock.getItem('authToken')).toBeNull();
    });

    it('should signup without verification token', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        success: true,
        data: {
          user: {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            isVerified: false,
            loginCount: 0,
          },
          token: 'test-token',
          // لا يوجد verificationToken
        },
      };

      mockFetch(createMockResponse(mockResponse));

      const result = await authService.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user._id).toBe(mockUser._id);
      expect(result.user.name).toBe(mockUser.name);
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(result.user.isVerified).toBe(false);
      expect(result.user.loginCount).toBe(0);
      expect(result.verificationToken).toBeUndefined();
    });

    it('should handle email already exists error', async () => {
      mockFetch(createMockErrorResponse('Email already exists', 409));

      await expect(
        authService.signup({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should handle network errors', async () => {
      const networkError = new TypeError('Failed to fetch');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(
        authService.signup({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Cannot connect to server');
    });

    it('should handle invalid response format', async () => {
      mockFetch(
        createMockResponse({
          success: false,
          message: 'Invalid data',
        })
      );

      await expect(
        authService.signup({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid data');
    });
  });

  // ==========================================================================
  // Forgot Password Tests
  // ==========================================================================

  describe('forgotPassword', () => {
    it('should send password reset code successfully', async () => {
      const mockResponse = {
        success: true,
        emailStatus: 'sent',
        testCode: '1234',
      };

      mockFetch(createMockResponse(mockResponse));

      const result = await authService.forgotPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(result.emailStatus).toBe('sent');
      expect(result.testCode).toBe('1234');
    });

    it('should handle email not found', async () => {
      mockFetch(createMockErrorResponse('Email not found', 404));

      await expect(authService.forgotPassword('nonexistent@example.com')).rejects.toThrow('Email not found');
    });

    it('should handle invalid response', async () => {
      mockFetch(
        createMockResponse({
          success: false,
        })
      );

      await expect(authService.forgotPassword('test@example.com')).rejects.toThrow('Invalid response from server');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(authService.forgotPassword('test@example.com')).rejects.toThrow('Network error');
    });
  });

  // ==========================================================================
  // Reset Password Tests
  // ==========================================================================

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockFetch(createMockResponse({ success: true }));

      await expect(
        authService.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).resolves.not.toThrow();
    });

    it('should handle invalid code', async () => {
      mockFetch(createMockErrorResponse('Invalid or expired code', 400));

      await expect(
        authService.resetPassword({
          email: 'test@example.com',
          code: 'wrong',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).rejects.toThrow('Invalid or expired code');
    });

    it('should handle failed reset', async () => {
      mockFetch(
        createMockResponse({
          success: false,
          message: 'Reset failed',
        })
      );

      await expect(
        authService.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).rejects.toThrow('Reset failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(
        authService.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        })
      ).rejects.toThrow('Network error');
    });
  });

  // ==========================================================================
  // Logout Tests
  // ==========================================================================

  describe('logout', () => {
    it('should clear localStorage on logout', async () => {
      localStorageMock.setItem('authToken', 'test-token');
      localStorageMock.setItem('userId', 'user-123');
      localStorageMock.setItem('user', JSON.stringify(createMockUser()));

      await authService.logout();

      expect(localStorageMock.getItem('authToken')).toBeNull();
      expect(localStorageMock.getItem('userId')).toBeNull();
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error on all calls
      localStorageMock.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Logout catches errors and doesn't retry, so it should not throw
      // use-auth hook will handle cleanup in finally block
      await expect(authService.logout()).resolves.not.toThrow();
      
      // Verify it attempted to clear storage
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Verify Email Tests
  // ==========================================================================

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      mockFetch(createMockResponse({ success: true }));

      await expect(authService.verifyEmail('verify-token-123')).resolves.not.toThrow();
    });

    it('should handle invalid token', async () => {
      mockFetch(createMockErrorResponse('Invalid or expired token', 400));

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow('Invalid or expired token');
    });

    it('should handle failed verification', async () => {
      mockFetch(
        createMockResponse({
          success: false,
          message: 'Verification failed',
        })
      );

      await expect(authService.verifyEmail('token')).rejects.toThrow('Verification failed');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(authService.verifyEmail('token')).rejects.toThrow('Network error');
    });
  });

  // ==========================================================================
  // Get Profile Tests
  // ==========================================================================

  describe('getProfile', () => {
    beforeEach(() => {
      localStorageMock.setItem('authToken', 'valid-token');
    });

    it('should get profile successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = {
        success: true,
        data: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          isVerified: true,
          loginCount: 5,
        },
      };

      mockFetch(createMockSuccessResponse(mockResponse.data));

      const result = await authService.getProfile();

      expect(result._id).toBe(mockUser._id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
      expect(result.isVerified).toBe(true);
      expect(result.loginCount).toBe(5);
    });

    it('should handle unauthorized (401)', async () => {
      mockFetch(createMockErrorResponse('Unauthorized', 401));

      await expect(authService.getProfile()).rejects.toThrow('Unauthorized');
    });

    it('should handle token expired (401)', async () => {
      mockFetch(createMockErrorResponse('Token expired', 401));

      await expect(authService.getProfile()).rejects.toThrow('Token expired');
    });

    it('should handle invalid response format', async () => {
      mockFetch(
        createMockResponse({
          success: true,
          // Missing data
        })
      );

      await expect(authService.getProfile()).rejects.toThrow('Invalid response from server');
    });

    it('should handle non-JSON response', async () => {
      mockFetch(
        createMockResponse('Error', {
          ok: false,
          status: 500,
          contentType: 'text/plain',
        })
      );

      await expect(authService.getProfile()).rejects.toThrow('Request failed: 500');
    });

    it('should throw error when token is missing', async () => {
      localStorageMock.removeItem('authToken');

      await expect(authService.getProfile()).rejects.toThrow('Authentication required');
    });

    it('should handle success: false in response', async () => {
      mockFetch(
        createMockResponse({
          success: false,
          message: 'Request failed',
        })
      );

      await expect(authService.getProfile()).rejects.toThrow('Request failed');
    });
  });

  // ==========================================================================
  // Transform User Tests (Internal Function)
  // ==========================================================================

  describe('transformUser (via login)', () => {
    it('should transform user with _id', async () => {
      const backendUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        isVerified: true,
        loginCount: 3,
      };

      mockFetch(
        createMockResponse({
          success: true,
          token: 'token',
          user: backendUser,
        })
      );

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user._id).toBe('123');
      expect(result.user.name).toBe('Test User');
      expect(result.user.isVerified).toBe(true);
      expect(result.user.loginCount).toBe(3);
    });

    it('should transform user with id (instead of _id)', async () => {
      const backendUser = {
        id: '456',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      mockFetch(
        createMockResponse({
          success: true,
          token: 'token',
          user: backendUser,
        })
      );

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user._id).toBe('456');
    });

    it('should throw error when _id and id are missing', async () => {
      const backendUser = {
        name: 'Test User',
        email: 'test@example.com',
        // Missing _id and id
      };

      mockFetch(
        createMockResponse({
          success: true,
          token: 'token',
          user: backendUser,
        })
      );

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid user object from server (missing _id)');
    });

    it('should handle missing optional fields', async () => {
      const backendUser = {
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        // Missing optional fields
      };

      mockFetch(
        createMockResponse({
          success: true,
          token: 'token',
          user: backendUser,
        })
      );

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.isVerified).toBe(false);
      expect(result.user.loginCount).toBe(0);
      expect(result.user.lastLogin).toBeUndefined();
    });
  });

  // ==========================================================================
  // Build Auth Headers Tests (via getProfile)
  // ==========================================================================

  describe('buildAuthHeaders (via getProfile)', () => {
    it('should include Authorization header when token exists', async () => {
      const token = 'test-token-123';
      localStorageMock.setItem('authToken', token);

      mockFetch(createMockSuccessResponse({ _id: '123', name: 'Test', email: 'test@example.com', role: 'user' }));

      await authService.getProfile();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should throw error when token is missing', async () => {
      localStorageMock.removeItem('authToken');

      await expect(authService.getProfile()).rejects.toThrow('Authentication required');
    });

    it('should merge extra headers', async () => {
      const token = 'test-token';
      localStorageMock.setItem('authToken', token);

      mockFetch(createMockSuccessResponse({ _id: '123', name: 'Test', email: 'test@example.com', role: 'user' }));

      await authService.getProfile();

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  // ==========================================================================
  // Edge Cases & Error Handling
  // ==========================================================================

  describe('error handling', () => {
    it('should handle NetworkError name', async () => {
      const networkError = new Error('Network request failed');
      networkError.name = 'NetworkError';
      (global.fetch as any).mockRejectedValue(networkError);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Cannot connect to server');
    });

    it('should handle TypeError for network errors', async () => {
      const typeError = new TypeError('Failed to fetch');
      (global.fetch as any).mockRejectedValue(typeError);

      await expect(
        authService.signup({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Cannot connect to server');
    });

    it('should handle generic errors', async () => {
      const genericError = new Error('Something went wrong');
      (global.fetch as any).mockRejectedValue(genericError);

      await expect(
        authService.forgotPassword('test@example.com')
      ).rejects.toThrow('Something went wrong');
    });
  });
});

