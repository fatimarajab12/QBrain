// types/auth.ts
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string; // MongoDB _id as string
  _id?: string; // Keep for backend compatibility
  name: string;
  email: string;
  isVerified?: boolean;
  loginCount?: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number; // Optional, backend doesn't return it
  verificationToken?: string; // Only in development mode
}

export interface AuthViewProps {
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}

export interface ForgotPasswordResponse {
  success: boolean;
  emailStatus?: any;
  testCode?: string; // Only in development
}

export interface ResetPasswordForm {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}