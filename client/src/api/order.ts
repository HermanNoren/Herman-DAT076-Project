import { api } from "./axios";
import { Order, OrderReason, OrderStatus } from "../types/order";

/** Fetches all orders (admin) or the current user's orders (user) based on session. */
export async function getOrders(): Promise<Order[]> {
  const response = await api.get("/orders");
  return response.data;
}

/** Places a new order for a key on behalf of the current session user. */
export async function placeOrder(
  keyId: string,
  quantity: number,
  reason: OrderReason,
  reasonDetail?: string,
): Promise<Order> {
  const response = await api.post("/orders", { keyId, quantity, reason, reasonDetail });
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
