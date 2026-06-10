import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { IUserService } from "./iuser";
import { IKeyService } from "./ikey";

/** Manages key orders: placement by users and status updates by admins. */
export interface IOrderService {
  /**
   * Lists all orders from all users.
   *
   * @returns Every order, in no particular order.
   */
  getOrders(): Promise<Order[]>;

  /**
   * Lists the orders placed by one user.
   *
   * @param userId - UUID of the ordering user.
   * @returns That user's orders; empty if they have none.
   */
  getOrdersByUser(userId: string): Promise<Order[]>;

  /**
   * Places an order for copies of a key. The order starts in status
   * "placed". Non-admin users may only order keys from lock systems
   * assigned to them.
   *
   * @param userId - UUID of the ordering user.
   * @param keyId - UUID of the key to order.
   * @param quantity - Number of copies. Must be a positive integer.
   * @param reason - Why the key is needed.
   * @param reasonDetail - Free-text explanation; required when `reason` is "other".
   * @param userService - Used to look up the ordering user and their assignments.
   * @param keyService - Used to look up the ordered key.
   * @returns The created order, or `"USER_NOT_FOUND"` / `"KEY_NOT_FOUND"` if
   *   either does not exist, or `"FORBIDDEN"` if the user is not assigned to
   *   the key's lock system.
   */
  placeOrder(
    userId: string,
    keyId: string,
    quantity: number,
    reason: OrderReason,
    reasonDetail: string | undefined,
    userService: IUserService,
    keyService: IKeyService,
  ): Promise<Order | "USER_NOT_FOUND" | "KEY_NOT_FOUND" | "FORBIDDEN">;

  /**
   * Sets the status of an existing order.
   *
   * @param orderId - UUID of the order.
   * @param status - The new status.
   * @returns The updated order, or `"NOT_FOUND"` if the order does not exist.
   */
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | "NOT_FOUND">;
}
