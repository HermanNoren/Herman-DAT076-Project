/**
 * Server entry point — seeds the database and starts the HTTP server.
 *
 * The schema must already exist (created by `npm run db:migrate`).
 * Seeding is idempotent: it only inserts if the database is empty.
 */
import { app } from "./start";
import { seedDatabase } from "../db/seed";

const PORT: number = 8080;

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
