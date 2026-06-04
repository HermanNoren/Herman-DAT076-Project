import * as SuperTest from "supertest";
import { app } from "../../start";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const makeSession = require("supertest-session");

const ALICE = { email: "alice@example.com", password: "password" }; // admin
const ULF = { email: "ulf@example.com", password: "password" }; // user

const SYS_001_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const ULF_ID = "f1a2b3c4-0001-0001-0001-000000000002";

const anon = SuperTest.default(app);

// ---------------------------------------------------------------------------
// GET /lock-systems — visibility
// ---------------------------------------------------------------------------

test("GET /lock-systems returns an empty list for a user with no assignments", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.get("/lock-systems");
  expect(res.statusCode).toEqual(200);
  expect(res.body).toEqual([]);
});

test("GET /lock-systems returns only assigned systems for a regular user", async () => {
  const adminSession = makeSession(app);
  await adminSession.post("/session").send(ALICE);
  await adminSession
    .patch(`/users/${ULF_ID}/assign-lock-system`)
    .send({ lockSystemId: SYS_001_ID });

  const session = makeSession(app);
  await session.post("/session").send(ULF);

  const res = await session.get("/lock-systems");
  expect(res.statusCode).toEqual(200);
  expect(res.body.length).toEqual(1);
  expect(res.body[0].referenceCode).toEqual("SYS-001");
});

// ---------------------------------------------------------------------------
// GET /lock-systems/:referenceCode — detail
// ---------------------------------------------------------------------------

test("GET /lock-systems/:referenceCode returns 401 when not logged in", async () => {
  const res = await anon.get("/lock-systems/SYS-001");
  expect(res.statusCode).toEqual(401);
});

test("GET /lock-systems/:referenceCode returns the system", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get("/lock-systems/SYS-001");
  expect(res.statusCode).toEqual(200);
  expect(res.body.name).toEqual("Storgatan 12");
});

test("GET /lock-systems/:referenceCode returns 404 for an unknown code", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.get("/lock-systems/SYS-999");
  expect(res.statusCode).toEqual(404);
});

// ---------------------------------------------------------------------------
// POST /lock-systems — create
// ---------------------------------------------------------------------------

test("POST /lock-systems creates a system with the next reference code", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session
    .post("/lock-systems")
    .send({ name: "Lillgatan 3", description: "Side building" });

  expect(res.statusCode).toEqual(201);
  expect(res.body.referenceCode).toEqual("SYS-003"); // SYS-001/002 are seeded
  expect(res.body.name).toEqual("Lillgatan 3");
});

test("POST /lock-systems returns 400 when fields are missing", async () => {
  const session = makeSession(app);
  await session.post("/session").send(ALICE);

  const res = await session.post("/lock-systems").send({ name: "No description" });
  expect(res.statusCode).toEqual(400);
});
