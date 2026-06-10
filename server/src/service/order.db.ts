import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../../db";
import { orders, type Order as OrderRow } from "../../db/schema";
import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { IOrderService } from "./iorder";
import { IUserService } from "./iuser";
import { IKeyService } from "./ikey";

/** Maps an orders row to the API shape — Date → ISO string, null → omitted. */
function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    keyId: row.keyId,
    quantity: row.quantity,
    reason: row.reason,
    ...(row.reasonDetail != null && { reasonDetail: row.reasonDetail }),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * {@link IOrderService} backed by the `orders` table via Drizzle. See the
 * interface for the full contract of each method.
 */
export class OrderDBService implements IOrderService {
  /**
   * @param userService - Used to look up the ordering user and their assignments.
   * @param keyService - Used to look up the ordered key.
   */
  constructor(
    private readonly userService: IUserService,
    private readonly keyService: IKeyService,
  ) {}

  /** Returns all orders. */
  async getOrders(): Promise<Order[]> {
    return (await db.select().from(orders)).map(rowToOrder);
  }

  /** Returns all orders placed by the given user. */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId));
    return rows.map(rowToOrder);
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
  ): Promise<Order | "USER_NOT_FOUND" | "KEY_NOT_FOUND" | "FORBIDDEN"> {
    const user = await this.userService.getUserById(userId);
    if (!user) return "USER_NOT_FOUND";

    const key = await this.keyService.getKeyById(keyId);
    if (!key) return "KEY_NOT_FOUND";

    if (
      user.role !== "admin" &&
      !user.assignedLockSystemIds.includes(key.lockSystemId)
    ) {
      return "FORBIDDEN";
    }

    const [row] = await db
      .insert(orders)
      .values({
        id: randomUUID(),
        userId,
        keyId,
        quantity,
        reason,
        reasonDetail: reasonDetail ?? null,
        status: "placed",
        // createdAt/updatedAt are filled by the DB defaults
      })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return rowToOrder(row);
  }

  /** Updates the status of an existing order. Returns "NOT_FOUND" if the order does not exist. */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | "NOT_FOUND"> {
    const [row] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    if (!row) return "NOT_FOUND";
    return rowToOrder(row);
  }
}
