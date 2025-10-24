// services/auth.service.ts
import { LoginForm, SignupForm, AuthResponse, User } from '@/types/auth';

// Mock data - temporary until backend is ready
const mockUser: User = {
  id: 1,
  name: "Ahmed Hassan",
  email: "ahmed@example.com",
  role: "QA Engineer",
  avatar: "",
  createdAt: "2024-01-01"
};

export const authService = {
  // TODO: Replace with real API when backend is ready
  async login(credentials: LoginForm): Promise<AuthResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (credentials.email === "demo@qa.com" && credentials.password === "demo123") {
      return {
        user: mockUser,
        token: "mock-jwt-token",
        expiresIn: 3600
      };
    }

    if (!credentials.email || !credentials.password) {
      throw new Error("Email and password are required");
    }

    if (credentials.password.length < 6) {
      throw new Error("Invalid credentials");
    }

    return {
      user: {
        ...mockUser,
        email: credentials.email,
        name: credentials.email.split('@')[0]
      },
      token: "mock-jwt-token",
      expiresIn: 3600
    };
  },

  // TODO: Replace with real API when backend is ready
  async signup(userData: SignupForm): Promise<AuthResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!userData.name || !userData.email || !userData.password) {
      throw new Error("All fields are required");
    }

    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    return {
      user: {
        id: Math.floor(Math.random() * 1000) + 1,
        name: userData.name,
        email: userData.email,
        role: "QA Engineer",
        createdAt: new Date().toISOString()
      },
      token: "mock-jwt-token",
      expiresIn: 3600
    };
  },

  // TODO: Replace with real API when backend is ready
  async forgotPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Mock implementation
    console.log(`Password reset email sent to: ${email}`);
  },

  // TODO: Replace with real API when backend is ready
  async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app, this would call backend to invalidate token
  },

  // TODO: Replace with real API when backend is ready
  async refreshToken(token: string): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: mockUser,
      token: "new-mock-jwt-token",
      expiresIn: 3600
    };
  }
};