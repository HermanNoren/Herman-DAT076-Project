import { OrderReason, OrderStatus } from "@/types/order";

/** Human-readable label for each order reason. */
export const REASON_LABELS: Record<OrderReason, string> = {
  lost: "Lost",
  damaged: "Damaged",
  additional_copy: "Additional copy",
  stolen: "Stolen",
  other: "Other",
};

/** Human-readable label for each order status. */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  ready: "Ready for pickup",
  collected: "Collected",
};

/** All order statuses in lifecycle order, for the admin status dropdown. */
export const ORDER_STATUSES: OrderStatus[] = ["placed", "ready", "collected"];
