import { User, SecuritySettings } from '@/types/user';
import { authStorage } from '@/utils/auth-helpers';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    loginCount: backendUser.loginCount || 0,
    lastLogin: backendUser.lastLogin,
    createdAt: backendUser.createdAt,
    updatedAt: backendUser.updatedAt,
  };
}

export const userService = {
  async getUserProfile(): Promise<User> {
    const token = authStorage.getToken();
    
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
    const token = authStorage.getToken();
    
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
    const token = authStorage.getToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    if (!securityData.currentPassword) {
      throw new Error("Current password is required");
    }

    if (!securityData.newPassword) {
      throw new Error("New password is required");
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      throw new Error("New passwords don't match");
    }

    if (securityData.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({
        currentPassword: securityData.currentPassword,
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
