/**
 * Barrel module re-exporting the full database schema. Importing
 * `* as schema` from here gives Drizzle every table, enum and relation.
 */
export * from "./schemas/lock-system.db";
export * from "./schemas/key.db";
export * from "./schemas/user.db";
export * from "./schemas/order.db";
export * from "./schemas/relations";
