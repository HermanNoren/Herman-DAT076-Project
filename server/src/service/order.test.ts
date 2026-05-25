import { UserService } from "./user";
import { KeyService } from "./key";
import { OrderService } from "./order";

// IDs from UserService seed data
const ADMIN_ID = "f1a2b3c4-0001-0001-0001-000000000001";
const USER_ID  = "f1a2b3c4-0001-0001-0001-000000000002";
const NONEXISTENT_USER_ID = "00000000-0000-0000-0000-000000000000";

// A lock system ID that does not clash with the seeded KeyService data
const FAKE_LOCK_SYSTEM_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

// Shared instances – created once to avoid repeating bcrypt hashing per test
const userService = new UserService();
const keyService  = new KeyService();

describe("OrderService", () => {
  let orderService: OrderService;

  beforeEach(() => {
    // Fresh order store for each test so orders don't leak between cases
    orderService = new OrderService();
  });

  test("admin user can place an order for any key", async () => {
    const key = await keyService.addKey("T001", "Test key", "Common", FAKE_LOCK_SYSTEM_ID);
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
    const key = await keyService.addKey("T002", "Another key", "Individual", FAKE_LOCK_SYSTEM_ID);
    expect(key).not.toEqual("DUPLICATE_LABEL");
    if (key === "DUPLICATE_LABEL") return;

    const result = await orderService.placeOrder(
      USER_ID, key.id, 1, "damaged", undefined, userService, keyService,
    );

    expect(result).toBe("FORBIDDEN");
  });

  test("returns USER_NOT_FOUND for a non-existent userId", async () => {
    const key = await keyService.addKey("T003", "Some key", "Master", FAKE_LOCK_SYSTEM_ID);
    expect(key).not.toEqual("DUPLICATE_LABEL");
    if (key === "DUPLICATE_LABEL") return;

    const result = await orderService.placeOrder(
      NONEXISTENT_USER_ID, key.id, 1, "lost", undefined, userService, keyService,
    );

    expect(result).toBe("USER_NOT_FOUND");
  });

  test("returns KEY_NOT_FOUND for a non-existent keyId", async () => {
    const result = await orderService.placeOrder(
      ADMIN_ID, "00000000-0000-0000-0000-000000000000", 1, "lost", undefined, userService, keyService,
    );

    expect(result).toBe("KEY_NOT_FOUND");
  });
});
