import { api } from "./axios";
import { LockSystem } from "../types/lock-system";
import { Key } from "../types/key";

/** Fetches a single lock system by its reference code (e.g. "SYS-001"). */
export async function getLockSystem(referenceCode: string): Promise<LockSystem> {
  const response = await api.get(`/lock-systems/${referenceCode}`);
  return response.data;
}

/** Fetches all lock systems visible to the given user (admin sees all, users see assigned only). */
export async function getVisibleLockSystems(
  userId: string,
): Promise<LockSystem[]> {
  const response = await api.get(`/lock-systems?userId=${userId}`);
  return response.data;
}

/** Creates a new lock system with the given name and description. */
export async function createLockSystem(
  name: string,
  description: string,
): Promise<LockSystem> {
  const response = await api.post("/lock-systems", { name, description });
  return response.data;
}

/** Fetches all keys across all lock systems. */
export async function getAllKeys(): Promise<Key[]> {
  const response = await api.get("/keys");
  return response.data;
}
