import { PageHeader } from "@/components/page-header";
import { AdminList, RegularUserList } from "@/features/users/components/user-list";
import { CreateUserSheet } from "@/features/users/components/create-user-sheet";
import { useGroupedUsers } from "@/features/users/hooks/use-users";
import { useLockSystems } from "@/features/lock-systems/hooks/use-lock-systems";

/**
 * Admin page for managing user accounts: create users, manage lock system
 * assignments and delete non-admin users. Admin accounts are listed
 * separately and are read-only.
 */
export const UsersPage = () => {
  const { regularUsers, admins, refetch } = useGroupedUsers();
  const { lockSystems } = useLockSystems();

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage users and their lock system access"
        action={<CreateUserSheet onCreated={refetch} />}
      />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Users</h2>
          <RegularUserList
            users={regularUsers}
            lockSystems={lockSystems}
            onAssigned={refetch}
            onDeleted={refetch}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Admins</h2>
          <AdminList admins={admins} />
        </section>
      </div>
    </>
  );
};
