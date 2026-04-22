import { UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { AdminUser } from "@/services/admin.service";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserTableProps {
  users: AdminUser[];
  selectedUsers: string[];
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onToggleRole: (user: AdminUser) => void;
}

export const UserTable = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAll,
  onDeleteUser,
  onToggleRole,
}: UserTableProps) => {
  return (
    <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          User Management
          <Badge variant="outline" className="ml-auto">
            {users.length} users
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-muted/40">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-border"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} className="border-border/60 hover:bg-muted/30">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => onSelectUser(user._id, e.target.checked)}
                    className="rounded border-border"
                  />
                </TableCell>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.isVerified ? "default" : "secondary"}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role || 'user'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onToggleRole(user)}
                    >
                      {user.role === "admin" ? "Demote" : "Promote"}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{new Date(user.createdAt || '').toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DeleteUserDialog user={user} onDelete={onDeleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No users found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

