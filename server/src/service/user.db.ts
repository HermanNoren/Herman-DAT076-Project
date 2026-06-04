import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { db } from "../../db";
import { users, userLockSystems, type User as UserRow } from "../../db/schema";
import { UserPublic, UserRole } from "../model/user.interface";
import { IUserService } from "./iuser";

const SALT_ROUNDS = 10;

/** Returns the lock system IDs assigned to a user (from the join table). */
async function getAssigned(userId: string): Promise<string[]> {
  const rows = await db
    .select()
    .from(userLockSystems)
    .where(eq(userLockSystems.userId, userId));
  return rows.map((r) => r.lockSystemId);
}

/** Maps a users row to the public shape — strips the hash, fetches assignments. */
async function rowToPublic(row: UserRow): Promise<UserPublic> {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    assignedLockSystemIds: await getAssigned(row.id),
  };
}

export class UserDBService implements IUserService {
  /** Returns a single user by UUID, or undefined if not found. Never includes the password hash. */
  async getUserById(id: string): Promise<UserPublic | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    return row ? rowToPublic(row) : undefined;
  }

  /** Returns all users. Never includes password hashes. */
  async getUsers(): Promise<UserPublic[]> {
    const rows = await db.select().from(users);
    return Promise.all(rows.map(rowToPublic));
  }

  /** Creates a new user with a bcrypt-hashed password. Returns "DUPLICATE_EMAIL" if the email is taken. */
  async addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<UserPublic | "DUPLICATE_EMAIL"> {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) return "DUPLICATE_EMAIL";

    const [row] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name,
        email,
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
        role,
      })
      .returning();
    if (!row) throw new Error("Insert returned no row");
    return rowToPublic(row);
  }

  /**
   * Deletes a non-admin user by UUID. Assignments and orders are removed by
   * the DB via ON DELETE CASCADE.
   * Returns "NOT_FOUND" if the user doesn't exist, "FORBIDDEN" if they are an admin.
   */
  async deleteUser(id: string): Promise<"OK" | "NOT_FOUND" | "FORBIDDEN"> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    if (!row) return "NOT_FOUND";
    if (row.role === "admin") return "FORBIDDEN";
    await db.delete(users).where(eq(users.id, id));
    return "OK";
  }

  /** Assigns a lock system to a user (idempotent via the composite PK). Returns undefined if the user does not exist. */
  async assignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, userId));
    if (!row) return undefined;

    await db
      .insert(userLockSystems)
      .values({ userId, lockSystemId })
      .onConflictDoNothing();
    return rowToPublic(row);
  }

  /** Removes a lock system assignment from a user. Returns undefined if the user does not exist. */
  async unassignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, userId));
    if (!row) return undefined;

    await db
      .delete(userLockSystems)
      .where(
        and(
          eq(userLockSystems.userId, userId),
          eq(userLockSystems.lockSystemId, lockSystemId),
        ),
      );
    return rowToPublic(row);
  }

  /**
   * Checks email + password against stored credentials.
   * Returns the public user on success, or "INVALID" if the email is not found or the password
   * does not match. The same sentinel is used for both cases to avoid revealing which failed.
   */
  async verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserPublic | "INVALID"> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    if (!row) return "INVALID";
    const match = await bcrypt.compare(password, row.passwordHash);
    if (!match) return "INVALID";
    return rowToPublic(row);
  }
}
