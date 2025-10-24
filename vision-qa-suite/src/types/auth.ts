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
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}
// Add to existing types in auth.ts
export interface AuthViewProps {
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}