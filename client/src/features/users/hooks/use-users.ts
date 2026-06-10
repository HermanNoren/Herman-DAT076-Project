import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getUsers,
  createUser,
  assignLockSystem,
  unassignLockSystem,
  deleteUser,
} from "@/api/users";
import { User, UserRole } from "@/types/user";
import { getApiError } from "@/lib/utils";

/**
 * Fetches all users (admin-only endpoint).
 *
 * @param enabled - When `false`, no request is made at all. Used by
 *   non-admin views that must not call the admin-only endpoint.
 * @returns `users` — the fetched users; `isLoading` and `error` — request
 *   state; `refetch` — runs the fetch again.
 */
export function useUsers(enabled = true) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getUsers();
        if (!cancelled) setUsers(data);
      } catch (e) {
        if (!cancelled) setError(getApiError(e, "Failed to fetch users"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [tick, enabled]);

  return { users, isLoading, error, refetch };
}

/**
 * Fetches all users and splits them by role (admin-only endpoint).
 *
 * @returns `regularUsers` and `admins` — the users grouped by role;
 *   `isLoading` and `error` — request state; `refetch` — runs the fetch again.
 */
export function useGroupedUsers() {
  const { users, isLoading, error, refetch } = useUsers();

  const regularUsers = useMemo(
    () => users.filter((u) => u.role === "user"),
    [users],
  );
  const admins = useMemo(
    () => users.filter((u) => u.role === "admin"),
    [users],
  );

  return { regularUsers, admins, isLoading, error, refetch };
}

/**
 * Creates a new user account (admin action).
 *
 * @returns `create` — performs the creation, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useCreateUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await createUser(name, email, password, role);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to create user"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { create, isLoading, error };
}

/**
 * Grants a user access to a lock system (admin action).
 *
 * @returns `assign` — performs the assignment, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useAssignLockSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assign(
    userId: string,
    lockSystemId: string,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await assignLockSystem(userId, lockSystemId);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to assign lock system"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { assign, isLoading, error };
}

/**
 * Revokes a user's access to a lock system (admin action).
 *
 * @returns `unassign` — performs the removal, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useUnassignLockSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unassign(
    userId: string,
    lockSystemId: string,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await unassignLockSystem(userId, lockSystemId);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to unassign lock system"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { unassign, isLoading, error };
}

/**
 * Deletes a non-admin user (admin action).
 *
 * @returns `remove` — performs the deletion, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useDeleteUser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(userId: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to delete user"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { remove, isLoading, error };
}
