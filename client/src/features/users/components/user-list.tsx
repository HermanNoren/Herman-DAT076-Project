import { Trash2 } from "lucide-react";
import { User } from "@/types/user";
import { LockSystem } from "@/types/lock-system";
import { Button } from "@/components/ui/button";
import { AssignLockSystemSheet } from "./assign-lock-system-sheet";
import { useDeleteUser } from "../hooks/use-users";

type RegularUserTableProps = {
  /** The non-admin users to list. */
  users: User[];
  /** All lock systems, passed through to the assignment sheet. */
  lockSystems: LockSystem[];
  /** Called after an assignment change so the parent can refetch. */
  onAssigned: () => void;
  /** Called after a successful deletion so the parent can refetch. */
  onDeleted: () => void;
};

/**
 * Admin table of regular users with per-row actions: manage lock system
 * assignments and delete the user.
 */
export const RegularUserList = ({ users, lockSystems, onAssigned, onDeleted }: RegularUserTableProps) => {
  const { remove } = useDeleteUser();

  async function handleDelete(userId: string) {
    const ok = await remove(userId);
    if (ok) onDeleted();
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Assigned Systems
            </th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                {user.name}
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">
                {user.email}
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">
                {user.assignedLockSystemIds.length}
              </td>
              <td className="px-3 py-2.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <AssignLockSystemSheet
                    user={user}
                    lockSystems={lockSystems}
                    onAssigned={onAssigned}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(user.id)}
                    aria-label={`Delete ${user.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No users</p>
        </div>
      )}
    </div>
  );
};

type AdminListProps = {
  /** The admin users to list. */
  admins: User[];
};

/** Read-only table of admin accounts (admins cannot be edited or deleted). */
export const AdminList = ({ admins }: AdminListProps) => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {admins.map((admin) => (
            <tr key={admin.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                {admin.name}
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">
                {admin.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {admins.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No admins</p>
        </div>
      )}
    </div>
  );
};
