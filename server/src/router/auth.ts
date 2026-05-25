import { Request, Response } from "express";
import { UserPublic } from "../model/user.interface";
import { userService } from "./lock-system";

/**
 * Resolves the session to a logged-in user.
 * Sends 401 and returns null if no valid session exists.
 */
export async function requireAuth(
  req: Request,
  res: Response,
): Promise<UserPublic | null> {
  const { userId } = req.session;
  if (!userId) {
    res.status(401).send("Not logged in");
    return null;
  }
  const user = await userService.getUserById(userId);
  if (!user) {
    res.status(401).send("Not logged in");
    return null;
  }
  return user;
}

/**
 * Resolves the session to a logged-in admin user.
 * Sends 401 if not logged in, 403 if logged in but not an admin.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
): Promise<UserPublic | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    res.status(403).send("Admin access required");
    return null;
  }
  return user;
}
