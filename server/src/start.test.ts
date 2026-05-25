import * as SuperTest from "supertest";
import { app } from "./start";

const request = SuperTest.default(app);

// IDs from seed data in UserService / LockSystemService / KeyService
const ADMIN_ID = "f1a2b3c4-0001-0001-0001-000000000001";
const USER_ID  = "f1a2b3c4-0001-0001-0001-000000000002";
const SYS_001_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const KEY_A101_ID = "e1f2a3b4-0001-0001-0001-000000000001";

// ---------------------------------------------------------------------------
// Lock systems
// ---------------------------------------------------------------------------

test("POST /lock-systems creates a lock system and returns 201", async () => {
  const res = await request
    .post("/lock-systems")
    .send({ name: "Building A", description: "Main building" });

  expect(res.statusCode).toEqual(201);
  expect(res.body.name).toEqual("Building A");
  expect(res.body.referenceCode).toMatch(/^SYS-/);
  expect(res.body.id).toBeDefined();
});

test("POST /lock-systems returns 400 when name is missing", async () => {
  const res = await request
    .post("/lock-systems")
    .send({ description: "No name provided" });

  expect(res.statusCode).toEqual(400);
});

test("GET /lock-systems returns all systems for the admin user", async () => {
  const res = await request.get(`/lock-systems?userId=${ADMIN_ID}`);

  expect(res.statusCode).toEqual(200);
  expect(Array.isArray(res.body)).toBe(true);
  // At minimum the two seeded systems should be present
  expect(res.body.length).toBeGreaterThanOrEqual(2);
});

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

test("POST /keys creates a key and returns 201", async () => {
  const res = await request.post("/keys").send({
    label: "Z101",
    description: "Back door",
    accessLevel: "Common",
    lockSystemId: SYS_001_ID,
  });

  expect(res.statusCode).toEqual(201);
  expect(res.body.label).toEqual("Z101");
  expect(res.body.lockSystemId).toEqual(SYS_001_ID);
});

test("POST /keys returns 400 when accessLevel is invalid", async () => {
  const res = await request.post("/keys").send({
    label: "Z102",
    description: "Test",
    accessLevel: "SuperMaster",   // not a valid value
    lockSystemId: SYS_001_ID,
  });

  expect(res.statusCode).toEqual(400);
});

// ---------------------------------------------------------------------------
// End-to-end: assign lock system → create key → place order
// ---------------------------------------------------------------------------

test("End-to-end: user can order a key from an assigned lock system", async () => {
  // Create a dedicated lock system for this test
  const createLS = await request
    .post("/lock-systems")
    .send({ name: "E2E Building", description: "End-to-end test" });
  expect(createLS.statusCode).toEqual(201);
  const lockSystemId: string = createLS.body.id;

  // Assign it to the regular user
  const assignRes = await request
    .patch(`/users/${USER_ID}/assign-lock-system`)
    .send({ lockSystemId });
  expect(assignRes.statusCode).toEqual(200);

  // Create a key inside it
  const createKey = await request.post("/keys").send({
    label: "E2E-KEY",
    description: "E2E entrance key",
    accessLevel: "Individual",
    lockSystemId,
  });
  expect(createKey.statusCode).toEqual(201);

  // Place the order
  const orderRes = await request.post("/orders").send({
    userId: USER_ID,
    keyId: createKey.body.id,
    quantity: 1,
    reason: "lost",
  });

  expect(orderRes.statusCode).toEqual(201);
  expect(orderRes.body.userId).toEqual(USER_ID);
  expect(orderRes.body.keyId).toEqual(createKey.body.id);
  expect(orderRes.body.status).toEqual("placed");
});

test("POST /orders returns 403 when user is not assigned to the lock system", async () => {
  // KEY_A101_ID belongs to SYS-001; USER_ID is not assigned to SYS-001 by default
  const res = await request.post("/orders").send({
    userId: USER_ID,
    keyId: KEY_A101_ID,
    quantity: 1,
    reason: "damaged",
  });

  expect(res.statusCode).toEqual(403);
});
