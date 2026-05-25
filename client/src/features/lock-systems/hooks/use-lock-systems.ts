import { useCallback, useEffect, useState } from "react";
import { getLockSystem, getVisibleLockSystems, getAllKeys, createLockSystem } from "@/api/lock-systems";
import { LockSystem } from "@/types/lock-system";
import { createKey as createKeyApi, getKeysByLockSystem } from "@/api/keys";
import { AccessLevel, Key } from "@/types/key";
import { getApiError } from "@/lib/utils";

/**
 * Hook to fetch all lock systems visible to the current user.
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
 * Hook to create a new lock system.
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
 * Hook to fetch a single lock system by its referenceCode (e.g. "SYS-001").
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
 * Hook to fetch all keys within the given lock system.
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
 * Hook to create a key within a lock system.
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
 * Fetches all keys and returns a map of lockSystemId → key count.
 * Used to show the number of keys on each lock system card.
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
