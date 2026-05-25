export type OrderStatus = "placed" | "ready" | "collected";
export type OrderReason = "lost" | "damaged" | "additional_copy" | "stolen" | "other";

export interface Order {
  id: string;
  userId: string;
  keyId: string;
  quantity: number;
  reason: OrderReason;
  reasonDetail?: string;
  status: OrderStatus;
  createdAt: string;
}
