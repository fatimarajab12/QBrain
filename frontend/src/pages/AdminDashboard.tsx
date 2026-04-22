import { BarChart3, Shield, UserCheck } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAdminData } from "./admin-dashboard/hooks/useAdminData";
import { useUserFilters } from "./admin-dashboard/hooks/useUserFilters";
import { useUserSelection } from "./admin-dashboard/hooks/useUserSelection";
import { useUserActions } from "./admin-dashboard/hooks/useUserActions";
import { AdminHeader } from "./admin-dashboard/components/AdminHeader";
import { StatsCards } from "./admin-dashboard/components/StatsCards";
import { OverviewTab } from "./admin-dashboard/components/OverviewTab";
import { UserManagementTab } from "./admin-dashboard/components/UserManagementTab";
import { SystemHealthTab } from "./admin-dashboard/components/SystemHealthTab";
import { LoadingState } from "./admin-dashboard/components/LoadingState";

const AdminDashboard = () => {
  const { stats, users, loading, fetchAdminData, setUsers } = useAdminData();
  const { searchQuery, setSearchQuery, roleFilter, setRoleFilter, filteredUsers } = useUserFilters(users);
  const { selectedUsers, setSelectedUsers, handleSelectUser, handleSelectAll } = useUserSelection(filteredUsers);
  const { handleDeleteUser, handleToggleRole, handleBulkDelete, exportUsersData } = useUserActions({
    users,
    setUsers,
    selectedUsers,
    setSelectedUsers,
  });

  const handleExport = () => {
    exportUsersData(filteredUsers);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        <AdminHeader onRefresh={fetchAdminData} onExport={handleExport} />

        <StatsCards stats={stats} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <UserCheck className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Shield className="h-4 w-4" />
              System Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab stats={stats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagementTab
              filteredUsers={filteredUsers}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              roleFilter={roleFilter}
              onRoleFilterChange={setRoleFilter}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
              onDeleteUser={handleDeleteUser}
              onToggleRole={handleToggleRole}
              onBulkDelete={handleBulkDelete}
            />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemHealthTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
