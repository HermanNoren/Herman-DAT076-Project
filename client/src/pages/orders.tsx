import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/features/auth/context/auth-context";
import { useOrderRows } from "@/features/orders/hooks/use-order-rows";
import { AdminOrderList } from "@/features/orders/components/admin-order-list";
import { UserOrderList } from "@/features/orders/components/user-order-list";

/**
 * Orders page. Admins see every order with status controls; regular users
 * see a read-only list of their own orders. The user list is only fetched
 * for admins (`withUsers`), since that endpoint is admin-only.
 */
export const OrdersPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { rows, refetch } = useOrderRows({ withUsers: isAdmin });

  return (
    <>
      <PageHeader
        title="Orders"
        description={isAdmin ? "Manage all key orders" : "Your key orders"}
      />
      {isAdmin ? (
        <AdminOrderList rows={rows} onStatusChanged={refetch} />
      ) : (
        <UserOrderList rows={rows} />
      )}
    </>
  );
};
