import { User } from "@/types/user";
import { LockSystem } from "@/types/lock-system";
import { AssignLockSystemSheet } from "./assign-lock-system-sheet";

type RegularUserTableProps = {
  users: User[];
  lockSystems: LockSystem[];
  onAssigned: () => void;
};

export const RegularUserList = ({ users, lockSystems, onAssigned }: RegularUserTableProps) => {
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
                <AssignLockSystemSheet
                  user={user}
                  lockSystems={lockSystems}
                  onAssigned={onAssigned}
                />
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
  admins: User[];
};

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
