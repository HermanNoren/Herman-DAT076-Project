import express, { Request, Response } from "express";
import { UserPublic } from "../model/user.interface";
import { userService } from "./lock-system";

/** Routes for logging in, logging out and inspecting the current session. */
export const sessionRouter = express.Router();

/**
 * `POST /session` — logs in with email and password.
 *
 * No authentication required (this is how a session is obtained).
 * Body: `{ email: string, password: string }`.
 *
 * Responses: 200 with the logged-in user (and a session cookie),
 * 400 if the body is malformed, 401 if the credentials are wrong.
 */
sessionRouter.post(
  "/",
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const { email, password } = req.body;

      if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).send("Fields 'email' and 'password' must be strings");
        return;
      }

      const result = await userService.verifyCredentials(email, password);

      if (result === "INVALID") {
        res.status(401).send("Invalid email or password");
        return;
      }

      req.session.userId = result.id;
      res.status(200).send(result);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/**
 * `DELETE /session` — logs out by destroying the session.
 *
 * Responses: 204 on success (also for callers who were never logged in),
 * 500 if the session store fails.
 */
sessionRouter.delete(
  "/",
  (req: Request, res: Response<string>) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send("Failed to log out");
        return;
      }
      res.status(204).send();
    });
  },
);

/**
 * `GET /session` — returns the currently logged-in user.
 *
 * Used by the client on startup to restore an existing session.
 *
 * Responses: 200 with the user, 401 if no valid session exists.
 */
sessionRouter.get(
  "/",
  async (req: Request, res: Response<UserPublic | string>) => {
    try {
      const { userId } = req.session;
      if (!userId) {
        res.status(401).send("Not logged in");
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        res.status(401).send("Not logged in");
        return;
      }

      res.status(200).send(user);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
