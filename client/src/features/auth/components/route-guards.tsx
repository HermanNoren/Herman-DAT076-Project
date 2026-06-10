import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

/**
 * Gate for authenticated routes: renders nothing while the session check
 * is loading, redirects to /login when logged out, otherwise renders its
 * children.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/**
 * Gate for admin-only routes: renders nothing while the session check is
 * loading, redirects regular users to the app's start page, otherwise
 * renders its children. Logged-out users are handled by the surrounding
 * {@link ProtectedRoute}.
 */
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user?.role !== "admin") return <Navigate to="/lock-systems" replace />;
  return <>{children}</>;
};
