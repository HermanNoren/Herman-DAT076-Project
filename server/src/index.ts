import { app } from "./start";
import { seedDatabase } from "../db/seed";

/**
 * App Variables
 */

const PORT: number = 8080;

/**
 * Server Activation
 *
 * The schema must already exist (created by `drizzle-kit migrate`).
 * Seeding is idempotent — it only inserts if the database is empty.
 */

seedDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  });
