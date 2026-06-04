import { useParams } from "react-router-dom";
import { PageHeader } from "@/components/page-header";
import { useLockSystem, useLockSystemKeys } from "@/features/lock-systems/hooks/use-lock-systems";
import { LockSystemKeys } from "@/features/lock-systems/components/lock-system-keys";
import { CreateKeySheet } from "@/features/lock-systems/components/create-key-sheet";
import { useAuth } from "@/features/auth/context/auth-context";

export const LockSystemDetailPage = () => {
  const { referenceCode } = useParams<{ referenceCode: string }>();
  const { user } = useAuth();
  const { lockSystem } = useLockSystem(referenceCode!);
  const { keys, refetch } = useLockSystemKeys(lockSystem?.id ?? "");

  return (
    <>
      <PageHeader
        title={lockSystem?.name ?? ""}
        description={`${lockSystem?.referenceCode} ⋅ ${lockSystem?.description}`}
        action={
          user?.role === "admin" && lockSystem ? (
            <CreateKeySheet lockSystemId={lockSystem.id} onCreated={refetch} />
          ) : undefined
        }
      />
      {lockSystem && <LockSystemKeys lockSystem={lockSystem} keys={keys} />}
    </>
  );
};
