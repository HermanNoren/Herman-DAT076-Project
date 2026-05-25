import { useEffect, useState } from "react";
import { EllipsisIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@/types/user";
import { LockSystem } from "@/types/lock-system";
import { useAssignLockSystem, useUnassignLockSystem } from "../hooks/use-users";

type Props = {
  user: User;
  lockSystems: LockSystem[];
  onAssigned: () => void;
};

export const AssignLockSystemSheet = ({ user, lockSystems, onAssigned }: Props) => {
  const [assignedIds, setAssignedIds] = useState<string[]>(user.assignedLockSystemIds);
  const { assign, isLoading: isAssigning } = useAssignLockSystem();
  const { unassign, isLoading: isUnassigning } = useUnassignLockSystem();

  const isLoading = isAssigning || isUnassigning;

  useEffect(() => {
    setAssignedIds(user.assignedLockSystemIds);
  }, [user.assignedLockSystemIds]);

  async function handleAssign(lockSystemId: string) {
    const ok = await assign(user.id, lockSystemId);
    if (ok) {
      setAssignedIds((prev) => [...prev, lockSystemId]);
      onAssigned();
    }
  }

  async function handleUnassign(lockSystemId: string) {
    const ok = await unassign(user.id, lockSystemId);
    if (ok) {
      setAssignedIds((prev) => prev.filter((id) => id !== lockSystemId));
      onAssigned();
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <EllipsisIcon className="size-4" />
          <span className="sr-only">Manage lock systems for {user.name}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Assign Lock Systems</SheetTitle>
          <SheetDescription>{user.name}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-1 px-4">
          {lockSystems.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No lock systems available
            </p>
          )}
          {lockSystems.map((system) => {
            const assigned = assignedIds.includes(system.id);
            return (
              <div
                key={system.id}
                className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-secondary/50"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{system.name}</span>
                  <span className="text-xs text-muted-foreground">{system.referenceCode}</span>
                </div>

                {assigned ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isLoading}
                    onClick={() => handleUnassign(system.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Unassign
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleAssign(system.id)}
                  >
                    Assign
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
