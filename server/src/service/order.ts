import { randomUUID } from "crypto";
import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { UserService } from "./user";
import { KeyService } from "./key";

export class OrderService {
  private orders: Order[] = [];

  /** Returns all orders. */
  async getOrders(): Promise<Order[]> {
    return JSON.parse(JSON.stringify(this.orders));
  }

  /** Returns all orders placed by the given user. */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId).map((o) => ({ ...o }));
  }

  /**
   * Places an order for a key on behalf of a user.
   * Returns "USER_NOT_FOUND", "KEY_NOT_FOUND", or "FORBIDDEN" if the request is invalid.
   */
  async placeOrder(
    userId: string,
    keyId: string,
    quantity: number,
    reason: OrderReason,
    reasonDetail: string | undefined,
    userService: UserService,
    keyService: KeyService,
  ): Promise<Order | "USER_NOT_FOUND" | "KEY_NOT_FOUND" | "FORBIDDEN"> {
    const user = await userService.getUserById(userId);
    if (!user) return "USER_NOT_FOUND";

    const key = await keyService.getKeyById(keyId);
    if (!key) return "KEY_NOT_FOUND";

    if (user.role !== "admin" && !user.assignedLockSystemIds.includes(key.lockSystemId)) {
      return "FORBIDDEN";
    }

    const order: Order = {
      id: randomUUID(),
      userId,
      keyId,
      quantity,
      reason,
      ...(reasonDetail !== undefined && { reasonDetail }),
      status: "placed",
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);
    return { ...order };
  }

  /** Updates the status of an existing order. Returns "NOT_FOUND" if the order does not exist. */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | "NOT_FOUND"> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return "NOT_FOUND";
    order.status = status;
    return { ...order };
  }
}
