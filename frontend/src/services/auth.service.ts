import { LoginForm, SignupForm, AuthResponse, User, ForgotPasswordResponse, ResetPasswordForm } from '@/types/auth';
import { authStorage } from '@/utils/auth-helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getToken = (): string | null => {
  return authStorage.getToken();
};

const buildAuthHeaders = (extra?: HeadersInit): HeadersInit => {
  const token = getToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...extra,
  };
};

// Helper function to transform backend user to frontend format
function transformUser(backendUser: any): User {
  const _id = backendUser?._id || backendUser?.id;
  if (!_id) {
    throw new Error('Invalid user object from server (missing _id)');
  }
  return {
    _id: String(_id),
    name: backendUser.name,
    email: backendUser.email,
    isVerified: backendUser.isVerified || false,
    role: backendUser.role,
    loginCount: backendUser.loginCount || 0,
    lastLogin: backendUser.lastLogin,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
}

export const authService = {
  // Login user
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const url = `${API_BASE_URL}/auth/sign-in`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
        mode: 'cors',
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error('Invalid response format from server');
      }

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `Login failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      if (result.success && result.token && result.user) {
        // Transform and store user data
        const user = transformUser(result.user);
        
        // Store token and user data using authStorage helper
        authStorage.setToken(result.token);
        authStorage.setUser(user);

        return {
          user,
          token: result.token,
        };
      }
      
      throw new Error(result.message || 'Invalid response from server');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle network errors
      const errorMessage = error?.message || '';
      const errorName = error?.name || '';
      
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorName === 'TypeError' ||
        errorName === 'NetworkError'
      ) {
        throw new Error('Cannot connect to server. Please ensure: 1. Backend is running on http://localhost:5000 2. CORS is configured correctly 3. No firewall is blocking the connection');
      }
      
      // Re-throw with original message
      throw error;
    }
  },

  // Signup user
  async signup(userData: SignupForm): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
        mode: 'cors',
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error('Invalid response format from server');
      }

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `Signup failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      if (result.success && result.data) {
        // Don't store token or user - user must verify email first
        // Return data without storing authentication info
        return {
          user: transformUser(result.data.user),
          token: result.data.token, // Return but don't store
          verificationToken: result.data.verificationToken, // Only in development
        };
      }
      
      throw new Error(result.message || 'Invalid response from server');
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Handle network errors
      const errorMessage = error?.message || '';
      const errorName = error?.name || '';
      
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed') ||
        errorName === 'TypeError' ||
        errorName === 'NetworkError'
      ) {
        throw new Error('Cannot connect to server. Please ensure: 1. Backend is running on http://localhost:5000 2. CORS is configured correctly 3. No firewall is blocking the connection');
      }
      
      // Re-throw with original message
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send password reset code');
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          emailStatus: result.emailStatus,
          testCode: result.testCode, // Only in development
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(resetData: ResetPasswordForm): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reset password');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      // Clear auth storage using helper
      authStorage.clear();
      
      // Optionally call backend logout endpoint if it exists
      // For now, backend doesn't have a logout endpoint that needs to be called
      // The token is stateless JWT, so clearing it locally is sufficient
    } catch (error: any) {
      console.error('Error logging out:', error);
      // Don't retry - localStorage may be completely disabled
      // use-auth hook will handle cleanup in finally block
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Email verification failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  // Get current user profile (refresh role, verification, etc.)
  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: buildAuthHeaders(),
      credentials: 'include',
      mode: 'cors',
    });

    const contentType = response.headers.get('content-type');
    const hasJson = contentType?.includes('application/json');
    const result = hasJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const message = (result as any)?.message || `Request failed: ${response.status}`;
      throw new Error(message);
    }

    if ((result as any)?.success === false) {
      throw new Error((result as any)?.message || 'Request failed');
    }

    const data = (result as any)?.data;
    if (!data) {
      throw new Error('Invalid response from server');
    }

    return transformUser(data);
  },
};
