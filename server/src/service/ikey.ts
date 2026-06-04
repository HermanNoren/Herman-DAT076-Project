import { AccessLevel, Key } from "../model/key.interface";

export interface IKeyService {
  getKeys(): Promise<Key[]>;
  getKeysByLockSystem(lockSystemId: string): Promise<Key[]>;
  getKeyById(id: string): Promise<Key | undefined>;
  getKeyByLabel(label: string, lockSystemId: string): Promise<Key | undefined>;
  addKey(
    label: string,
    description: string,
    accessLevel: AccessLevel,
    lockSystemId: string,
  ): Promise<Key | "DUPLICATE_LABEL">;
}
