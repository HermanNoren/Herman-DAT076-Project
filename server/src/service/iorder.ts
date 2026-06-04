import { Order, OrderReason, OrderStatus } from "../model/order.interface";
import { IUserService } from "./iuser";
import { IKeyService } from "./ikey";

export interface IOrderService {
  getOrders(): Promise<Order[]>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  placeOrder(
    userId: string,
    keyId: string,
    quantity: number,
    reason: OrderReason,
    reasonDetail: string | undefined,
    userService: IUserService,
    keyService: IKeyService,
  ): Promise<Order | "USER_NOT_FOUND" | "KEY_NOT_FOUND" | "FORBIDDEN">;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | "NOT_FOUND">;
}
