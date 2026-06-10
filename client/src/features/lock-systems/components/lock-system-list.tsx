import { LockSystemCard } from "./lock-system-card";
import { LockSystem } from "@/types/lock-system";

type Props = {
  /** The lock systems to display. */
  lockSystems: LockSystem[];
  /** Key count per lock system ID, used by the cards. */
  keyCounts?: Record<string, number>;
};

/** Responsive grid of {@link LockSystemCard}s. */
export const LockSystemList = ({ lockSystems, keyCounts = {} }: Props) => {
  return (
    <>
      {lockSystems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockSystems.map((lockSystem) => (
            <LockSystemCard
              key={lockSystem.id}
              lockSystem={lockSystem}
              keyCount={keyCounts[lockSystem.id]}
            />
          ))}
        </div>
      )}
    </>
  );
};
