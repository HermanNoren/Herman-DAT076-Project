import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { LockSystemsPage } from "./pages/lock-systems";
import { LockSystemDetailPage } from "./pages/lock-system-detail";
import { OrdersPage } from "./pages/orders";
import { UsersPage } from "./pages/users";
import { LoginPage } from "./pages/login";
import { AuthProvider } from "@/features/auth/context/auth-context";
import { AdminRoute, ProtectedRoute } from "@/features/auth/components/route-guards";

/**
 * Route table. `/login` is public; everything else is wrapped in
 * {@link ProtectedRoute} and rendered inside the {@link AppLayout} shell.
 * `/users` additionally requires the admin role via {@link AdminRoute}.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="lock-systems" replace />} />
        <Route path="lock-systems" element={<LockSystemsPage />} />
        <Route path="lock-systems/:referenceCode" element={<LockSystemDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}

/** Application root: provides authentication state to the route tree. */
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
