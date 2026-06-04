import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { LockSystemsPage } from "./pages/lock-systems";
import { LockSystemDetailPage } from "./pages/lock-system-detail";
import { OrdersPage } from "./pages/orders";
import { UsersPage } from "./pages/users";
import { LoginPage } from "./pages/login";
import { AuthProvider, useAuth } from "@/features/auth/context/auth-context";

/** Redirects unauthenticated users to /login, shows nothing while loading. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

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

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
