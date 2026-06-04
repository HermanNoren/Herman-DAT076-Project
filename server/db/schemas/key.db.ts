import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  unique,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { lockSystems } from "./lock-system.db";

export const accessLevel = pgEnum("access_level", [
  "Master",
  "Individual",
  "Common",
]);

export const keys = pgTable(
  "keys",
  {
    id: uuid("id").primaryKey(),
    label: text("label").notNull(),
    description: text("description").notNull(),
    accessLevel: accessLevel("access_level").notNull(),
    lockSystemId: uuid("lock_system_id")
      .references(() => lockSystems.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [unique("keys_lock_system_id_label_unique").on(t.lockSystemId, t.label)],
);

export type Key = InferSelectModel<typeof keys>;
export type NewKey = InferInsertModel<typeof keys>;
