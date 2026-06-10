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

/** Postgres enum mirroring the `UserRole` model type. */
export const userRole = pgEnum("user_role", ["admin", "user"]);

/** User accounts. The bcrypt password hash never leaves the server. */
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

/**
 * Join table: which lock systems each user has access to. The composite
 * primary key makes assignment idempotent, and rows are removed
 * automatically when the user or lock system is deleted (cascade).
 */
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

/** A row of the `users` table (includes the password hash). */
export type User = InferSelectModel<typeof users>;
/** Insert shape for the `users` table. */
export type NewUser = InferInsertModel<typeof users>;

/** A row of the `user_lock_systems` join table. */
export type UserLockSystem = InferSelectModel<typeof userLockSystems>;
/** Insert shape for the `user_lock_systems` join table. */
export type NewUserLockSystem = InferInsertModel<typeof userLockSystems>;
