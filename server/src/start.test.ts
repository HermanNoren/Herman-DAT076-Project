import * as SuperTest from "supertest";
import { app } from "./start";

// supertest-session preserves cookies between requests in the same session object
// eslint-disable-next-line @typescript-eslint/no-require-imports
const makeSession = require("supertest-session");

// Seeded credentials (from UserService seed data)
const ALICE = { email: "alice@example.com", password: "password" }; // admin
const ULF   = { email: "ulf@example.com",   password: "password" }; // user

const SYS_001_ID  = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const KEY_A101_ID = "e1f2a3b4-0001-0001-0001-000000000001";

// Plain (no-session) client for unauthenticated requests
const anon = SuperTest.default(app);

// ---------------------------------------------------------------------------
// POST /session — login
// ---------------------------------------------------------------------------

test("POST /session returns 200 and user for valid credentials", async () => {
  const session = makeSession(app);
  const res = await session.post("/session").send(ALICE);

  expect(res.statusCode).toEqual(200);
  expect(res.body.email).toEqual(ALICE.email);
  expect(res.body.role).toEqual("admin");
  expect(res.body.passwordHash).toBeUndefined();
});

test("POST /session returns 401 for wrong password", async () => {
  const res = await anon.post("/session").send({ email: ALICE.email, password: "wrongpassword" });
  expect(res.statusCode).toEqual(401);
});

test("POST /session returns 400 for missing fields", async () => {
  const res = await anon.post("/session").send({ email: ALICE.email });
  expect(res.statusCode).toEqual(400);
});

// ---------------------------------------------------------------------------
// GET /session — who am I
// ---------------------------------------------------------------------------

test("GET /session returns 401 when not logged in", async () => {
  const res = await anon.get("/session");
  expect(res.statusCode).toEqual(401);
});

test("GET /session returns the logged-in user after login", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get("/session");
  expect(res.statusCode).toEqual(200);
  expect(res.body.email).toEqual(ALICE.email);
});

// ---------------------------------------------------------------------------
// DELETE /session — logout
// ---------------------------------------------------------------------------

test("DELETE /session logs out and subsequent GET /session returns 401", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const logoutRes = await session.delete("/session");
  expect(logoutRes.statusCode).toEqual(204);

  const meRes = await session.get("/session");
  expect(meRes.statusCode).toEqual(401);
});

// ---------------------------------------------------------------------------
// Auth guards on existing routes
// ---------------------------------------------------------------------------

test("GET /lock-systems returns 401 when not logged in", async () => {
  const res = await anon.get("/lock-systems");
  expect(res.statusCode).toEqual(401);
});

test("GET /lock-systems returns systems when logged in as admin", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get("/lock-systems");
  expect(res.statusCode).toEqual(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThanOrEqual(2);
});

test("GET /orders returns 401 when not logged in", async () => {
  const res = await anon.get("/orders");
  expect(res.statusCode).toEqual(401);
});

test("POST /lock-systems returns 401 when not logged in", async () => {
  const res = await anon.post("/lock-systems").send({ name: "X", description: "Y" });
  expect(res.statusCode).toEqual(401);
});

test("POST /lock-systems returns 403 when logged in as a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.post("/lock-systems").send({ name: "X", description: "Y" });
  expect(res.statusCode).toEqual(403);
});

// ---------------------------------------------------------------------------
// POST /users — admin creates users
// ---------------------------------------------------------------------------

test("POST /users returns 401 when not logged in", async () => {
  const res = await anon.post("/users").send({
    name: "Test User",
    email: "newuser@example.com",
    password: "securepassword",
    role: "user",
  });
  expect(res.statusCode).toEqual(401);
});

test("POST /users creates a new user when logged in as admin and returns 201", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/users").send({
    name: "New User",
    email: "newuser@example.com",
    password: "securepassword",
    role: "user",
  });

  expect(res.statusCode).toEqual(201);
  expect(res.body.email).toEqual("newuser@example.com");
  expect(res.body.role).toEqual("user");
  expect(res.body.passwordHash).toBeUndefined();
});

test("POST /users returns 409 for duplicate email", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/users").send({
    name: "Duplicate",
    email: "alice@example.com",
    password: "somepassword",
    role: "user",
  });
  expect(res.statusCode).toEqual(409);
});

// ---------------------------------------------------------------------------
// Session isolation — user A cannot see user B's orders
// ---------------------------------------------------------------------------

test("users only see their own orders", async () => {
  // Set up: log in as admin, create a lock system, assign to Ulf, create a key
  const adminSession = makeSession(app);
  await adminSession.post("/session").send(ALICE);

  const lsRes = await adminSession
    .post("/lock-systems")
    .send({ name: "Isolation Test", description: "For isolation test" });
  const lockSystemId: string = lsRes.body.id;

  const ulfId = "f1a2b3c4-0001-0001-0001-000000000002";
  await adminSession.patch(`/users/${ulfId}/assign-lock-system`).send({ lockSystemId });

  const keyRes = await adminSession
    .post("/keys")
    .send({ label: "ISO-KEY", description: "Test", accessLevel: "Individual", lockSystemId });
  const keyId: string = keyRes.body.id;

  // Ulf places an order
  const ulfSession = makeSession(app);
  await ulfSession.post("/session").send(ULF);
  const orderRes = await ulfSession.post("/orders").send({ keyId, quantity: 1, reason: "lost" });
  expect(orderRes.statusCode).toEqual(201);

  // Ulf sees his own order
  const ulfOrders = await ulfSession.get("/orders");
  expect(ulfOrders.body.length).toBeGreaterThanOrEqual(1);
  expect(ulfOrders.body.every((o: { userId: string }) => o.userId === ulfId)).toBe(true);

  // Alice (admin) sees ALL orders
  const adminOrders = await adminSession.get("/orders");
  expect(adminOrders.body.length).toBeGreaterThanOrEqual(ulfOrders.body.length);
});
