import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../../db";
import { lockSystems } from "../../db/schema";
import { LockSystem } from "../model/lock-system.interface";
import { ILockSystemService } from "./ilock-system";

/**
 * {@link ILockSystemService} backed by the `lock_systems` table via Drizzle.
 * See the interface for the full contract of each method.
 */
export class LockSystemDBService implements ILockSystemService {
  /** Returns all lock systems. */
  async getAll(): Promise<LockSystem[]> {
    return db.select().from(lockSystems);
  }

  /** Returns a single lock system by its UUID, or undefined if not found. */
  async getById(id: string): Promise<LockSystem | undefined> {
    const [row] = await db
      .select()
      .from(lockSystems)
      .where(eq(lockSystems.id, id));
    return row;
  }

  /** Returns a single lock system by its reference code (e.g. "SYS-001"), or undefined if not found. */
  async getByReferenceCode(
    referenceCode: string,
  ): Promise<LockSystem | undefined> {
    const [row] = await db
      .select()
      .from(lockSystems)
      .where(eq(lockSystems.referenceCode, referenceCode));
    return row;
  }

  /** Returns the lock systems visible to a user — "ALL" (admin) returns every system, an array filters to those IDs. */
  async getVisibleForUser(
    assignedLockSystemIds: string[] | "ALL",
  ): Promise<LockSystem[]> {
    if (assignedLockSystemIds === "ALL") {
      return db.select().from(lockSystems);
    }
    if (assignedLockSystemIds.length === 0) {
      return [];
    }
    return db
      .select()
      .from(lockSystems)
      .where(inArray(lockSystems.id, assignedLockSystemIds));
  }

  /** Creates a new lock system and auto-assigns the next SYS-xxx reference code. */
  async addLockSystem(name: string, description: string): Promise<LockSystem> {
    const count = (await db.select().from(lockSystems)).length;
    const referenceCode = `SYS-${String(count + 1).padStart(3, "0")}`;
    const [row] = await db
      .insert(lockSystems)
      .values({ id: randomUUID(), referenceCode, name, description })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return row;
  }
}
