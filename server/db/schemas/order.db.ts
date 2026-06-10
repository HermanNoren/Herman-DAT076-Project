import { sql, type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  check,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.db";
import { keys } from "./key.db";

/** Postgres enum mirroring the `OrderStatus` model type. */
export const orderStatus = pgEnum("order_status", [
  "placed",
  "ready",
  "collected",
]);

/** Postgres enum mirroring the `OrderReason` model type. */
export const orderReason = pgEnum("order_reason", [
  "lost",
  "damaged",
  "additional_copy",
  "stolen",
  "other",
]);

/**
 * Key orders. A check constraint enforces a positive quantity; orders are
 * deleted with their user (cascade) but block deletion of their key.
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    keyId: uuid("key_id")
      .references(() => keys.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
    reason: orderReason("reason").notNull(),
    reasonDetail: text("reason_detail"), // nullable, only when reason === "other"
    status: orderStatus("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [check("orders_quantity_positive", sql`${t.quantity} > 0`)],
);

/** A row of the `orders` table (`createdAt` is a `Date`, unlike the API model). */
export type Order = InferSelectModel<typeof orders>;
/** Insert shape for the `orders` table. */
export type NewOrder = InferInsertModel<typeof orders>;
