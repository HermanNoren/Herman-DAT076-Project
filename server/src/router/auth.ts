import { Request, Response } from "express";
import { UserPublic } from "../model/user.interface";
import { userService } from "./lock-system";

/**
 * Resolves the current session to a logged-in user.
 *
 * @param req - Incoming request; the user ID is read from its session.
 * @param res - Response, used to report authentication failures.
 * @returns The logged-in user, or `null` if the session is missing or refers
 *   to a deleted user — in which case a 401 response has already been sent
 *   and the caller must return without writing to `res`.
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
 * Resolves the current session to a logged-in admin user.
 *
 * @param req - Incoming request; the user ID is read from its session.
 * @param res - Response, used to report authorization failures.
 * @returns The logged-in admin, or `null` if not logged in (401 sent) or
 *   logged in without the admin role (403 sent) — in either case the caller
 *   must return without writing to `res`.
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
