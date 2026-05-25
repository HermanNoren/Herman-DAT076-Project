import express, { Request, Response } from "express";
import { UserPublic } from "../model/user.interface";
import { userService } from "./lock-system";

export const sessionRouter = express.Router();

/** POST /session — log in with email + password. Sets session and returns the logged-in user. */
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

/** DELETE /session — log out. Destroys the session. */
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

/** GET /session — returns the currently logged-in user, or 401 if not logged in. */
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
