import express, { Request, Response } from "express";
import { LockSystemDBService } from "../service/lock-system.db";
import { UserDBService } from "../service/user.db";
import { ILockSystemService } from "../service/ilock-system";
import { IUserService } from "../service/iuser";
import { LockSystem } from "../model/lock-system.interface";
import { requireAdmin, requireAuth } from "./auth";

export const lockSystemRouter = express.Router();

export const userService: IUserService = new UserDBService();
export const lockSystemService: ILockSystemService = new LockSystemDBService();

/** GET /lock-systems — returns all systems visible to the logged-in user (all for admin, assigned-only for users). */
lockSystemRouter.get(
  "/",
  async (req: Request, res: Response<LockSystem[] | string>) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;

      const assignedIds =
        user.role === "admin" ? ("ALL" as const) : user.assignedLockSystemIds;
      const systems = await lockSystemService.getVisibleForUser(assignedIds);
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
      const user = await requireAuth(req, res);
      if (!user) return;

      const system = await lockSystemService.getByReferenceCode(
        req.params.referenceCode,
      );
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

/** POST /lock-systems — creates a new lock system. Admin only. */
lockSystemRouter.post(
  "/",
  async (
    req: Request<{}, {}, { name: string; description: string }>,
    res: Response<LockSystem | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

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
