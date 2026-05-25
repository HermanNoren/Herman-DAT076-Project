export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  assignedLockSystemIds: string[];
}

/** Shape returned to API clients — never includes the password hash. */
export type UserPublic = Omit<User, "passwordHash">;
