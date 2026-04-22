import { RenderHookResult, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { vi, expect } from 'vitest';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth.service';
import { authStorage } from '@/utils/auth-helpers';
import { createMockUser } from './user.helper';

// ============================================================================
// Test Setup Helpers
// ============================================================================

export const setupAuthMocks = (options: {
  isAuthenticated?: boolean;
  user?: ReturnType<typeof createMockUser> | null;
  getProfileResponse?: ReturnType<typeof createMockUser>;
  getProfileError?: Error;
}) => {
  (authStorage.isAuthenticated as any).mockReturnValue(options.isAuthenticated ?? false);
  (authStorage.getUser as any).mockReturnValue(options.user ?? null);
  
  if (options.getProfileError) {
    (authService.getProfile as any).mockRejectedValue(options.getProfileError);
  } else if (options.getProfileResponse) {
    (authService.getProfile as any).mockResolvedValue(options.getProfileResponse);
  }
};

export const waitForInitialization = async (result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result']) => {
  await waitFor(() => {
    expect(result.current.isInitializing).toBe(false);
  });
};

// ============================================================================
// Login Test Helpers
// ============================================================================

export const setupLoginMocks = (options: {
  success?: boolean;
  response?: { user: ReturnType<typeof createMockUser>; token: string };
  error?: Error;
}) => {
  if (options.success && options.response) {
    (authService.login as any).mockResolvedValue(options.response);
  } else if (options.error) {
    (authService.login as any).mockRejectedValue(options.error);
  }
  (authStorage.isAuthenticated as any).mockReturnValue(false);
};

export const performLogin = async (
  result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result'],
  credentials: { email: string; password: string }
) => {
  await act(async () => {
    await result.current.login(credentials);
  });
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
};

// ============================================================================
// Signup Test Helpers
// ============================================================================

export const setupSignupMocks = (options: {
  success?: boolean;
  response?: { user: ReturnType<typeof createMockUser>; token: string; verificationToken?: string };
  error?: Error;
}) => {
  if (options.success && options.response) {
    (authService.signup as any).mockResolvedValue(options.response);
  } else if (options.error) {
    (authService.signup as any).mockRejectedValue(options.error);
  }
  (authStorage.isAuthenticated as any).mockReturnValue(false);
};

export const performSignup = async (
  result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result'],
  userData: { name: string; email: string; password: string }
) => {
  await act(async () => {
    await result.current.signup(userData);
  });
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
};

// ============================================================================
// Password Reset Test Helpers
// ============================================================================

export const setupForgotPasswordMocks = (options: {
  success?: boolean;
  response?: { success: boolean; emailStatus: string; testCode?: string };
  error?: Error;
}) => {
  if (options.success && options.response) {
    (authService.forgotPassword as any).mockResolvedValue(options.response);
  } else if (options.error) {
    (authService.forgotPassword as any).mockRejectedValue(options.error);
  }
  (authStorage.isAuthenticated as any).mockReturnValue(false);
};

export const setupResetPasswordMocks = (options: {
  success?: boolean;
  error?: Error;
}) => {
  if (options.success) {
    (authService.resetPassword as any).mockResolvedValue(undefined);
  } else if (options.error) {
    (authService.resetPassword as any).mockRejectedValue(options.error);
  }
  (authStorage.isAuthenticated as any).mockReturnValue(false);
};

// ============================================================================
// Common Assertions
// ============================================================================

export const expectLoginSuccess = (
  result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result'],
  expectedUser: ReturnType<typeof createMockUser>,
  expectedToken: string,
  mockNavigate: ReturnType<typeof vi.fn>,
  mockToast: ReturnType<typeof vi.fn>
) => {
  expect(authService.login).toHaveBeenCalled();
  expect(authStorage.setToken).toHaveBeenCalledWith(expectedToken);
  expect(authStorage.setUser).toHaveBeenCalledWith(expectedUser);
  expect(result.current.user).toEqual(expectedUser);
  expect(result.current.error).toBeNull();
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Login Successful',
    description: `Welcome back, ${expectedUser.name || expectedUser.email}!`,
  });
};

export const expectLoginError = (
  result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result'],
  expectedError: string,
  mockNavigate: ReturnType<typeof vi.fn>,
  mockToast: ReturnType<typeof vi.fn>
) => {
  expect(result.current.error).toBe(expectedError);
  expect(authStorage.setToken).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(mockToast).toHaveBeenCalledWith({
    title: 'Login Failed',
    description: expectedError,
    variant: 'destructive',
  });
};

export const expectValidationError = (
  result: RenderHookResult<ReturnType<typeof useAuth>, unknown>['result'],
  expectedError: string,
  mockToast: ReturnType<typeof vi.fn>
) => {
  expect(result.current.error).toBe(expectedError);
  expect(authService.login).not.toHaveBeenCalled();
  expect(mockToast).not.toHaveBeenCalled();
};

