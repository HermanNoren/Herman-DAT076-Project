import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";
import { login as loginApi, logout as logoutApi, getSession } from "@/api/session";

/** Authentication state and actions exposed by {@link useAuth}. */
type AuthContextValue = {
  /** The logged-in user, or `null` when logged out (or while still loading). */
  user: User | null;
  /** True while the initial session check is in flight. */
  isLoading: boolean;
  /** Attempts to log in. Resolves to an error message, or `null` on success. */
  login: (email: string, password: string) => Promise<string | null>;
  /** Logs out and redirects to the login page. */
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provides authentication state to the whole app (placed in `App.tsx`).
 *
 * On mount it calls `GET /session` to restore an existing session, so a
 * page refresh keeps the user logged in.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for an existing session on initial mount.
  useEffect(() => {
    getSession()
      .then((u) => setUser(u))
      .finally(() => setIsLoading(false));
  }, []);

  /** Attempts login. Returns an error message on failure, or null on success. */
  async function login(email: string, password: string): Promise<string | null> {
    try {
      const u = await loginApi(email, password);
      setUser(u);
      return null;
    } catch {
      return "Invalid email or password";
    }
  }

  /** Logs out and redirects to the login page. */
  async function logout(): Promise<void> {
    await logoutApi();
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Accesses the authentication context.
 *
 * @returns The current {@link AuthContextValue}.
 * @throws If called outside an {@link AuthProvider}.
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
