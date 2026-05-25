import express, { Request, Response } from "express";
import { LockSystemService } from "../service/lock-system";
import { UserService } from "../service/user";
import { LockSystem } from "../model/lock-system.interface";

export const lockSystemRouter = express.Router();

export const userService = new UserService();
export const lockSystemService = new LockSystemService();

/** GET /lock-systems?userId= — returns all systems visible to the user (all for admin, assigned-only for users). */
lockSystemRouter.get(
  "/",
  async (
    req: Request<{}, {}, {}, { userId?: string }>,
    res: Response<LockSystem[] | string>,
  ) => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).send("Query param userId is required");
        return;
      }

      const systems = await lockSystemService.getVisibleForUser(
        userId,
        userService,
      );
      if (!systems) {
        res.status(404).send("User not found");
        return;
      }

      res.status(200).send(systems);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** GET /lock-systems/:referenceCode — returns a single lock system by reference code. */
lockSystemRouter.get(
  "/:referenceCode",
  async (
    req: Request<{ referenceCode: string }>,
    res: Response<LockSystem | string>,
  ) => {
    try {
      const system = await lockSystemService.getByReferenceCode(req.params.referenceCode);
      if (!system) {
        res.status(404).send("Lock system not found");
        return;
      }
      res.status(200).send(system);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** POST /lock-systems — creates a new lock system. */
lockSystemRouter.post(
  "/",
  async (
    req: Request<{}, {}, { name: string; description: string }>,
    res: Response<LockSystem | string>,
  ) => {
    try {
      const { name, description } = req.body;

      if (typeof name !== "string" || typeof description !== "string") {
        res.status(400).send("Fields 'name' and 'description' must be strings");
        return;
      }

      const created = await lockSystemService.addLockSystem(name, description);
      res.status(201).send(created);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
