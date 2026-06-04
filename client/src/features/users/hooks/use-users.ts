import { useCallback, useEffect, useState } from "react";
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
 * Hook to fetch all users. (Admin-only endpoint)
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
 * Hook to create a new user.
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
 * Hook to assign a lock system to a user.
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
 * Hook to unassign a lock system from a user.
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
 * Hook to delete a non-admin user.
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
