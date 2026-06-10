import { LockSystem } from "@/types/lock-system";
import { ChevronRight, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  /** The lock system to display. */
  lockSystem: LockSystem;
  /** Number of keys in the system; "—" is shown while it is unknown. */
  keyCount?: number;
};

/** Card linking to a lock system's detail page, with name, code and key count. */
export const LockSystemCard = ({ lockSystem, keyCount }: Props) => {
  const keyLabel =
    keyCount === undefined ? "—" : `${keyCount} ${keyCount === 1 ? "key" : "keys"}`;

  return (
    <Link
      to={`/lock-systems/${lockSystem.referenceCode}`}
      className="bg-card p-4 border flex flex-col gap-4 rounded-lg hover:border-primary transition-colors"
    >
      <div className="bg-accent p-2 rounded-md w-fit">
        <KeyRound className="size-6 text-foreground" />
      </div>
      <div className="">
        <h3 className="text-sm">{lockSystem.name}</h3>
        <p className="text-sm text-muted-foreground">
          {lockSystem.referenceCode} ⋅ {lockSystem.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{keyLabel}</p>
        <ChevronRight className="size-4 text-muted-foreground" />
      </div>
    </Link>
  );
};
