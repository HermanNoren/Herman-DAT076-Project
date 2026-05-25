import { api } from "./axios";
import { Order, OrderReason, OrderStatus } from "../types/order";

/** Fetches all orders, or only those belonging to the given user if a userId is provided. */
export async function getOrders(userId?: string): Promise<Order[]> {
  const url = userId ? `/orders?userId=${userId}` : "/orders";
  const response = await api.get(url);
  return response.data;
}

/** Places a new order for a key on behalf of the given user. */
export async function placeOrder(
  userId: string,
  keyId: string,
  quantity: number,
  reason: OrderReason,
  reasonDetail?: string,
): Promise<Order> {
  const response = await api.post("/orders", { userId, keyId, quantity, reason, reasonDetail });
  return response.data;
}

/** Updates the status of an existing order (admin only). */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
}
