// types/user.ts
export interface User {
  id: string; // MongoDB _id as string
  _id?: string; // Keep for backend compatibility
  name: string;
  email: string;
  isVerified?: boolean;
  loginCount?: number;
  lastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SecuritySettings {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  twoFactorEnabled?: boolean;
}