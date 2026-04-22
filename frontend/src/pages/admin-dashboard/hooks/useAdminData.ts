import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminService, AdminSystemStats, AdminUser } from "@/services/admin.service";
import { logger } from "@/utils/logger";

export const useAdminData = () => {
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdminData = async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.fetchSystemStats(),
        adminService.fetchUsers()
      ]);

      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      logger.error("Failed to fetch admin data", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load admin dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return {
    stats,
    users,
    loading,
    fetchAdminData,
    setUsers,
  };
};

