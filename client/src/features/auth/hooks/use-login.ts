import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

/**
 * Hook to log in and redirect into the app on success.
 *
 * @returns `login` — attempts the login and navigates to `/lock-systems`
 *   on success, resolving to `true`/`false`; `isLoading` — whether a login
 *   is in flight; `error` — message to render in the form, or `null`.
 */
export function useLogin() {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const message = await authLogin(email, password);
      if (message) {
        setError(message);
        return false;
      }
      navigate("/lock-systems", { replace: true });
      return true;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
