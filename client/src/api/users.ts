import { api } from "./axios";
import { User, UserRole } from "../types/user";

/** Fetches all users. */
export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return response.data;
}

/** Creates a new user with the given credentials and role. */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<User> {
  const response = await api.post("/users", { name, email, password, role });
  return response.data;
}

/** Assigns a lock system to a user. */
export async function assignLockSystem(
  userId: string,
  lockSystemId: string,
): Promise<User> {
  const response = await api.patch(`/users/${userId}/assign-lock-system`, { lockSystemId });
  return response.data;
}

/** Removes a lock system assignment from a user. */
export async function unassignLockSystem(
  userId: string,
  lockSystemId: string,
): Promise<User> {
  const response = await api.patch(`/users/${userId}/unassign-lock-system`, { lockSystemId });
  return response.data;
}
