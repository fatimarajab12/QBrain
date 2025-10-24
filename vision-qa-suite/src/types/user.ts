// types/user.ts
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  department: string;
  joinDate: string;
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  preferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    testCaseUpdates: boolean;
    bugReports: boolean;
  };
}

export interface SecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled?: boolean;
}