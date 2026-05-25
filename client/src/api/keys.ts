import { api } from "./axios";
import { AccessLevel, Key } from "../types/key";

/** Fetches all keys belonging to the given lock system. */
export async function getKeysByLockSystem(lockSystemId: string): Promise<Key[]> {
  const response = await api.get("/keys", { params: { lockSystemId } });
  return response.data;
}

/** Creates a new key inside the given lock system. */
export async function createKey(
  label: string,
  description: string,
  accessLevel: AccessLevel,
  lockSystemId: string,
): Promise<Key> {
  const response = await api.post("/keys", { label, description, accessLevel, lockSystemId });
  return response.data;
}
