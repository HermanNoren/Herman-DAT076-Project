import { KeyRound } from "lucide-react";
import { LockSystem } from "@/types/lock-system";
import { Key } from "@/types/key";
import { useUser } from "@/context/user-context";
import { PlaceOrderSheet } from "@/features/orders/components/place-order-sheet";

type Props = {
  lockSystem: LockSystem;
  keys: Key[];
};

export const LockSystemKeys = ({ lockSystem, keys }: Props) => {
  const { user } = useUser();

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Label
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Description
            </th>
            <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Access Level
            </th>
            <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {keys.map((key, i) => (
            <tr
              key={key.id}
              className="hover:bg-secondary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-3.5 w-3.5 text-foreground" />
                  <span className="text-sm font-medium text-card-foreground">
                    {key.label}
                  </span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">
                {key.description}
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {key.accessLevel}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right">
                {user.role === "user" && (
                  <PlaceOrderSheet keyItem={key} lockSystem={lockSystem} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {keys.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No keys</p>
        </div>
      )}
    </div>
  );
};
