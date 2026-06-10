import { LockSystem } from "../model/lock-system.interface";

/** Manages lock systems and which of them a user may see. */
export interface ILockSystemService {
  /**
   * Lists all lock systems.
   *
   * @returns Every lock system, in no particular order.
   */
  getAll(): Promise<LockSystem[]>;

  /**
   * Looks up a single lock system by ID.
   *
   * @param id - UUID of the lock system.
   * @returns The lock system, or `undefined` if not found.
   */
  getById(id: string): Promise<LockSystem | undefined>;

  /**
   * Looks up a single lock system by its reference code (used in URLs).
   *
   * @param referenceCode - Code such as "SYS-001".
   * @returns The lock system, or `undefined` if not found.
   */
  getByReferenceCode(referenceCode: string): Promise<LockSystem | undefined>;

  /**
   * Lists the lock systems a user is allowed to see.
   *
   * @param assignedLockSystemIds - `"ALL"` for admins (every system is
   *   returned), or the user's assigned system IDs to filter by.
   * @returns The visible lock systems; empty for a user with no assignments.
   */
  getVisibleForUser(
    assignedLockSystemIds: string[] | "ALL",
  ): Promise<LockSystem[]>;

  /**
   * Creates a new lock system. The reference code is generated automatically
   * as the next "SYS-xxx" in sequence.
   *
   * @param name - Display name, typically the property address.
   * @param description - Free-text description.
   * @returns The created lock system.
   */
  addLockSystem(name: string, description: string): Promise<LockSystem>;
}
