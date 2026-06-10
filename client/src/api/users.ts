import { api } from "./axios";
import { User, UserRole } from "../types/user";

/**
 * Fetches all users. Admin only.
 *
 * @returns Every user account.
 * @throws An axios error with status 403 if the session user is not an admin.
 */
export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data;
}

/**
 * Creates a new user account. Admin only — there is no self-registration.
 *
 * @param name - Display name.
 * @param email - Login email; must be unique.
 * @param password - Plain-text password (hashed on the server).
 * @param role - Whether the account is an admin or a regular user.
 * @returns The created user.
 * @throws An axios error with status 409 if the email is already taken.
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<User> {
  const response = await api.post("/users", { name, email, password, role });
  return response.data;
}

/**
 * Grants a user access to a lock system. Admin only.
 *
 * @param userId - UUID of the user.
 * @param lockSystemId - UUID of the lock system to assign.
 * @returns The updated user.
 * @throws An axios error with status 404 if the user or system does not exist.
 */
export async function assignLockSystem(
  userId: string,
  lockSystemId: string,
): Promise<User> {
  const response = await api.patch(`/users/${userId}/assign-lock-system`, { lockSystemId });
  return response.data;
}

/**
 * Deletes a non-admin user. Admin only.
 *
 * @param userId - UUID of the user to delete.
 * @throws An axios error with status 403 if the target is an admin account,
 *   or 404 if the user does not exist.
 */
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

/**
 * Revokes a user's access to a lock system. Admin only.
 *
 * @param userId - UUID of the user.
 * @param lockSystemId - UUID of the lock system to unassign.
 * @returns The updated user.
 * @throws An axios error with status 404 if the user does not exist.
 */
export async function unassignLockSystem(
  userId: string,
  lockSystemId: string,
): Promise<User> {
  const response = await api.patch(`/users/${userId}/unassign-lock-system`, { lockSystemId });
  return response.data;
}
