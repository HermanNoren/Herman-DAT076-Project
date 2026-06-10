/** Lifecycle of an order: placed by a user → ready for pickup → collected. */
export type OrderStatus = "placed" | "ready" | "collected";

/** Why the user needs a new key. "other" requires `reasonDetail` to be set. */
export type OrderReason = "lost" | "damaged" | "additional_copy" | "stolen" | "other";

/** An order for copies of a key. Mirrors the server model. */
export interface Order {
  /** Unique identifier (UUID). */
  id: string;
  /** ID of the user who placed the order. */
  userId: string;
  /** ID of the ordered key. */
  keyId: string;
  /** Number of copies ordered. */
  quantity: number;
  /** Why the key is needed. */
  reason: OrderReason;
  /** Free-text explanation. Only present when `reason` is "other". */
  reasonDetail?: string;
  /** Current processing status. */
  status: OrderStatus;
  /** When the order was placed (ISO 8601 timestamp). */
  createdAt: string;
}
