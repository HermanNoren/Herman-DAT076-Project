/** How much of a lock system a key opens (master key, individual door, or common areas). */
export type AccessLevel = "Master" | "Individual" | "Common";

/** A physical key belonging to a lock system. Mirrors the server model. */
export interface Key {
  /** Unique identifier (UUID). */
  id: string;
  /** Stamp identifying the key, e.g. "A101". Unique within its lock system. */
  label: string;
  /** What the key opens, e.g. "Main Entrance". */
  description: string;
  /** Access level of the key within its lock system. */
  accessLevel: AccessLevel;
  /** ID of the lock system this key belongs to. */
  lockSystemId: string;
}
