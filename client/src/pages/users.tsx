import { PageHeader } from "@/components/page-header";
import { AdminList, RegularUserList } from "@/features/users/components/user-list";
import { CreateUserSheet } from "@/features/users/components/create-user-sheet";
import { useUsers } from "@/features/users/hooks/use-users";
import { useLockSystems } from "@/features/lock-systems/hooks/use-lock-systems";

export const UsersPage = () => {
  const { users, refetch: refetchUsers } = useUsers();
  const { lockSystems } = useLockSystems();

  const regularUsers = users.filter((u) => u.role === "user");
  const admins = users.filter((u) => u.role === "admin");

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage users and their lock system access"
        action={<CreateUserSheet onCreated={refetchUsers} />}
      />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">Users</h2>
          <RegularUserList
            users={regularUsers}
            lockSystems={lockSystems}
            onAssigned={refetchUsers}
            onDeleted={refetchUsers}
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
