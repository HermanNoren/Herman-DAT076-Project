import { useCallback, useEffect, useState } from "react";
import { getOrders, placeOrder, updateOrderStatus } from "@/api/order";
import { getAllKeys } from "@/api/lock-systems";
import { Order, OrderReason, OrderStatus } from "@/types/order";
import { Key } from "@/types/key";
import { getApiError } from "@/lib/utils";

/**
 * Fetches orders for the current session user (admins get every order,
 * regular users only their own).
 *
 * @returns `orders` — the fetched orders; `isLoading` and `error` —
 *   request state; `refetch` — runs the fetch again.
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getOrders();
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(getApiError(e, "Failed to fetch orders"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { orders, isLoading, error, refetch };
}

/**
 * Fetches all keys, used to join orders with the labels of the keys they
 * refer to. Errors are ignored — rows fall back to showing raw IDs.
 *
 * @returns `keys` — all fetched keys.
 */
export function useAllKeys() {
  const [keys, setKeys] = useState<Key[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllKeys()
      .then((data) => {
        if (!cancelled) setKeys(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return { keys };
}

/**
 * Places a key order for the current session user.
 *
 * @returns `place` — performs the order, resolving to `true` on success;
 *   `isLoading` and `error` — request state.
 */
export function usePlaceOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function place(
    keyId: string,
    quantity: number,
    reason: OrderReason,
    reasonDetail?: string,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await placeOrder(keyId, quantity, reason, reasonDetail);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to place order"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { place, isLoading, error };
}

/**
 * Sets the status of an order (admin action).
 *
 * @returns `updateStatus` — performs the update, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useUpdateOrderStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await updateOrderStatus(orderId, status);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to update order status"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { updateStatus, isLoading, error };
}
