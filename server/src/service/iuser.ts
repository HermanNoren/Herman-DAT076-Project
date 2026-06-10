import { UserPublic, UserRole } from "../model/user.interface";

/**
 * Manages user accounts, their credentials and their lock system assignments.
 *
 * Methods never expose password hashes — all results use {@link UserPublic}.
 * Expected failures are reported as string sentinels in the return type
 * rather than thrown, so callers are forced to handle them.
 */
export interface IUserService {
  /**
   * Looks up a single user.
   *
   * @param id - UUID of the user.
   * @returns The user, or `undefined` if no user with that ID exists.
   */
  getUserById(id: string): Promise<UserPublic | undefined>;

  /**
   * Lists all user accounts.
   *
   * @returns Every user, in no particular order.
   */
  getUsers(): Promise<UserPublic[]>;

  /**
   * Creates a new user account.
   *
   * @param name - Display name.
   * @param email - Login email. Must be unique across all users.
   * @param password - Plain-text password; hashed before storage.
   * @param role - Whether the account is an admin or a regular user.
   * @returns The created user, or `"DUPLICATE_EMAIL"` if the email is taken.
   */
  addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<UserPublic | "DUPLICATE_EMAIL">;

  /**
   * Deletes a user account.
   *
   * @param id - UUID of the user to delete.
   * @returns `"OK"` on success, `"NOT_FOUND"` if the user does not exist,
   *   or `"FORBIDDEN"` if the user is an admin (admins cannot be deleted).
   */
  deleteUser(id: string): Promise<"OK" | "NOT_FOUND" | "FORBIDDEN">;

  /**
   * Grants a user access to a lock system. Assigning an already assigned
   * system is a no-op.
   *
   * @param userId - UUID of the user.
   * @param lockSystemId - UUID of the lock system to assign.
   * @returns The updated user, or `undefined` if the user does not exist.
   */
  assignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined>;

  /**
   * Revokes a user's access to a lock system.
   *
   * @param userId - UUID of the user.
   * @param lockSystemId - UUID of the lock system to unassign.
   * @returns The updated user, or `undefined` if the user does not exist.
   */
  unassignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined>;

  /**
   * Checks login credentials.
   *
   * @param email - Email entered at login.
   * @param password - Plain-text password entered at login.
   * @returns The matching user, or `"INVALID"` if the email is unknown or the
   *   password is wrong — the same sentinel for both, so callers cannot
   *   reveal which one failed.
   */
  verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserPublic | "INVALID">;
}
