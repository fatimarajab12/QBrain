// services/auth.service.ts
import { LoginForm, SignupForm, AuthResponse, User, ForgotPasswordResponse, ResetPasswordForm } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_API === 'true';

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
    role: "QA Engineer",
  };
}

const MOCK_USER: User = {
  id: "mock-user-1",
  email: "qa.engineer@example.com",
  name: "Mock QA Engineer",
  isVerified: true,
};

export const authService = {
  // Login user
  async login(credentials: LoginForm): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      // Pure frontend login – no backend call
      await new Promise((resolve) => setTimeout(resolve, 600));

      const user: User = {
        ...MOCK_USER,
        email: credentials.email || MOCK_USER.email,
      };

      const token = "mock-token";
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("user", JSON.stringify(user));

      return { user, token };
    }

    const url = `${API_BASE_URL}/auth/sign-in`;
    console.log("Login attempt to:", url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
        mode: "cors",
      });

      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Response data:", result);

      if (result.success && result.token) {
        localStorage.setItem("authToken", result.token);

        let userId = "";
        let userEmail = credentials.email;

        try {
          const tokenParts = result.token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.id) {
              userId = payload.id;
              localStorage.setItem("userId", payload.id);
            }
            if (payload.email) {
              userEmail = payload.email;
            }
          }
        } catch (e) {
          console.warn("Could not decode token:", e);
        }

        const user: User = {
          id: userId,
          email: userEmail,
          name: "",
          isVerified: true,
        };

        localStorage.setItem("user", JSON.stringify(user));

        return {
          user,
          token: result.token,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error: any) {
      console.error("Error logging in:", error);

      const errorMessage = error?.message || "";
      const errorName = error?.name || "";

      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Network request failed") ||
        errorName === "TypeError" ||
        errorName === "NetworkError" ||
        !error.response
      ) {
        throw new Error(
          "Cannot connect to server. Please check: 1. Backend is running on http://localhost:5000 2. CORS is configured correctly 3. No firewall blocking the connection"
        );
      }

      throw error;
    }
  },

  // Signup user
  async signup(userData: SignupForm): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const user: User = {
        ...MOCK_USER,
        name: userData.name || MOCK_USER.name,
        email: userData.email,
      };

      const token = "mock-signup-token";
      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("user", JSON.stringify(user));

      return {
        user,
        token,
        verificationToken: "mock-verification-token",
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Signup failed");
      }

      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.token) {
          localStorage.setItem("authToken", result.data.token);
        }

        if (result.data.user?.id) {
          localStorage.setItem("userId", result.data.user.id);
        }

        return {
          user: transformUser(result.data.user),
          token: result.data.token,
          verificationToken: result.data.verificationToken,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error: any) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        success: true,
        emailStatus: "mock-sent",
        testCode: "123456",
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send password reset code");
      }

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          emailStatus: result.emailStatus,
          testCode: result.testCode,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(resetData: ResetPasswordForm): Promise<void> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to reset password");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    } catch (error: any) {
      console.error("Error logging out:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");
    }
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Email verification failed");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Email verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying email:", error);
      throw error;
    }
  },
};