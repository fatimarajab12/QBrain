// services/auth.service.ts
import { LoginForm, SignupForm, AuthResponse, User, ForgotPasswordResponse, ResetPasswordForm } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to transform backend user to frontend format
function transformUser(backendUser: any): User {
  return {
    id: backendUser._id || backendUser.id,
    _id: backendUser._id,
    name: backendUser.name,
    email: backendUser.email,
    isVerified: backendUser.isVerified || false,
    loginCount: backendUser.loginCount || 0,
    lastLogin: backendUser.lastLogin,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
    role: "QA Engineer", // Default role for frontend
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
        
        // Store token and user data
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('user', JSON.stringify(user));

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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Store token
        if (result.data.token) {
          localStorage.setItem('authToken', result.data.token);
        }
        
        // Store user ID for future API calls
        if (result.data.user?.id) {
          localStorage.setItem('userId', result.data.user.id);
        }

        return {
          user: transformUser(result.data.user),
          token: result.data.token,
          verificationToken: result.data.verificationToken, // Only in development
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      console.error('Error signing up:', error);
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
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      
      // Optionally call backend logout endpoint if it exists
      // For now, backend doesn't have a logout endpoint that needs to be called
      // The token is stateless JWT, so clearing it locally is sufficient
    } catch (error: any) {
      console.error('Error logging out:', error);
      // Even if there's an error, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
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
};