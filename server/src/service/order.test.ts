/**
 * Unit tests for OrderDBService, called directly (not through the routers).
 * Covers service-level branches that are unreachable over HTTP — most notably
 * USER_NOT_FOUND, which requireAuth masks with a 401 at the router layer.
 * Runs against the per-file PGlite instance (migrated + seeded in test-setup).
 */
import { UserDBService } from "./user.db";
import { KeyDBService } from "./key.db";
import { OrderDBService } from "./order.db";

// IDs from the seed data
const ADMIN_ID = "f1a2b3c4-0001-0001-0001-000000000001";
const USER_ID = "f1a2b3c4-0001-0001-0001-000000000002";
const SYS_001_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

const userService = new UserDBService();
const keyService = new KeyDBService();
const orderService = new OrderDBService();

describe("OrderDBService", () => {
  test("admin user can place an order for any key", async () => {
    const key = await keyService.addKey("T001", "Test key", "Common", SYS_001_ID);
    expect(key).not.toEqual("DUPLICATE_LABEL");
    if (key === "DUPLICATE_LABEL") return;

    const result = await orderService.placeOrder(
      ADMIN_ID, key.id, 2, "lost", undefined, userService, keyService,
    );

    expect(typeof result).toBe("object");
    if (typeof result !== "object") return;
    expect(result.userId).toBe(ADMIN_ID);
    expect(result.keyId).toBe(key.id);
    expect(result.quantity).toBe(2);
    expect(result.reason).toBe("lost");
    expect(result.status).toBe("placed");
  });

  test("regular user cannot order a key from an unassigned lock system", async () => {
    // USER_ID has no lock systems assigned by default
    const key = await keyService.addKey("T002", "Another key", "Individual", SYS_001_ID);
    expect(key).not.toEqual("DUPLICATE_LABEL");
    if (key === "DUPLICATE_LABEL") return;

    const result = await orderService.placeOrder(
      USER_ID, key.id, 1, "damaged", undefined, userService, keyService,
    );

    expect(result).toBe("FORBIDDEN");
  });

  test("returns USER_NOT_FOUND for a non-existent userId", async () => {
    // Unreachable through the API: requireAuth would already have sent 401.
    const key = await keyService.addKey("T003", "Some key", "Master", SYS_001_ID);
    expect(key).not.toEqual("DUPLICATE_LABEL");
    if (key === "DUPLICATE_LABEL") return;

    const result = await orderService.placeOrder(
      NONEXISTENT_ID, key.id, 1, "lost", undefined, userService, keyService,
    );

    expect(result).toBe("USER_NOT_FOUND");
  });

  test("returns KEY_NOT_FOUND for a non-existent keyId", async () => {
    const result = await orderService.placeOrder(
      ADMIN_ID, NONEXISTENT_ID, 1, "lost", undefined, userService, keyService,
    );

    expect(result).toBe("KEY_NOT_FOUND");
  });
});
