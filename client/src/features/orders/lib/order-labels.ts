import { OrderReason, OrderStatus } from "@/types/order";

export const REASON_LABELS: Record<OrderReason, string> = {
  lost: "Lost",
  damaged: "Damaged",
  additional_copy: "Additional copy",
  stolen: "Stolen",
  other: "Other",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  ready: "Ready for pickup",
  collected: "Collected",
};

export const ORDER_STATUSES: OrderStatus[] = ["placed", "ready", "collected"];
