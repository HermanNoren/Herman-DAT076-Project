import { UserPublic, UserRole } from "../model/user.interface";

export interface IUserService {
  getUserById(id: string): Promise<UserPublic | undefined>;
  getUsers(): Promise<UserPublic[]>;
  addUser(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<UserPublic | "DUPLICATE_EMAIL">;
  deleteUser(id: string): Promise<"OK" | "NOT_FOUND" | "FORBIDDEN">;
  assignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined>;
  unassignLockSystem(
    userId: string,
    lockSystemId: string,
  ): Promise<UserPublic | undefined>;
  verifyCredentials(
    email: string,
    password: string,
  ): Promise<UserPublic | "INVALID">;
}
