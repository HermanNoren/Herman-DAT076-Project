import * as SuperTest from "supertest";
import { app } from "../../start";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const makeSession = require("supertest-session");

const ALICE = { email: "alice@example.com", password: "password" }; // admin
const ULF = { email: "ulf@example.com", password: "password" }; // user

const KEY_A101_ID = "e1f2a3b4-0001-0001-0001-000000000001";
const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

const anon = SuperTest.default(app);

// ---------------------------------------------------------------------------
// POST /orders — place order
// ---------------------------------------------------------------------------

test("POST /orders returns 401 when not logged in", async () => {
  const res = await anon
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 1, reason: "lost" });
  expect(res.statusCode).toEqual(401);
});

test("POST /orders returns 400 for a non-positive quantity", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 0, reason: "lost" });
  expect(res.statusCode).toEqual(400);
});

test("POST /orders returns 400 for an invalid reason", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 1, reason: "because" });
  expect(res.statusCode).toEqual(400);
});

test("POST /orders returns 400 when reason is 'other' without reasonDetail", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 1, reason: "other" });
  expect(res.statusCode).toEqual(400);
});

test("POST /orders returns 404 for an unknown key", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .post("/orders")
    .send({ keyId: UNKNOWN_ID, quantity: 1, reason: "lost" });
  expect(res.statusCode).toEqual(404);
});

test("POST /orders returns 403 for a user not assigned to the key's system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF); // Ulf has no assignments

  const res = await session
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 1, reason: "lost" });
  expect(res.statusCode).toEqual(403);
});

test("POST /orders with reason 'other' stores the reasonDetail", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE); // admin may order any key

  const res = await session.post("/orders").send({
    keyId: KEY_A101_ID,
    quantity: 2,
    reason: "other",
    reasonDetail: "Spare for the janitor",
  });
  expect(res.statusCode).toEqual(201);
  expect(res.body.status).toEqual("placed");
  expect(res.body.reasonDetail).toEqual("Spare for the janitor");
});

// ---------------------------------------------------------------------------
// PATCH /orders/:id/status — advance status (admin only)
// ---------------------------------------------------------------------------

test("PATCH /orders/:id/status returns 401 when not logged in", async () => {
  const res = await anon
    .patch(`/orders/${UNKNOWN_ID}/status`)
    .send({ status: "ready" });
  expect(res.statusCode).toEqual(401);
});

test("PATCH /orders/:id/status returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session
    .patch(`/orders/${UNKNOWN_ID}/status`)
    .send({ status: "ready" });
  expect(res.statusCode).toEqual(403);
});

test("PATCH /orders/:id/status returns 400 for an invalid status", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .patch(`/orders/${UNKNOWN_ID}/status`)
    .send({ status: "shipped" });
  expect(res.statusCode).toEqual(400);
});

test("PATCH /orders/:id/status returns 404 for an unknown order", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .patch(`/orders/${UNKNOWN_ID}/status`)
    .send({ status: "ready" });
  expect(res.statusCode).toEqual(404);
});

test("PATCH /orders/:id/status advances the status", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const orderRes = await session
    .post("/orders")
    .send({ keyId: KEY_A101_ID, quantity: 1, reason: "damaged" });
  expect(orderRes.statusCode).toEqual(201);

  const res = await session
    .patch(`/orders/${orderRes.body.id}/status`)
    .send({ status: "ready" });
  expect(res.statusCode).toEqual(200);
  expect(res.body.status).toEqual("ready");
});
