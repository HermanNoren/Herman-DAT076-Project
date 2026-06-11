import { OrderRow } from "../hooks/use-order-rows";
import { REASON_LABELS, STATUS_LABELS } from "../lib/order-labels";

type Props = {
  /** The user's own orders joined with their display data. */
  rows: OrderRow[];
};

/** Read-only table of the logged-in user's own orders and their status. */
export const UserOrderList = ({ rows }: Props) => {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["Key", "System", "Qty", "Reason", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ order, keyLabel, lockSystemCode }) => (
              <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-card-foreground whitespace-nowrap">
                  {keyLabel}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{lockSystemCode}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{order.quantity}</td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                  {REASON_LABELS[order.reason]}
                  {order.reasonDetail && (
                    <span className="block max-w-xs text-xs text-muted-foreground/70 whitespace-normal">
                      {order.reasonDetail}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground whitespace-nowrap">
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      )}
    </div>
  );
};
