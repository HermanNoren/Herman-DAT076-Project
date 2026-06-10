/** The role a user account can have. Admins manage the system; users order keys. */
export type UserRole = "admin" | "user";

/**
 * A user account as stored on the server.
 *
 * This is the full model including the password hash — it must never be
 * sent to clients. API responses use {@link UserPublic} instead.
 */
export interface User {
  /** Unique identifier (UUID). */
  id: string;
  /** Display name, e.g. "Alice Admin". */
  name: string;
  /** Email address used to log in. Unique across all users. */
  email: string;
  /** bcrypt hash (10 rounds) of the user's password. */
  passwordHash: string;
  /** Determines which routes and actions the user may access. */
  role: UserRole;
  /** IDs of the lock systems this user has been granted access to. */
  assignedLockSystemIds: string[];
}

/** The shape returned to API clients — {@link User} without the password hash. */
export type UserPublic = Omit<User, "passwordHash">;
