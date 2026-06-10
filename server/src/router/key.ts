import express, { Request, Response } from "express";
import { AccessLevel, Key } from "../model/key.interface";
import { KeyDBService } from "../service/key.db";
import { IKeyService } from "../service/ikey";
import { lockSystemService } from "./lock-system";
import { requireAdmin, requireAuth } from "./auth";

/** Access levels accepted by `POST /keys`, used to validate the request body. */
const ACCESS_LEVELS: AccessLevel[] = ["Master", "Individual", "Common"];

/** Routes for listing and creating keys. */
export const keyRouter = express.Router();

/** Shared key service instance, also used by the order router. */
export const keyService: IKeyService = new KeyDBService();

/**
 * `GET /keys?lockSystemId=` — lists keys, optionally for one lock system.
 *
 * Requires a logged-in user.
 *
 * Responses: 200 with the keys (all keys when `lockSystemId` is omitted),
 * 401 if not logged in, 404 if the given lock system does not exist.
 */
keyRouter.get(
  "/",
  async (
    req: Request<{}, {}, {}, { lockSystemId?: string }>,
    res: Response<Key[] | string>,
  ) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { lockSystemId } = req.query;

      if (!lockSystemId) {
        const keys = await keyService.getKeys();
        res.status(200).send(keys);
        return;
      }

      const lockSystem = await lockSystemService.getById(lockSystemId);
      if (!lockSystem) {
        res.status(404).send("Lock system not found");
        return;
      }

      const keys = await keyService.getKeysByLockSystem(lockSystemId);
      res.status(200).send(keys);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/**
 * `POST /keys` — creates a new key inside a lock system. Admin only.
 *
 * Body: `{ label: string, description: string, accessLevel: AccessLevel,
 * lockSystemId: string }`.
 *
 * Responses: 201 with the created key, 400 if a field is invalid,
 * 401/403 if not logged in as an admin, 404 if the lock system does not
 * exist, 409 if the label is already used in that lock system.
 */
keyRouter.post(
  "/",
  async (
    req: Request<
      {},
      {},
      {
        label: string;
        description: string;
        accessLevel: AccessLevel;
        lockSystemId: string;
      }
    >,
    res: Response<Key | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const { label, description, accessLevel, lockSystemId } = req.body;

      if (
        typeof label !== "string" ||
        typeof description !== "string" ||
        typeof lockSystemId !== "string"
      ) {
        res
          .status(400)
          .send("Fields 'label', 'description' and 'lockSystemId' are invalid");
        return;
      }

      if (!ACCESS_LEVELS.includes(accessLevel)) {
        res
          .status(400)
          .send(
            `Field 'accessLevel' must be one of: ${ACCESS_LEVELS.join(", ")}`,
          );
        return;
      }

      const lockSystem = await lockSystemService.getById(lockSystemId);
      if (!lockSystem) {
        res.status(404).send("Lock system not found");
        return;
      }

      const key = await keyService.addKey(
        label,
        description,
        accessLevel,
        lockSystemId,
      );

      if (key === "DUPLICATE_LABEL") {
        res
          .status(409)
          .send(
            `A key with label '${label}' already exists in this lock system`,
          );
        return;
      }

      res.status(201).send(key);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
