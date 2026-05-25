import { randomUUID } from "crypto";
import { LockSystem } from "../model/lock-system.interface";
import { UserService } from "./user";

export class LockSystemService {
  private lockSystems: LockSystem[] = [
    {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      referenceCode: "SYS-001",
      name: "Storgatan 12",
      description: "Master System",
    },
    {
      id: "b1ffcd00-ad1c-5fg9-cc7e-7cc0ce491b22",
      referenceCode: "SYS-002",
      name: "Nygatan 8",
      description: "Master System",
    },
  ];
  private nextSystemIdNum = 3;

  /** Returns all lock systems. */
  async getAll(): Promise<LockSystem[]> {
    return JSON.parse(JSON.stringify(this.lockSystems));
  }

  /** Returns a single lock system by its UUID, or undefined if not found. */
  async getById(id: string): Promise<LockSystem | undefined> {
    const system = this.lockSystems.find((ls) => ls.id === id);
    return system ? { ...system } : undefined;
  }

  /** Returns a single lock system by its reference code (e.g. "SYS-001"), or undefined if not found. */
  async getByReferenceCode(referenceCode: string): Promise<LockSystem | undefined> {
    const system = this.lockSystems.find((ls) => ls.referenceCode === referenceCode);
    return system ? { ...system } : undefined;
  }

  /** Creates a new lock system and auto-assigns the next SYS-xxx reference code. */
  async addLockSystem(name: string, description: string): Promise<LockSystem> {
    const referenceCode = `SYS-${String(this.nextSystemIdNum++).padStart(3, "0")}`;
    const lockSystem: LockSystem = {
      id: randomUUID(),
      referenceCode,
      name,
      description,
    };
    this.lockSystems.push(lockSystem);
    return { ...lockSystem };
  }

  /** Returns the lock systems visible to the given user (all for admin, assigned-only for users). */
  async getVisibleForUser(
    userId: string,
    userService: UserService,
  ): Promise<LockSystem[] | undefined> {
    const user = await userService.getUserById(userId);
    if (!user) {
      return undefined;
    }

    if (user.role === "admin") {
      return JSON.parse(JSON.stringify(this.lockSystems));
    }

    return this.lockSystems
      .filter((ls) => user.assignedLockSystemIds.includes(ls.id))
      .map((ls) => ({ ...ls }));
  }
}
