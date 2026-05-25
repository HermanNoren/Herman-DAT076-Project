import express, { Request, Response } from "express";
import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { OrderService } from "../service/order";
import { userService } from "./lock-system";
import { keyService } from "./key";

export const orderRouter = express.Router();
export const orderService = new OrderService();

const ORDER_REASONS: OrderReason[] = ["lost", "damaged", "additional_copy", "stolen", "other"];
const ORDER_STATUSES: OrderStatus[] = ["placed", "ready", "collected"];

/** GET /orders?userId= — returns all orders, or only those belonging to the given user. */
orderRouter.get(
  "/",
  async (
    req: Request<{}, {}, {}, { userId?: string }>,
    res: Response<Order[] | string>,
  ) => {
    try {
      const { userId } = req.query;
      const orders = userId
        ? await orderService.getOrdersByUser(userId)
        : await orderService.getOrders();
      res.status(200).send(orders);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** POST /orders — places a new key order for a user. */
orderRouter.post(
  "/",
  async (
    req: Request<{}, {}, { userId: string; keyId: string; quantity: number; reason: OrderReason; reasonDetail?: string }>,
    res: Response<Order | string>,
  ) => {
    try {
      const { userId, keyId, quantity, reason, reasonDetail } = req.body;

      if (typeof userId !== "string" || typeof keyId !== "string") {
        res.status(400).send("Fields 'userId' and 'keyId' must be strings");
        return;
      }

      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
        res.status(400).send("Field 'quantity' must be a positive integer");
        return;
      }

      if (!ORDER_REASONS.includes(reason)) {
        res.status(400).send(`Field 'reason' must be one of: ${ORDER_REASONS.join(", ")}`);
        return;
      }

      if (reason === "other" && (!reasonDetail || typeof reasonDetail !== "string")) {
        res.status(400).send("Field 'reasonDetail' is required when reason is 'other'");
        return;
      }

      const result = await orderService.placeOrder(
        userId,
        keyId,
        quantity,
        reason,
        reasonDetail,
        userService,
        keyService,
      );

      if (result === "USER_NOT_FOUND") {
        res.status(404).send("User not found");
        return;
      }

      if (result === "KEY_NOT_FOUND") {
        res.status(404).send("Key not found");
        return;
      }

      if (result === "FORBIDDEN") {
        res.status(403).send("User cannot order keys from this lock system");
        return;
      }

      res.status(201).send(result);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** PATCH /orders/:id/status — advances the status of an order (admin only). */
orderRouter.patch(
  "/:id/status",
  async (
    req: Request<{ id: string }, {}, { status: OrderStatus }>,
    res: Response<Order | string>,
  ) => {
    try {
      const { status } = req.body;

      if (!ORDER_STATUSES.includes(status)) {
        res.status(400).send(`Field 'status' must be one of: ${ORDER_STATUSES.join(", ")}`);
        return;
      }

      const result = await orderService.updateOrderStatus(req.params.id, status);

      if (result === "NOT_FOUND") {
        res.status(404).send("Order not found");
        return;
      }

      res.status(200).send(result);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);
