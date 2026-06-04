import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  primaryKey,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { lockSystems } from "./lock-system.db";

export const userRole = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userLockSystems = pgTable(
  "user_lock_systems",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lockSystemId: uuid("lock_system_id")
      .references(() => lockSystems.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lockSystemId] })],
);

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserLockSystem = InferSelectModel<typeof userLockSystems>;
export type NewUserLockSystem = InferInsertModel<typeof userLockSystems>;
