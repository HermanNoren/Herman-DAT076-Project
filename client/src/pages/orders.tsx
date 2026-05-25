import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/context/auth-context";
import { useOrders, useAllKeys, useUpdateOrderStatus } from "@/features/orders/hooks/use-orders";
import { useUsers } from "@/features/users/hooks/use-users";
import { useLockSystems } from "@/features/lock-systems/hooks/use-lock-systems";
import { Order, OrderReason, OrderStatus } from "@/types/order";
import { Key } from "@/types/key";
import { LockSystem } from "@/types/lock-system";
import { User } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASON_LABELS: Record<OrderReason, string> = {
  lost: "Lost",
  damaged: "Damaged",
  additional_copy: "Additional copy",
  stolen: "Stolen",
  other: "Other",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  ready: "Ready for pickup",
  collected: "Collected",
};

const ORDER_STATUSES: OrderStatus[] = ["placed", "ready", "collected"];

// ─── Admin view ─────────────────────────────────────────────────────────────

type AdminOrdersProps = {
  orders: Order[];
  users: User[];
  keys: Key[];
  lockSystems: LockSystem[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
};

function AdminOrderList({ orders, users, keys, lockSystems, onStatusChange }: AdminOrdersProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {["User", "Key", "System", "Qty", "Reason", "Status"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const key = keys.find((k) => k.id === order.keyId);
            const lockSystem = lockSystems.find((ls) => ls.id === key?.lockSystemId);
            const orderUser = users.find((u) => u.id === order.userId);

            return (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                  {orderUser?.name ?? order.userId}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {key?.label ?? order.keyId}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {lockSystem?.referenceCode ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {order.quantity}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {REASON_LABELS[order.reason]}
                  {order.reasonDetail && (
                    <span className="block text-xs text-muted-foreground/70">
                      {order.reasonDetail}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <Select
                    value={order.status}
                    onValueChange={(val) => onStatusChange(order.id, val as OrderStatus)}
                  >
                    <SelectTrigger className="w-40" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      )}
    </div>
  );
}

// ─── User view ───────────────────────────────────────────────────────────────

type UserOrdersProps = {
  orders: Order[];
  keys: Key[];
  lockSystems: LockSystem[];
};

function UserOrderList({ orders, keys, lockSystems }: UserOrdersProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            {["Key", "System", "Qty", "Reason", "Status"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const key = keys.find((k) => k.id === order.keyId);
            const lockSystem = lockSystems.find((ls) => ls.id === key?.lockSystemId);

            return (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                  {key?.label ?? order.keyId}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {lockSystem?.referenceCode ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {order.quantity}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  {REASON_LABELS[order.reason]}
                  {order.reasonDetail && (
                    <span className="block text-xs text-muted-foreground/70">
                      {order.reasonDetail}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export const OrdersPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { orders, refetch } = useOrders();
  const { keys } = useAllKeys();
  const { lockSystems } = useLockSystems();
  const { users } = useUsers();
  const { updateStatus } = useUpdateOrderStatus();

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const ok = await updateStatus(orderId, status);
    if (ok) refetch();
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description={isAdmin ? "Manage all key orders" : "Your key orders"}
      />

      {isAdmin ? (
        <AdminOrderList
          orders={orders}
          users={users}
          keys={keys}
          lockSystems={lockSystems}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <UserOrderList orders={orders} keys={keys} lockSystems={lockSystems} />
      )}
    </>
  );
};
