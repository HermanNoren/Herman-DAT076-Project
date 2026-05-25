import { randomUUID } from "crypto";
import { AccessLevel, Key } from "../model/key.interface";

export class KeyService {
  private keys: Key[] = [
    {
      id: "e1f2a3b4-0001-0001-0001-000000000001",
      label: "A101",
      description: "Main Entrance",
      accessLevel: "Master",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
    {
      id: "e1f2a3b4-0001-0001-0001-000000000002",
      label: "A102",
      description: "Apartment 1A",
      accessLevel: "Individual",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
    {
      id: "e1f2a3b4-0001-0001-0001-000000000003",
      label: "A103",
      description: "Apartment 1B",
      accessLevel: "Individual",
      lockSystemId: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    },
  ];

  /** Returns all keys across all lock systems. */
  async getKeys(): Promise<Key[]> {
    return JSON.parse(JSON.stringify(this.keys));
  }

  /** Returns all keys belonging to the given lock system. */
  async getKeysByLockSystem(lockSystemId: string): Promise<Key[]> {
    return this.keys
      .filter((k) => k.lockSystemId === lockSystemId)
      .map((k) => ({ ...k }));
  }

  /** Returns a single key by its UUID, or undefined if not found. */
  async getKeyById(id: string): Promise<Key | undefined> {
    const key = this.keys.find((k) => k.id === id);
    return key ? { ...key } : undefined;
  }

  /** Returns a key by its label within a specific lock system, or undefined if not found. */
  async getKeyByLabel(label: string, lockSystemId: string): Promise<Key | undefined> {
    const key = this.keys.find(
      (k) => k.label === label && k.lockSystemId === lockSystemId,
    );
    return key ? { ...key } : undefined;
  }

  /** Creates a new key in the given lock system. Returns "DUPLICATE_LABEL" if the label already exists there. */
  async addKey(
    label: string,
    description: string,
    accessLevel: AccessLevel,
    lockSystemId: string,
  ): Promise<Key | "DUPLICATE_LABEL"> {
    const existing = await this.getKeyByLabel(label, lockSystemId);
    if (existing) {
      return "DUPLICATE_LABEL";
    }

    const key: Key = {
      id: randomUUID(),
      label,
      description,
      accessLevel,
      lockSystemId,
    };
    this.keys.push(key);
    return { ...key };
  }
}
