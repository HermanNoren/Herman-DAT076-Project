import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/types/order";
import { OrderRow } from "../hooks/use-order-rows";
import { useUpdateOrderStatus } from "../hooks/use-orders";
import { REASON_LABELS, STATUS_LABELS, ORDER_STATUSES } from "../lib/order-labels";

type Props = {
  rows: OrderRow[];
  onStatusChanged: () => void;
};

export const AdminOrderList = ({ rows, onStatusChanged }: Props) => {
  const { updateStatus } = useUpdateOrderStatus();

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const ok = await updateStatus(orderId, status);
    if (ok) onStatusChanged();
  }

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
          {rows.map(({ order, keyLabel, lockSystemCode, userName }) => (
            <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">
                {userName}
              </td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">{keyLabel}</td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">{lockSystemCode}</td>
              <td className="px-5 py-3.5 text-sm text-muted-foreground">{order.quantity}</td>
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
                  onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
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
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      )}
    </div>
  );
};
