// pages/profile/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { User, UserProfile, SecuritySettings } from '@/types/user';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const saveUserProfile = async (userData: Partial<User>) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updatedUser = await userService.updateUserProfile(userData);
      setUser(updatedUser);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async (securityData: SecuritySettings) => {
    setIsSaving(true);
    try {
      await userService.updatePassword(securityData);
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user,
    isLoading,
    isSaving,
    updateUser,
    saveUserProfile,
    updatePassword,
    refreshUserProfile: fetchUserProfile,
  };
};