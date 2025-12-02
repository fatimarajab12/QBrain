// utils/auth-helpers.ts
import { User } from '@/types/auth';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem("authToken");
  },

  setToken(token: string): void {
    localStorage.setItem("authToken", token);
  },

  getUser(): User | null {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user));
  },

  clear(): void {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};