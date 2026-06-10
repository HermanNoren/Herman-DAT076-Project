/**
 * Database connection used by every service. Connects to Postgres via
 * `DATABASE_URL` in production/development, or to an in-process PGlite
 * instance under test.
 */
import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

/** The Drizzle database handle type, parameterized with the full schema. */
export type Database = NodePgDatabase<typeof schema>;

/**
 * Creates the database handle for the current environment.
 *
 * @returns A Postgres-backed handle, or a PGlite-backed one when
 *   `NODE_ENV` is "test".
 */
function createDb(): Database {
  if (process.env.NODE_ENV === "test") {
    // Tests run against PGlite — an in-process Postgres (no Docker, no
    // connection string), so they can never touch the development database.
    // Jest gives every test file a fresh module registry, so each file gets
    // its own empty instance; src/test-setup.ts migrates and seeds it.
    // Required lazily so production never loads the WASM bundle.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle: drizzlePglite } = require("drizzle-orm/pglite");
    return drizzlePglite({ schema }) as unknown as Database;
  }
  return drizzle(process.env.DATABASE_URL!, { schema });
}

/** The single shared database handle. */
export const db = createDb();
