import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

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

export type LockSystem = InferSelectModel<typeof lockSystems>;
export type NewLockSystem = InferInsertModel<typeof lockSystems>;
