import * as SuperTest from "supertest";
import { app } from "../../start";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const makeSession = require("supertest-session");

const ALICE = { email: "alice@example.com", password: "password" }; // admin
const ULF = { email: "ulf@example.com", password: "password" }; // user

const SYS_001_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const UNKNOWN_ID = "00000000-0000-0000-0000-000000000000";

const anon = SuperTest.default(app);

// ---------------------------------------------------------------------------
// GET /keys — list
// ---------------------------------------------------------------------------

test("GET /keys returns 401 when not logged in", async () => {
  const res = await anon.get("/keys");
  expect(res.statusCode).toEqual(401);
});

test("GET /keys returns all keys when logged in", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.get("/keys");
  expect(res.statusCode).toEqual(200);
  expect(res.body.length).toBeGreaterThanOrEqual(3); // A101–A103 are seeded
});

test("GET /keys?lockSystemId= returns the keys of that system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get(`/keys?lockSystemId=${SYS_001_ID}`);
  expect(res.statusCode).toEqual(200);
  const labels = res.body.map((k: { label: string }) => k.label);
  expect(labels).toEqual(expect.arrayContaining(["A101", "A102", "A103"]));
});

test("GET /keys?lockSystemId= returns 404 for an unknown lock system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get(`/keys?lockSystemId=${UNKNOWN_ID}`);
  expect(res.statusCode).toEqual(404);
});

// ---------------------------------------------------------------------------
// POST /keys — create
// ---------------------------------------------------------------------------

test("POST /keys returns 401 when not logged in", async () => {
  const res = await anon.post("/keys").send({
    label: "B201",
    description: "Test",
    accessLevel: "Common",
    lockSystemId: SYS_001_ID,
  });
  expect(res.statusCode).toEqual(401);
});

test("POST /keys returns 403 for a regular user", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.post("/keys").send({
    label: "B201",
    description: "Test",
    accessLevel: "Common",
    lockSystemId: SYS_001_ID,
  });
  expect(res.statusCode).toEqual(403);
});

test("POST /keys returns 400 for an invalid access level", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/keys").send({
    label: "B201",
    description: "Test",
    accessLevel: "Superuser",
    lockSystemId: SYS_001_ID,
  });
  expect(res.statusCode).toEqual(400);
});

test("POST /keys returns 404 for an unknown lock system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/keys").send({
    label: "B201",
    description: "Test",
    accessLevel: "Common",
    lockSystemId: UNKNOWN_ID,
  });
  expect(res.statusCode).toEqual(404);
});

test("POST /keys creates a key and returns 201", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/keys").send({
    label: "B201",
    description: "Basement",
    accessLevel: "Common",
    lockSystemId: SYS_001_ID,
  });
  expect(res.statusCode).toEqual(201);
  expect(res.body.label).toEqual("B201");
  expect(res.body.accessLevel).toEqual("Common");
});

test("POST /keys returns 409 for a duplicate label within the same system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/keys").send({
    label: "A101", // seeded in SYS-001
    description: "Duplicate",
    accessLevel: "Individual",
    lockSystemId: SYS_001_ID,
  });
  expect(res.statusCode).toEqual(409);
});
