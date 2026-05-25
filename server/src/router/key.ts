import express, { Request, Response } from "express";
import { AccessLevel, Key } from "../model/key.interface";

const ACCESS_LEVELS: AccessLevel[] = ["Master", "Individual", "Common"];
import { KeyService } from "../service/key";
import { lockSystemService } from "./lock-system";

export const keyRouter = express.Router();
export const keyService = new KeyService();

/** GET /keys?lockSystemId= — returns keys for a lock system, or all keys if no param is given. */
keyRouter.get(
  "/",
  async (
    req: Request<{}, {}, {}, { lockSystemId?: string }>,
    res: Response<Key[] | string>,
  ) => {
    try {
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

/** POST /keys — creates a new key inside a lock system. */
keyRouter.post(
  "/",
  async (
    req: Request<
      {},
      {},
      { label: string; description: string; accessLevel: AccessLevel; lockSystemId: string }
    >,
    res: Response<Key | string>,
  ) => {
    try {
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
          .send(`Field 'accessLevel' must be one of: ${ACCESS_LEVELS.join(", ")}`);
        return;
      }

      const lockSystem = await lockSystemService.getById(lockSystemId);
      if (!lockSystem) {
        res.status(404).send("Lock system not found");
        return;
      }

      const key = await keyService.addKey(label, description, accessLevel, lockSystemId);

      if (key === "DUPLICATE_LABEL") {
        res.status(409).send(`A key with label '${label}' already exists in this lock system`);
        return;
      }

      res.status(201).send(key);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
