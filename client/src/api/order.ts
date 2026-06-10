import { api } from "./axios";
import { Order, OrderReason, OrderStatus } from "../types/order";

/**
 * Fetches orders for the current session user — every order for admins,
 * own orders only for regular users.
 *
 * @returns The visible orders.
 */
export async function getOrders(): Promise<Order[]> {
  const response = await api.get("/orders");
  return response.data;
}

/**
 * Places an order for copies of a key. The ordering user is derived from
 * the session on the server.
 *
 * @param keyId - UUID of the key to order.
 * @param quantity - Number of copies; must be a positive integer.
 * @param reason - Why the key is needed.
 * @param reasonDetail - Free-text explanation; required when `reason` is "other".
 * @returns The created order.
 * @throws An axios error with status 403 if the user is not assigned to the
 *   key's lock system, or 404 if the key does not exist.
 */
export async function placeOrder(
  keyId: string,
  quantity: number,
  reason: OrderReason,
  reasonDetail?: string,
): Promise<Order> {
  const response = await api.post("/orders", { keyId, quantity, reason, reasonDetail });
  return response.data;
}

/**
 * Sets the status of an order. Admin only.
 *
 * @param orderId - UUID of the order.
 * @param status - The new status.
 * @returns The updated order.
 * @throws An axios error with status 404 if the order does not exist.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
}
