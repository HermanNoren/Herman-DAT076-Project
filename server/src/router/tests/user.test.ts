import * as SuperTest from "supertest";
import { app } from "../../start";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const makeSession = require("supertest-session");

const ALICE = { email: "alice@example.com", password: "password" }; // admin
const ULF = { email: "ulf@example.com", password: "password" }; // user

const SYS_001_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const ULF_ID = "f1a2b3c4-0001-0001-0001-000000000002";
const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

const anon = SuperTest.default(app);

// ---------------------------------------------------------------------------
// GET /users — list (admin only)
// ---------------------------------------------------------------------------

test("GET /users returns 401 when not logged in", async () => {
  const res = await anon.get("/users");
  expect(res.statusCode).toEqual(401);
});

test("GET /users returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.get("/users");
  expect(res.statusCode).toEqual(403);
});

test("GET /users returns all users without password hashes for an admin", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get("/users");
  expect(res.statusCode).toEqual(200);
  expect(res.body.length).toBeGreaterThanOrEqual(2);
  for (const user of res.body) {
    expect(user.passwordHash).toBeUndefined();
  }
});

// ---------------------------------------------------------------------------
// POST /users — create (validation; happy path is covered in start.test.ts)
// ---------------------------------------------------------------------------

test("POST /users returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.post("/users").send({
    name: "X",
    email: "x@example.com",
    password: "securepassword",
    role: "user",
  });
  expect(res.statusCode).toEqual(403);
});

test("POST /users returns 400 for a too-short password", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/users").send({
    name: "X",
    email: "x@example.com",
    password: "short",
    role: "user",
  });
  expect(res.statusCode).toEqual(400);
});

test("POST /users returns 400 for an invalid role", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/users").send({
    name: "X",
    email: "x@example.com",
    password: "securepassword",
    role: "superadmin",
  });
  expect(res.statusCode).toEqual(400);
});

// ---------------------------------------------------------------------------
// PATCH /users/:id/assign-lock-system
// ---------------------------------------------------------------------------

test("PATCH assign-lock-system returns 401 when not logged in", async () => {
  const res = await anon
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(401);
});

test("PATCH assign-lock-system returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(403);
});

test("PATCH assign-lock-system returns 404 for an unknown lock system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: UNKNOWN_ID });
  expect(res.statusCode).toEqual(404);
});

test("PATCH assign-lock-system returns 404 for an unknown user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .patch(`/users/${UNKNOWN_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(404);
});

test("PATCH assign-lock-system assigns the system and is idempotent", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const first = await session
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(first.statusCode).toEqual(200);
  expect(first.body.assignedLockSystemIds).toContain(SYS_001_ID);

  // assigning the same system again must not create a duplicate
  const second = await session
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(second.statusCode).toEqual(200);
  expect(
    second.body.assignedLockSystemIds.filter((id: string) => id === SYS_001_ID),
  ).toHaveLength(1);
});

// ---------------------------------------------------------------------------
// PATCH /users/:id/unassign-lock-system
// ---------------------------------------------------------------------------

test("PATCH unassign-lock-system returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session
    .patch(`/users/${ULF_ID}/unassign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(403);
});

test("PATCH unassign-lock-system returns 404 for an unknown user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .patch(`/users/${UNKNOWN_ID}/unassign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(404);
});

test("PATCH unassign-lock-system removes the assignment", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  await session
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });

  const res = await session
    .patch(`/users/${ULF_ID}/unassign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });
  expect(res.statusCode).toEqual(200);
  expect(res.body.assignedLockSystemIds).not.toContain(SYS_001_ID);
});
