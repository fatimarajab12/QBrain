import { AdminUser } from "@/services/admin.service";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";

interface UserManagementTabProps {
  filteredUsers: AdminUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: "all" | "user" | "admin";
  onRoleFilterChange: (role: "all" | "user" | "admin") => void;
  selectedUsers: string[];
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onToggleRole: (user: AdminUser) => void;
  onBulkDelete: () => void;
}

export const UserManagementTab = ({
  filteredUsers,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onDeleteUser,
  onToggleRole,
  onBulkDelete,
}: UserManagementTabProps) => {
  return (
    <div className="space-y-6">
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
        selectedCount={selectedUsers.length}
        onBulkDelete={onBulkDelete}
      />

      <UserTable
        users={filteredUsers}
        selectedUsers={selectedUsers}
        onSelectUser={onSelectUser}
        onSelectAll={onSelectAll}
        onDeleteUser={onDeleteUser}
        onToggleRole={onToggleRole}
      />
    </div>
  );
};

