import { PageHeader } from "@/components/page-header";
import { LockSystemList } from "@/features/lock-systems/components/lock-system-list";
import { CreateLockSystemSheet } from "@/features/lock-systems/components/create-lock-system-sheet";
import { useLockSystems, useKeyCountsByLockSystem } from "@/features/lock-systems/hooks/use-lock-systems";
import { useUser } from "@/context/user-context";

export const LockSystemsPage = () => {
  const { user } = useUser();
  const { lockSystems, refetch } = useLockSystems();
  const { counts: keyCounts } = useKeyCountsByLockSystem();

  return (
    <>
      <PageHeader
        title="Lock Systems"
        description="Manage and view your key systems"
        action={
          user.role === "admin" ? (
            <CreateLockSystemSheet onCreated={refetch} />
          ) : undefined
        }
      />
      <LockSystemList lockSystems={lockSystems} keyCounts={keyCounts} />
    </>
  );
};
