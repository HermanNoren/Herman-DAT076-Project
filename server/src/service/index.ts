/**
 * Composition root: the one place where concrete service implementations
 * are chosen and wired together. Routers and auth guards import these
 * shared instances and depend only on the service interfaces, so swapping
 * an implementation is a one-line change here.
 */
import { IUserService } from "./iuser";
import { IKeyService } from "./ikey";
import { ILockSystemService } from "./ilock-system";
import { IOrderService } from "./iorder";
import { UserDBService } from "./user.db";
import { KeyDBService } from "./key.db";
import { LockSystemDBService } from "./lock-system.db";
import { OrderDBService } from "./order.db";

/** Shared user service instance. */
export const userService: IUserService = new UserDBService();

/** Shared lock system service instance. */
export const lockSystemService: ILockSystemService = new LockSystemDBService();

/** Shared key service instance. */
export const keyService: IKeyService = new KeyDBService();

/**
 * Shared order service instance, injected with the user and key services
 * it validates orders against.
 */
export const orderService: IOrderService = new OrderDBService(
  userService,
  keyService,
);
