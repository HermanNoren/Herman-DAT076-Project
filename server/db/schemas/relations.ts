import { relations } from "drizzle-orm";
import { lockSystems } from "./lock-system.db";
import { keys } from "./key.db";
import { users, userLockSystems } from "./user.db";
import { orders } from "./order.db";

export const lockSystemsRelations = relations(lockSystems, ({ many }) => ({
  keys: many(keys),
  userLockSystems: many(userLockSystems),
}));

export const keysRelations = relations(keys, ({ one, many }) => ({
  lockSystem: one(lockSystems, {
    fields: [keys.lockSystemId],
    references: [lockSystems.id],
  }),
  orders: many(orders),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userLockSystems: many(userLockSystems),
  orders: many(orders),
}));

export const userLockSystemsRelations = relations(
  userLockSystems,
  ({ one }) => ({
    user: one(users, {
      fields: [userLockSystems.userId],
      references: [users.id],
    }),
    lockSystem: one(lockSystems, {
      fields: [userLockSystems.lockSystemId],
      references: [lockSystems.id],
    }),
  }),
);

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  key: one(keys, {
    fields: [orders.keyId],
    references: [keys.id],
  }),
}));
