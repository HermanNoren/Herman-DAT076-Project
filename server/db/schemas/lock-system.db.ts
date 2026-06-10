import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

/** Lock systems — one row per master key installation at a property. */
export const lockSystems = pgTable("lock_systems", {
  id: uuid("id").primaryKey(),
  referenceCode: text("reference_code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** A row of the `lock_systems` table. */
export type LockSystem = InferSelectModel<typeof lockSystems>;
/** Insert shape for the `lock_systems` table. */
export type NewLockSystem = InferInsertModel<typeof lockSystems>;
