import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from './use-auth';
import { authService } from '@/services/auth.service';
import { authStorage } from '@/utils/auth-helpers';
import { createLocalStorageMock, setupLocalStorageMock, createMockUser } from '@/__tests__/helpers';
import {
  setupAuthMocks,
  waitForInitialization,
  setupLoginMocks,
  performLogin,
  expectLoginSuccess,
  expectLoginError,
  expectValidationError,
  setupSignupMocks,
  performSignup,
  setupForgotPasswordMocks,
  setupResetPasswordMocks,
} from '@/__tests__/helpers';

// ============================================================================
// Mock Setup
// ============================================================================

const mockNavigate = vi.fn();
const mockToast = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/services/auth.service');
vi.mock('@/utils/auth-helpers', () => ({
  authStorage: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    clear: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// ============================================================================
// Test Suite
// ============================================================================

describe('useAuth', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    setupLocalStorageMock(localStorageMock);
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initialization Tests
  // ==========================================================================

  describe('initialization', () => {
    it('should start with isInitializing as true', () => {
      setupAuthMocks({ isAuthenticated: false, user: null });
      const { result } = renderHook(() => useAuth());
      expect(result.current.isInitializing).toBe(true);
    });

    it('should initialize with null user when not authenticated', async () => {
      setupAuthMocks({ isAuthenticated: false, user: null });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from storage when authenticated', async () => {
      const mockUser = createMockUser();
      setupAuthMocks({ isAuthenticated: true, user: mockUser, getProfileResponse: mockUser });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(authStorage.getUser).toHaveBeenCalled();
    });

    it('should refresh user from backend when authenticated', async () => {
      const mockUser = createMockUser();
      const freshUser = createMockUser({ name: 'Updated Name' });
      setupAuthMocks({ isAuthenticated: true, user: mockUser, getProfileResponse: freshUser });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(authService.getProfile).toHaveBeenCalled();
      expect(authStorage.setUser).toHaveBeenCalledWith(freshUser);
    });

    it('should clear storage on initialization error', async () => {
      const mockUser = createMockUser();
      setupAuthMocks({
        isAuthenticated: true,
        user: mockUser,
        getProfileError: new Error('Invalid token'),
      });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(authStorage.clear).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('should handle getProfile failure during initialization', async () => {
      const mockUser = createMockUser();
      setupAuthMocks({
        isAuthenticated: true,
        user: mockUser,
        getProfileError: new Error('Network error'),
      });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(authStorage.clear).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('should keep user in state when user exists but token is expired', async () => {
      const mockUser = createMockUser();
      setupAuthMocks({ isAuthenticated: false, user: mockUser });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      expect(result.current.user).toEqual(mockUser);
      expect(authService.getProfile).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // Login Tests
  // ==========================================================================

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser();
      const mockResponse = { user: mockUser, token: 'test-token-123' };
      setupLoginMocks({ success: true, response: mockResponse });
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: 'test@example.com', password: 'password123' });
      expectLoginSuccess(result, mockUser, 'test-token-123', mockNavigate, mockToast);
    });

    it('should set error when email is missing', async () => {
      setupLoginMocks({});
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: '', password: 'password123' });
      expectValidationError(result, 'Please fill in all fields', mockToast);
    });

    it('should set error when password is missing', async () => {
      setupLoginMocks({});
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: 'test@example.com', password: '' });
      expectValidationError(result, 'Please fill in all fields', mockToast);
    });

    it('should set error when both email and password are missing', async () => {
      setupLoginMocks({});
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: '', password: '' });
      expectValidationError(result, 'Please fill in all fields', mockToast);
    });

    it('should handle login errors', async () => {
      setupLoginMocks({ error: new Error('Invalid credentials') });
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: 'test@example.com', password: 'wrongpassword' });
      expectLoginError(result, 'Invalid credentials', mockNavigate, mockToast);
    });

    it('should not show toast for validation errors', async () => {
      setupLoginMocks({});
      const { result } = renderHook(() => useAuth());
      await performLogin(result, { email: '', password: 'password123' });
      expect(result.current.error).toBe('Please fill in all fields');
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should return correct isAuthenticated value', async () => {
      const mockUser = createMockUser();
      // Must provide getProfileResponse so that user is set after initialization
      setupAuthMocks({ isAuthenticated: true, user: mockUser, getProfileResponse: mockUser });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);
      // isAuthenticated should be true only if both user exists and authStorage.isAuthenticated() is true
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(authStorage.isAuthenticated).toHaveBeenCalled();
    });

    it('should set loading state during login', async () => {
      (authService.login as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: createMockUser(), token: 'test-token' }), 100))
      );
      setupLoginMocks({});
      const { result } = renderHook(() => useAuth());

      let loginPromise: Promise<void>;
      await act(async () => {
        loginPromise = result.current.login({ email: 'test@example.com', password: 'password123' });
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await act(async () => await loginPromise!);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ==========================================================================
  // Signup Tests
  // ==========================================================================

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockUser = createMockUser();
      const mockResponse = { user: mockUser, token: 'test-token', verificationToken: 'verify-token-123' };
      setupSignupMocks({ success: true, response: mockResponse });
      const { result } = renderHook(() => useAuth());
      await performSignup(result, { name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(authService.signup).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.current.error).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login', {
        state: { email: 'test@example.com', message: 'Account created! Please verify your email before signing in.' },
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account Created Successfully',
        description: `Please check your email to verify your account. Verification token: ${mockResponse.verificationToken}`,
        duration: 10000,
      });
    });

    it('should signup successfully without verification token', async () => {
      const mockUser = createMockUser();
      const mockResponse = { user: mockUser, token: 'test-token' };
      setupSignupMocks({ success: true, response: mockResponse });
      const { result } = renderHook(() => useAuth());
      await performSignup(result, { name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Account Created Successfully',
        description: 'Please check your email to verify your account. After verification, you can sign in.',
        duration: 8000,
      });
    });

    it('should handle signup errors', async () => {
      setupSignupMocks({ error: new Error('Email already exists') });
      const { result } = renderHook(() => useAuth());
      await performSignup(result, { name: 'Test User', email: 'existing@example.com', password: 'password123' });

      expect(result.current.error).toBe('Email already exists');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Signup Failed',
        description: 'Email already exists',
        variant: 'destructive',
      });
    });

    it('should set loading state during signup', async () => {
      (authService.signup as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ user: createMockUser(), token: 'test-token' }), 100))
      );
      setupSignupMocks({});
      const { result } = renderHook(() => useAuth());

      let signupPromise: Promise<void>;
      await act(async () => {
        signupPromise = result.current.signup({ name: 'Test User', email: 'test@example.com', password: 'password123' });
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await act(async () => await signupPromise!);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ==========================================================================
  // Logout Tests
  // ==========================================================================

  describe('logout', () => {
    it('should logout successfully', async () => {
      (authService.logout as any).mockResolvedValue(undefined);
      setupAuthMocks({ isAuthenticated: true, user: createMockUser() });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);

      await act(async () => await result.current.logout());

      expect(authService.logout).toHaveBeenCalled();
      expect(authStorage.clear).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should clear storage even if logout API fails', async () => {
      (authService.logout as any).mockRejectedValue(new Error('Network error'));
      setupAuthMocks({ isAuthenticated: true, user: createMockUser() });
      const { result } = renderHook(() => useAuth());
      await waitForInitialization(result);

      await act(async () => await result.current.logout());

      expect(authStorage.clear).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });

  // ==========================================================================
  // Forgot Password Tests
  // ==========================================================================

  describe('forgotPassword', () => {
    it('should send password reset code successfully', async () => {
      const mockResponse = { success: true, emailStatus: 'sent', testCode: '1234' };
      setupForgotPasswordMocks({ success: true, response: mockResponse });
      const { result } = renderHook(() => useAuth());

      let response: any;
      await act(async () => {
        response = await result.current.forgotPassword('test@example.com');
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(response).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Password Reset Code Sent',
        description: 'Check your email for the 4-digit reset code. The code expires in 10 minutes.',
        duration: 5000,
      });
    });

    it('should handle forgot password errors', async () => {
      setupForgotPasswordMocks({ error: new Error('Email not found') });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(result.current.forgotPassword('nonexistent@example.com')).rejects.toThrow('Email not found');
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBe('Email not found');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Reset Failed',
        description: 'Email not found',
        variant: 'destructive',
      });
    });

    it('should set loading state during forgot password', async () => {
      (authService.forgotPassword as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, emailStatus: 'sent' }), 100))
      );
      setupForgotPasswordMocks({});
      const { result } = renderHook(() => useAuth());

      let forgotPasswordPromise: Promise<any>;
      await act(async () => {
        forgotPasswordPromise = result.current.forgotPassword('test@example.com');
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await act(async () => await forgotPasswordPromise!);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ==========================================================================
  // Reset Password Tests
  // ==========================================================================

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      setupResetPasswordMocks({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        });
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(authService.resetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '1234',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });
      expect(result.current.error).toBeNull();
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully. You can now sign in with your new password.',
      });
    });

    it('should send mismatched passwords to backend (backend handles validation)', async () => {
      setupResetPasswordMocks({ success: true });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword',
        });
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Note: Password mismatch validation is handled by backend
      expect(authService.resetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        code: '1234',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle reset password errors', async () => {
      setupResetPasswordMocks({ error: new Error('Invalid code') });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await expect(
          result.current.resetPassword({
            email: 'test@example.com',
            code: 'wrong',
            newPassword: 'newpassword123',
            confirmPassword: 'newpassword123',
          })
        ).rejects.toThrow('Invalid code');
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBe('Invalid code');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Reset Failed',
        description: 'Invalid code',
        variant: 'destructive',
      });
    });

    it('should set loading state during reset password', async () => {
      (authService.resetPassword as any).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
      );
      setupResetPasswordMocks({});
      const { result } = renderHook(() => useAuth());

      let resetPasswordPromise: Promise<void>;
      await act(async () => {
        resetPasswordPromise = result.current.resetPassword({
          email: 'test@example.com',
          code: '1234',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        });
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));
      await act(async () => await resetPasswordPromise!);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  // ==========================================================================
  // Error Handling Tests
  // ==========================================================================

  describe('error handling', () => {
    it('should allow setting error manually', () => {
      setupAuthMocks({ isAuthenticated: false });
      const { result } = renderHook(() => useAuth());

      act(() => result.current.setError('Custom error'));

      expect(result.current.error).toBe('Custom error');
    });

    it('should clear error on successful operations', async () => {
      const mockUser = createMockUser();
      setupLoginMocks({ success: true, response: { user: mockUser, token: 'test-token' } });
      const { result } = renderHook(() => useAuth());

      act(() => result.current.setError('Previous error'));
      await performLogin(result, { email: 'test@example.com', password: 'password123' });

      expect(result.current.error).toBeNull();
    });
  });
});
