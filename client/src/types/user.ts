/** The role a user account can have. Admins manage the system; users order keys. */
export type UserRole = "admin" | "user";

/**
 * A user as returned by the API. Mirrors the server's `UserPublic` —
 * the password hash never reaches the client.
 */
export interface User {
  /** Unique identifier (UUID). */
  id: string;
  /** Display name, e.g. "Alice Admin". */
  name: string;
  /** Email address used to log in. */
  email: string;
  /** Determines which pages and actions are available in the UI. */
  role: UserRole;
  /** IDs of the lock systems this user has been granted access to. */
  assignedLockSystemIds: string[];
}
