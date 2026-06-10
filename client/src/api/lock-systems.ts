import { api } from "./axios";
import { LockSystem } from "../types/lock-system";
import { Key } from "../types/key";

/**
 * Fetches a single lock system by its reference code.
 *
 * @param referenceCode - Code used in URLs, e.g. "SYS-001".
 * @returns The lock system.
 * @throws An axios error with status 404 if no system has that code.
 */
export async function getLockSystem(referenceCode: string): Promise<LockSystem> {
  const response = await api.get(`/lock-systems/${referenceCode}`);
  return response.data;
}

/**
 * Fetches the lock systems visible to the current session user — every
 * system for admins, assigned systems only for regular users.
 *
 * @returns The visible lock systems.
 */
export async function getVisibleLockSystems(): Promise<LockSystem[]> {
  const response = await api.get("/lock-systems");
  return response.data;
}

/**
 * Creates a new lock system. Admin only. The reference code is generated
 * by the server.
 *
 * @param name - Display name, typically the property address.
 * @param description - Free-text description.
 * @returns The created lock system.
 */
export async function createLockSystem(
  name: string,
  description: string,
): Promise<LockSystem> {
  const response = await api.post("/lock-systems", { name, description });
  return response.data;
}

/**
 * Fetches every key across all lock systems.
 *
 * @returns All keys.
 */
export async function getAllKeys(): Promise<Key[]> {
  const response = await api.get("/keys");
  return response.data;
}
