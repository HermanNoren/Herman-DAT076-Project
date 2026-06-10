import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../../db";
import { keys } from "../../db/schema";
import { AccessLevel, Key } from "../model/key.interface";
import { IKeyService } from "./ikey";

/**
 * {@link IKeyService} backed by the `keys` table via Drizzle. See the
 * interface for the full contract of each method.
 */
export class KeyDBService implements IKeyService {
  /** Returns all keys across all lock systems. */
  async getKeys(): Promise<Key[]> {
    return db.select().from(keys);
  }

  /** Returns all keys belonging to the given lock system. */
  async getKeysByLockSystem(lockSystemId: string): Promise<Key[]> {
    return db.select().from(keys).where(eq(keys.lockSystemId, lockSystemId));
  }

  /** Returns a single key by its UUID, or undefined if not found. */
  async getKeyById(id: string): Promise<Key | undefined> {
    const [row] = await db.select().from(keys).where(eq(keys.id, id));
    return row;
  }

  /** Returns a key by its label within a specific lock system, or undefined if not found. */
  async getKeyByLabel(
    label: string,
    lockSystemId: string,
  ): Promise<Key | undefined> {
    const [row] = await db
      .select()
      .from(keys)
      .where(and(eq(keys.label, label), eq(keys.lockSystemId, lockSystemId)));
    return row;
  }

  /** Creates a new key in the given lock system. Returns "DUPLICATE_LABEL" if the label already exists there. */
  async addKey(
    label: string,
    description: string,
    accessLevel: AccessLevel,
    lockSystemId: string,
  ): Promise<Key | "DUPLICATE_LABEL"> {
    const existing = await this.getKeyByLabel(label, lockSystemId);
    if (existing) return "DUPLICATE_LABEL";

    const [row] = await db
      .insert(keys)
      .values({
        id: randomUUID(),
        label,
        description,
        accessLevel,
        lockSystemId,
      })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return row;
  }
}
