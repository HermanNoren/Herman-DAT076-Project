import express, { Request, Response } from "express";
import { userService } from "./lock-system";
import { lockSystemService } from "./lock-system";
import { UserPublic, UserRole } from "../model/user.interface";

export const userRouter = express.Router();

const USER_ROLES: UserRole[] = ["admin", "user"];

/** GET /users — returns all users (password hashes never included). */
userRouter.get(
  "/",
  async (_req: Request, res: Response<UserPublic[] | string>) => {
    try {
      const users = await userService.getUsers();
      res.status(200).send(users);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** POST /users — creates a new user with a hashed password. */
userRouter.post(
  "/",
  async (
    req: Request<{}, {}, { name: string; email: string; password: string; role: UserRole }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const { name, email, password, role } = req.body;

      if (typeof name !== "string") {
        res.status(400).send("Field 'name' must be a string");
        return;
      }

      if (typeof email !== "string") {
        res.status(400).send("Field 'email' must be a string");
        return;
      }

      if (typeof password !== "string" || password.length < 8) {
        res.status(400).send("Field 'password' must be a string of at least 8 characters");
        return;
      }

      if (!USER_ROLES.includes(role)) {
        res.status(400).send(`Field 'role' must be one of: ${USER_ROLES.join(", ")}`);
        return;
      }

      const result = await userService.addUser(name, email, password, role);

      if (result === "DUPLICATE_EMAIL") {
        res.status(409).send(`A user with email '${email}' already exists`);
        return;
      }

      res.status(201).send(result);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** PATCH /users/:id/assign-lock-system — assigns a lock system to a user. */
userRouter.patch(
  "/:id/assign-lock-system",
  async (
    req: Request<{ id: string }, {}, { lockSystemId: string }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const userId = req.params.id;
      const { lockSystemId } = req.body;

      if (typeof lockSystemId !== "string") {
        res.status(400).send("Field 'lockSystemId' must be a string");
        return;
      }

      const system = await lockSystemService.getById(lockSystemId);
      if (!system) {
        res.status(404).send("Lock system not found");
        return;
      }

      const updated = await userService.assignLockSystem(userId, lockSystemId);
      if (!updated) {
        res.status(404).send("User not found");
        return;
      }

      res.status(200).send(updated);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** PATCH /users/:id/unassign-lock-system — removes a lock system assignment from a user. */
userRouter.patch(
  "/:id/unassign-lock-system",
  async (
    req: Request<{ id: string }, {}, { lockSystemId: string }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const userId = req.params.id;
      const { lockSystemId } = req.body;

      if (typeof lockSystemId !== "string") {
        res.status(400).send("Field 'lockSystemId' must be a string");
        return;
      }

      const updated = await userService.unassignLockSystem(userId, lockSystemId);
      if (!updated) {
        res.status(404).send("User not found");
        return;
      }

      res.status(200).send(updated);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
