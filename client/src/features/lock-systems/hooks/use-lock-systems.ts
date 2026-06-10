import { useCallback, useEffect, useState } from "react";
import { getLockSystem, getVisibleLockSystems, getAllKeys, createLockSystem } from "@/api/lock-systems";
import { LockSystem } from "@/types/lock-system";
import { createKey as createKeyApi, getKeysByLockSystem } from "@/api/keys";
import { AccessLevel, Key } from "@/types/key";
import { getApiError } from "@/lib/utils";

/**
 * Fetches all lock systems visible to the current user (admins see every
 * system, regular users only their assigned ones).
 *
 * @returns `lockSystems` — the fetched systems; `isLoading` and `error` —
 *   request state; `refetch` — runs the fetch again.
 */
export function useLockSystems() {
  const [lockSystems, setLockSystems] = useState<LockSystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchLockSystems() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getVisibleLockSystems();
        if (!cancelled) setLockSystems(data);
      } catch (e) {
        const message = getApiError(e, "Failed to fetch lock systems");
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLockSystems();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { lockSystems, isLoading, error, refetch };
}

/**
 * Creates a new lock system (admin action).
 *
 * @returns `create` — performs the creation, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useCreateLockSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(name: string, description: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await createLockSystem(name, description);
      return true;
    } catch (e) {
      setError(getApiError(e, "Failed to create lock system"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { create, isLoading, error };
}

/**
 * Fetches a single lock system.
 *
 * @param referenceCode - Code from the URL, e.g. "SYS-001".
 * @returns `lockSystem` — the fetched system, or `null` while loading or on
 *   failure; `isLoading` and `error` — request state.
 */
export function useLockSystem(referenceCode: string) {
  const [lockSystem, setLockSystem] = useState<LockSystem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLockSystem() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLockSystem(referenceCode);
        if (!cancelled) setLockSystem(data);
      } catch (e) {
        const message = getApiError(e, "Failed to fetch lock system");
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLockSystem();

    return () => {
      cancelled = true;
    };
  }, [referenceCode]);

  return { lockSystem, isLoading, error };
}

/**
 * Fetches the keys of one lock system.
 *
 * @param lockSystemId - UUID of the lock system.
 * @returns `keys` — the fetched keys; `isLoading` and `error` — request
 *   state; `refetch` — runs the fetch again (used after creating a key).
 */
export function useLockSystemKeys(lockSystemId: string) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchKeys() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getKeysByLockSystem(lockSystemId);
        if (!cancelled) setKeys(data);
      } catch (e) {
        const message = getApiError(e, "Failed to fetch keys");
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchKeys();

    return () => {
      cancelled = true;
    };
  }, [lockSystemId, tick]);

  return { keys, isLoading, error, refetch };
}

/**
 * Creates a new key within a lock system (admin action).
 *
 * @returns `create` — performs the creation, resolving to `true` on
 *   success; `isLoading` and `error` — request state.
 */
export function useCreateKey() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(
    label: string,
    description: string,
    accessLevel: AccessLevel,
    lockSystemId: string,
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      await createKeyApi(label, description, accessLevel, lockSystemId);
      return true;
    } catch (e) {
      const message = getApiError(e, "Failed to create key");
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return { create, isLoading, error };
}

/**
 * Fetches all keys and counts them per lock system. Used to show the
 * number of keys on each lock system card; errors are ignored because the
 * count is purely cosmetic.
 *
 * @returns `counts` — a map of lock system ID to key count.
 */
export function useKeyCountsByLockSystem() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    getAllKeys()
      .then((keys) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        for (const key of keys) {
          map[key.lockSystemId] = (map[key.lockSystemId] ?? 0) + 1;
        }
        setCounts(map);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return { counts };
}
