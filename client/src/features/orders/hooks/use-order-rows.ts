import { useMemo } from "react";
import { useOrders, useAllKeys } from "./use-orders";
import { useLockSystems } from "@/features/lock-systems/hooks/use-lock-systems";
import { useUsers } from "@/features/users/hooks/use-users";
import { Order } from "@/types/order";

/** An order joined with the display data of its key, lock system and user. */
export type OrderRow = {
  /** The order itself. */
  order: Order;
  /** Label of the ordered key, falling back to the raw key ID. */
  keyLabel: string;
  /** Reference code of the key's lock system, falling back to "—". */
  lockSystemCode: string;
  /** Name of the ordering user, falling back to the raw user ID. */
  userName: string;
};

/**
 * Joins orders with key, lock system and user data into display rows.
 *
 * @param withUsers - Pass `false` for non-admins: `GET /users` is
 *   admin-only, so the user lookup is skipped entirely and `userName`
 *   falls back to the ID.
 * @returns `rows` — the joined display rows; `isLoading` and `error` —
 *   state of the order request; `refetch` — refetches the orders.
 */
export function useOrderRows({ withUsers }: { withUsers: boolean }) {
  const { orders, isLoading, error, refetch } = useOrders();
  const { keys } = useAllKeys();
  const { lockSystems } = useLockSystems();
  const { users } = useUsers(withUsers);

  const rows = useMemo<OrderRow[]>(
    () =>
      orders.map((order) => {
        const key = keys.find((k) => k.id === order.keyId);
        const lockSystem = lockSystems.find((ls) => ls.id === key?.lockSystemId);
        const user = users.find((u) => u.id === order.userId);
        return {
          order,
          keyLabel: key?.label ?? order.keyId,
          lockSystemCode: lockSystem?.referenceCode ?? "—",
          userName: user?.name ?? order.userId,
        };
      }),
    [orders, keys, lockSystems, users],
  );

  return { rows, isLoading, error, refetch };
}
