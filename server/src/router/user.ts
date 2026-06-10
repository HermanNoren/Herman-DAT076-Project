import express, { Request, Response } from "express";
import { userService, lockSystemService } from "../service";
import { UserPublic, UserRole } from "../model/user.interface";
import { requireAdmin } from "./auth";

/** Roles accepted by `POST /users`, used to validate the request body. */
const USER_ROLES: UserRole[] = ["admin", "user"];

/** Routes for managing user accounts and their lock system assignments. */
export const userRouter = express.Router();

/**
 * `GET /users` — lists all users. Admin only.
 *
 * Responses: 200 with all users (password hashes never included),
 * 401/403 if not logged in as an admin.
 */
userRouter.get(
  "/",
  async (req: Request, res: Response<UserPublic[] | string>) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const users = await userService.getUsers();
      res.status(200).send(users);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/**
 * `POST /users` — creates a new user account. Admin only.
 *
 * Body: `{ name: string, email: string, password: string, role: UserRole }`.
 * The password must be at least 8 characters.
 *
 * Responses: 201 with the created user, 400 if a field is invalid,
 * 401/403 if not logged in as an admin, 409 if the email is taken.
 */
userRouter.post(
  "/",
  async (
    req: Request<{}, {}, { name: string; email: string; password: string; role: UserRole }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const { name, email, password, role } = req.body;

      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).send("Field 'name' must be a non-empty string");
        return;
      }

      if (typeof email !== "string") {
        res.status(400).send("Field 'email' must be a string");
        return;
      }

      if (typeof password !== "string" || password.length < 8) {
        res.status(400).send("Field 'password' must be at least 8 characters");
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

/**
 * `PATCH /users/:id/assign-lock-system` — grants a user access to a lock
 * system. Admin only.
 *
 * Body: `{ lockSystemId: string }`.
 *
 * Responses: 200 with the updated user, 400 if the body is invalid,
 * 401/403 if not logged in as an admin, 404 if the user or lock system
 * does not exist.
 */
userRouter.patch(
  "/:id/assign-lock-system",
  async (
    req: Request<{ id: string }, {}, { lockSystemId: string }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

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

/**
 * `DELETE /users/:id` — deletes a non-admin user. Admin only.
 *
 * The user's lock system assignments and orders are removed with them
 * (ON DELETE CASCADE).
 *
 * Responses: 204 on success, 401/403 if not logged in as an admin,
 * 403 if the target is an admin account, 404 if the user does not exist.
 */
userRouter.delete(
  "/:id",
  async (req: Request<{ id: string }>, res: Response<string>) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const result = await userService.deleteUser(req.params.id);

      if (result === "NOT_FOUND") {
        res.status(404).send("User not found");
        return;
      }

      if (result === "FORBIDDEN") {
        res.status(403).send("Admin accounts cannot be deleted");
        return;
      }

      res.status(204).send();
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/**
 * `PATCH /users/:id/unassign-lock-system` — revokes a user's access to a
 * lock system. Admin only.
 *
 * Body: `{ lockSystemId: string }`.
 *
 * Responses: 200 with the updated user, 400 if the body is invalid,
 * 401/403 if not logged in as an admin, 404 if the user does not exist.
 */
userRouter.patch(
  "/:id/unassign-lock-system",
  async (
    req: Request<{ id: string }, {}, { lockSystemId: string }>,
    res: Response<UserPublic | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

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
