export type AccessLevel = "Master" | "Individual" | "Common";

export interface Key {
  id: string;
  label: string;
  description: string;
  accessLevel: AccessLevel;
  lockSystemId: string;
}
