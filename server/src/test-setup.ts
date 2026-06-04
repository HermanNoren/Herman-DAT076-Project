import { migrate } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { db } from "../db";
import * as schema from "../db/schema";
import { seedDatabase } from "../db/seed";

/**
 * Runs once per test file. The db instance is a fresh, empty PGlite
 * (see db/index.ts), so apply the real migrations and seed it with the
 * same data the dev database starts with.
 */
beforeAll(async () => {
  await migrate(db as unknown as PgliteDatabase<typeof schema>, {
    migrationsFolder: "./db/migrations",
  });
  await seedDatabase();
});

/** Shut the PGlite instance down so the Jest worker can exit cleanly. */
afterAll(async () => {
  await (
    db as unknown as { $client: { close(): Promise<void> } }
  ).$client.close();
});
