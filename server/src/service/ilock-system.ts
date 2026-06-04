import { LockSystem } from "../model/lock-system.interface";

export interface ILockSystemService {
  getAll(): Promise<LockSystem[]>;
  getById(id: string): Promise<LockSystem | undefined>;
  getByReferenceCode(referenceCode: string): Promise<LockSystem | undefined>;
  /** "ALL" = admin (return every system). Array = filter to those IDs. */
  getVisibleForUser(
    assignedLockSystemIds: string[] | "ALL",
  ): Promise<LockSystem[]>;
  addLockSystem(name: string, description: string): Promise<LockSystem>;
}
