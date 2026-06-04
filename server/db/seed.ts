import bcrypt from "bcrypt";
import { db } from "./index";
import { users, lockSystems, keys } from "./schema";

const SALT_ROUNDS = 10;

/**
 * Seeds the database with the same data the in-memory services start with.
 * Only inserts if no users exist yet, so it is safe to call on
 * every startup.
 */
export async function seedDatabase(): Promise<void> {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) return;

  await db.insert(users).values([
    {
      id: "f1a2b3c4-0001-0001-0001-000000000001",
      name: "Alice Admin",
      email: "alice@example.com",
      passwordHash: await bcrypt.hash("password", SALT_ROUNDS),
      role: "admin",
    },
    {
      id: "f1a2b3c4-0001-0001-0001-000000000002",
      name: "Ulf User",
      email: "ulf@example.com",
      passwordHash: await bcrypt.hash("password", SALT_ROUNDS),
      role: "user",
    },
  ]);

  await db.insert(lockSystems).values([
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      referenceCode: "SYS-001",
      name: "Storgatan 12",
      description: "Master System",
    },
    {
      id: "b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22",
      referenceCode: "SYS-002",
      name: "Nygatan 8",
      description: "Master System",
    },
  ]);

  await db.insert(keys).values([
    {
      id: "e1f2a3b4-0001-0001-0001-000000000001",
      label: "A101",
      description: "Main Entrance",
      accessLevel: "Master",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
    {
      id: "e1f2a3b4-0001-0001-0001-000000000002",
      label: "A102",
      description: "Apartment 1A",
      accessLevel: "Individual",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
    {
      id: "e1f2a3b4-0001-0001-0001-000000000003",
      label: "A103",
      description: "Apartment 1B",
      accessLevel: "Individual",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
  ]);
}
