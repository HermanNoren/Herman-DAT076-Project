import express, { Request, Response } from "express";
import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { OrderDBService } from "../service/order.db";
import { IOrderService } from "../service/iorder";
import { userService } from "./lock-system";
import { keyService } from "./key";
import { requireAdmin, requireAuth } from "./auth";

export const orderRouter = express.Router();
export const orderService: IOrderService = new OrderDBService();

const ORDER_REASONS: OrderReason[] = [
  "lost",
  "damaged",
  "additional_copy",
  "stolen",
  "other",
];
const ORDER_STATUSES: OrderStatus[] = ["placed", "ready", "collected"];

/** GET /orders — returns all orders (admin) or only the logged-in user's orders (user). */
orderRouter.get("/", async (req: Request, res: Response<Order[] | string>) => {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;

    const orders =
      user.role === "admin"
        ? await orderService.getOrders()
        : await orderService.getOrdersByUser(user.id);

    res.status(200).send(orders);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

/** POST /orders — places a new key order for the logged-in user. */
orderRouter.post(
  "/",
  async (
    req: Request<
      {},
      {},
      {
        keyId: string;
        quantity: number;
        reason: OrderReason;
        reasonDetail?: string;
      }
    >,
    res: Response<Order | string>,
  ) => {
    try {
      const user = await requireAuth(req, res);
      if (!user) return;

      const { keyId, quantity, reason, reasonDetail } = req.body;

      if (typeof keyId !== "string") {
        res.status(400).send("Field 'keyId' must be a string");
        return;
      }

      if (
        typeof quantity !== "number" ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        res.status(400).send("Field 'quantity' must be a positive integer");
        return;
      }

      if (!ORDER_REASONS.includes(reason)) {
        res
          .status(400)
          .send(`Field 'reason' must be one of: ${ORDER_REASONS.join(", ")}`);
        return;
      }

      if (
        reason === "other" &&
        (!reasonDetail || typeof reasonDetail !== "string")
      ) {
        res
          .status(400)
          .send("Field 'reasonDetail' is required when reason is 'other'");
        return;
      }

      const result = await orderService.placeOrder(
        user.id,
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
        res.status(403).send("You are not assigned to this lock system");
        return;
      }

      res.status(201).send(result);
    } catch (e: any) {
      res.status(500).send(e.message);
    }
  },
);

/** PATCH /orders/:id/status — advances the status of an order. Admin only. */
orderRouter.patch(
  "/:id/status",
  async (
    req: Request<{ id: string }, {}, { status: OrderStatus }>,
    res: Response<Order | string>,
  ) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;

      const { status } = req.body;

      if (!ORDER_STATUSES.includes(status)) {
        res
          .status(400)
          .send(`Field 'status' must be one of: ${ORDER_STATUSES.join(", ")}`);
        return;
      }

      const result = await orderService.updateOrderStatus(
        req.params.id,
        status,
      );

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
