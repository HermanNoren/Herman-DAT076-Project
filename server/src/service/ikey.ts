import { AccessLevel, Key } from "../model/key.interface";

/** Manages the keys that belong to lock systems. */
export interface IKeyService {
  /**
   * Lists every key across all lock systems.
   *
   * @returns All keys, in no particular order.
   */
  getKeys(): Promise<Key[]>;

  /**
   * Lists the keys of one lock system.
   *
   * @param lockSystemId - UUID of the lock system.
   * @returns The keys in that system; empty if the system has none or does not exist.
   */
  getKeysByLockSystem(lockSystemId: string): Promise<Key[]>;

  /**
   * Looks up a single key.
   *
   * @param id - UUID of the key.
   * @returns The key, or `undefined` if no key with that ID exists.
   */
  getKeyById(id: string): Promise<Key | undefined>;

  /**
   * Looks up a key by its label within one lock system. Labels are only
   * unique per system, so the system ID is required.
   *
   * @param label - Key label, e.g. "A101".
   * @param lockSystemId - UUID of the lock system to search in.
   * @returns The key, or `undefined` if no such label exists in that system.
   */
  getKeyByLabel(label: string, lockSystemId: string): Promise<Key | undefined>;

  /**
   * Creates a new key inside a lock system.
   *
   * @param label - Key label. Must be unique within the lock system.
   * @param description - What the key opens.
   * @param accessLevel - Access level of the key.
   * @param lockSystemId - UUID of the lock system the key belongs to.
   * @returns The created key, or `"DUPLICATE_LABEL"` if the label is already
   *   used in that lock system.
   */
  addKey(
    label: string,
    description: string,
    accessLevel: AccessLevel,
    lockSystemId: string,
  ): Promise<Key | "DUPLICATE_LABEL">;
}
