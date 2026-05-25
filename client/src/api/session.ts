import { api } from "./axios";
import { User } from "../types/user";

/** Logs in with email and password, returning the authenticated user. */
export async function login(email: string, password: string): Promise<User> {
  const response = await api.post("/session", { email, password });
  return response.data;
}

/** Logs out the current session. */
export async function logout(): Promise<void> {
  await api.delete("/session");
}

/** Returns the currently logged-in user, or null if not authenticated. */
export async function getSession(): Promise<User | null> {
  try {
    const response = await api.get("/session");
    return response.data;
  } catch {
    return null;
  }
}
