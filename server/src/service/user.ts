import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { User, UserPublic, UserRole } from "../model/user.interface";

const SALT_ROUNDS = 10;

function toPublic(user: User): UserPublic {
  const { passwordHash: _, ...pub } = user;
  return pub;
}

export class UserService {
  private users: User[] = [
    {
      id: "f1a2b3c4-0001-0001-0001-000000000001",
      name: "Alice Admin",
      email: "alice@example.com",
      passwordHash: bcrypt.hashSync("password", SALT_ROUNDS),
      role: "admin",
      assignedLockSystemIds: [],
    },
    {
      id: "f1a2b3c4-0001-0001-0001-000000000002",
      name: "Ulf User",
      email: "ulf@example.com",
      passwordHash: bcrypt.hashSync("password", SALT_ROUNDS),
      role: "user",
      assignedLockSystemIds: [],
    },
  ];

  /** Returns a single user by UUID, or undefined if not found. Never includes the password hash. */
  async getUserById(id: string): Promise<UserPublic | undefined> {
    const user = this.users.find((u) => u.id === id);
    return user ? toPublic(user) : undefined;
  }

  /** Returns all users. Never includes password hashes. */
  async getUsers(): Promise<UserPublic[]> {
    return this.users.map(toPublic);
  }

  /** Creates a new user with a bcrypt-hashed password. Returns "DUPLICATE_EMAIL" if the email is taken. */
  async addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<UserPublic | "DUPLICATE_EMAIL"> {
    const existing = this.users.find((u) => u.email === email);
    if (existing) return "DUPLICATE_EMAIL";

    const user: User = {
      id: randomUUID(),
      name,
      email,
      passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      role,
      assignedLockSystemIds: [],
    };
    this.users.push(user);
    return toPublic(user);
  }

  /** Assigns a lock system to a user (idempotent). Returns undefined if the user does not exist. */
  async assignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return undefined;
    if (!user.assignedLockSystemIds.includes(lockSystemId)) {
      user.assignedLockSystemIds.push(lockSystemId);
    }
    return toPublic(user);
  }

  /** Removes a lock system assignment from a user. Returns undefined if the user does not exist. */
  async unassignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined> {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return undefined;
    user.assignedLockSystemIds = user.assignedLockSystemIds.filter(
      (id) => id !== lockSystemId,
    );
    return toPublic(user);
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
    const user = this.users.find((u) => u.email === email);
    if (!user) return "INVALID";
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return "INVALID";
    return toPublic(user);
  }
}
