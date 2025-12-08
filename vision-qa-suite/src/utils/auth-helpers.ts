// utils/auth-helpers.ts
import { User } from '@/types/auth';

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  },

  getUser(): User | null {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  setUser(user: User): void {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      if (user.id) {
        localStorage.setItem("userId", user.id);
      }
    } catch (error) {
      console.error("Error setting user:", error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    } catch (error) {
      console.error("Error clearing auth storage:", error);
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        if (Date.now() >= exp) {
          this.clear();
          return false;
        }
      }
    } catch (error) {
      console.warn("Error checking token expiration:", error);
    }
    
    return true;
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