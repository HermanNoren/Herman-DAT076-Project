import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/user";
import { login as loginApi, logout as logoutApi, getSession } from "@/api/session";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
