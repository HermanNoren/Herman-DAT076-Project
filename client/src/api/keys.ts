import { api } from "./axios";
import { AccessLevel, Key } from "../types/key";

/**
 * Fetches all keys belonging to one lock system.
 *
 * @param lockSystemId - UUID of the lock system.
 * @returns The keys in that system.
 * @throws An axios error with status 404 if the lock system does not exist.
 */
export async function getKeysByLockSystem(lockSystemId: string): Promise<Key[]> {
  const response = await api.get("/keys", { params: { lockSystemId } });
  return response.data;
}

/**
 * Creates a new key inside a lock system. Admin only.
 *
 * @param label - Key label, e.g. "A101". Must be unique within the system.
 * @param description - What the key opens.
 * @param accessLevel - Access level of the key.
 * @param lockSystemId - UUID of the lock system the key belongs to.
 * @returns The created key.
 * @throws An axios error with status 409 if the label is already used in
 *   that lock system.
 */
export async function createKey(
  label: string,
  description: string,
  accessLevel: AccessLevel,
  lockSystemId: string,
): Promise<Key> {
  const response = await api.post("/keys", { label, description, accessLevel, lockSystemId });
  return response.data;
}
