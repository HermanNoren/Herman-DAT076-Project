import { api } from "./axios";
import { User } from "../types/user";

/**
 * Logs in with email and password. On success the server sets a session
 * cookie that authenticates all subsequent requests.
 *
 * @param email - The user's email address.
 * @param password - The user's plain-text password.
 * @returns The authenticated user.
 * @throws An axios error with status 401 if the credentials are invalid.
 */
export async function login(email: string, password: string): Promise<User> {
  const response = await api.post("/session", { email, password });
  return response.data;
}

/**
 * Logs out by destroying the session on the server.
 */
export async function logout(): Promise<void> {
  await api.delete("/session");
}

/**
 * Fetches the user belonging to the current session cookie, if any.
 * Used on app startup to restore a logged-in state across page reloads.
 *
 * @returns The logged-in user, or `null` if there is no valid session.
 */
export async function getSession(): Promise<User | null> {
  try {
    const response = await api.get("/session");
    return response.data;
  } catch {
    return null;
  }
}
