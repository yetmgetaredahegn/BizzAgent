"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { dbVersion, subscribeDb } from "./mock/db";

export interface QueryState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

/**
 * Loads data through the API and reloads it whenever the mock database
 * changes. `key` identifies the request (include every input of `load`);
 * `load` should read only from the API.
 */
export function useQuery<T>(key: string, load: () => Promise<T>): QueryState<T> {
  const version = useSyncExternalStore(subscribeDb, dbVersion, () => 0);
  const [state, setState] = useState<QueryState<T> & { forKey: string }>({
    data: undefined,
    error: undefined,
    loading: true,
    forKey: "",
  });

  useEffect(() => {
    let alive = true;
    load().then(
      (data) => alive && setState({ data, error: undefined, loading: false, forKey: key }),
      (error: Error) => alive && setState({ data: undefined, error, loading: false, forKey: key }),
    );
    return () => {
      alive = false;
    };
    // `key` stands for every input of `load`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);

  const stale = state.forKey !== key;
  return { data: stale ? undefined : state.data, error: stale ? undefined : state.error, loading: stale || state.loading };
}
