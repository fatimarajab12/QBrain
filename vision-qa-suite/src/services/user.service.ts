// services/user.service.ts
import { User, UserProfile, SecuritySettings } from '@/types/user';

// Mock data - temporary until backend is ready
const mockUser: UserProfile = {
  id: 1,
  firstName: "Ahmed",
  lastName: "Hassan",
  name: "Ahmed Hassan",
  email: "ahmed.hassan@company.com",
  role: "QA Engineer",
  department: "Quality Assurance",
  joinDate: "2023-06-15",
  avatar: "",
  phone: "+1234567890",
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    testCaseUpdates: true,
    bugReports: true,
  }
};

export const userService = {
  // TODO: Replace with real API when backend is ready
  async getUserProfile(): Promise<UserProfile> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockUser;
  },

  // TODO: Replace with real API when backend is ready
  async updateUserProfile(userData: Partial<User>): Promise<UserProfile> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Update mock data
    Object.assign(mockUser, userData);
    mockUser.name = `${mockUser.firstName} ${mockUser.lastName}`;
    
    return mockUser;
  },

  // TODO: Replace with real API when backend is ready
  async updatePassword(securityData: SecuritySettings): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      throw new Error("New passwords don't match");
    }
    
    // Mock password update
    console.log("Password updated successfully");
  },

  // TODO: Replace with real API when backend is ready
  async updatePreferences(preferences: UserProfile['preferences']): Promise<UserProfile> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (mockUser.preferences) {
      mockUser.preferences = { ...mockUser.preferences, ...preferences };
    }
    
    return mockUser;
  },

  // TODO: Replace with real API when backend is ready
  async uploadAvatar(file: File): Promise<string> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Mock avatar upload - return a mock URL
    const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mockUser.name}`;
    mockUser.avatar = mockAvatarUrl;
    
    return mockAvatarUrl;
  }
};