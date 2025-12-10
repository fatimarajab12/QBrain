// services/user.service.ts
import { User, SecuritySettings } from '@/types/user';

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
  };
}

export const userService = {
  async getUserProfile(): Promise<User> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to get user profile');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return transformUser(result.data);
    }
    
    throw new Error('Invalid response from server');
  },

  async updateUserProfile(userData: Partial<User>): Promise<User> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // Only send fields that exist in backend
    const updateData: any = {};
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return transformUser(result.data);
    }
    
    throw new Error('Invalid response from server');
  },

  async updatePassword(securityData: SecuritySettings): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      throw new Error("New passwords don't match");
    }

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        email: JSON.parse(localStorage.getItem('user') || '{}').email,
        code: '', // This endpoint might need different approach
        newPassword: securityData.newPassword,
        confirmPassword: securityData.confirmPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update password');
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update password');
    }
  },
};