import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminService, AdminUser } from "@/services/admin.service";
import { logger } from "@/utils/logger";

interface UseUserActionsProps {
  users: AdminUser[];
  setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;
  selectedUsers: string[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useUserActions = ({ users, setUsers, selectedUsers, setSelectedUsers }: UseUserActionsProps) => {
  const { toast } = useToast();

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      await adminService.deleteUser(userId);
      toast({ title: "Success", description: "User deleted successfully" });
      setUsers(users.filter(u => u._id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } catch (error) {
      logger.error("Failed to delete user", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  }, [users, selectedUsers, setUsers, setSelectedUsers, toast]);

  const handleToggleRole = useCallback(async (user: AdminUser) => {
    const userId = user._id;
    const currentRole = user.role || "user";
    const nextRole = currentRole === "admin" ? "user" : "admin";

    try {
      const updated = await adminService.updateUserRole(userId, nextRole);
      setUsers(prev =>
        prev.map(u => (u._id === userId ? { ...u, role: updated.role } : u))
      );
      toast({ title: "Success", description: `Role updated to ${updated.role}` });
    } catch (error) {
      logger.error("Failed to update user role", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive"
      });
    }
  }, [setUsers, toast]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedUsers.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    try {
      await Promise.all(selectedUsers.map(userId => adminService.deleteUser(userId)));
      toast({ title: "Success", description: `${selectedUsers.length} users deleted successfully` });
      setUsers(users.filter(u => !selectedUsers.includes(u._id)));
      setSelectedUsers([]);
    } catch (error) {
      logger.error("Failed to delete selected users", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete selected users",
        variant: "destructive"
      });
    }
  }, [selectedUsers, users, setUsers, setSelectedUsers, toast]);

  const exportUsersData = useCallback((filteredUsers: AdminUser[]) => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Verified', 'Created Date', 'Last Login', 'Login Count'].join(','),
      ...filteredUsers.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        user.role || 'user',
        user.isVerified ? 'Yes' : 'No',
        new Date(user.createdAt || '').toLocaleDateString(),
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
        user.loginCount || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({ title: "Success", description: "Users data exported successfully" });
  }, [toast]);

  return {
    handleDeleteUser,
    handleToggleRole,
    handleBulkDelete,
    exportUsersData,
  };
};

