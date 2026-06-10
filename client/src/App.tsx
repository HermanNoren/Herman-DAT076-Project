import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { LockSystemsPage } from "./pages/lock-systems";
import { LockSystemDetailPage } from "./pages/lock-system-detail";
import { OrdersPage } from "./pages/orders";
import { UsersPage } from "./pages/users";
import { LoginPage } from "./pages/login";
import { AuthProvider, useAuth } from "@/features/auth/context/auth-context";

/**
 * Gate for authenticated routes: renders nothing while the session check
 * is loading, redirects to /login when logged out, otherwise renders its
 * children.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Route table. `/login` is public; everything else is wrapped in
 * {@link ProtectedRoute} and rendered inside the {@link AppLayout} shell.
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
        <Route path="users" element={<UsersPage />} />
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
