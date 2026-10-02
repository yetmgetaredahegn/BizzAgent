/*
 * Tiny browser-storage stores for useSyncExternalStore. Storage can be
 * unavailable (private windows, blocked site data), so every access is
 * guarded and falls back to memory for the life of the page.
 */

import { useSyncExternalStore } from "react";

import type {
  ApplicationPack,
  DeclarationId,
  DeclarationRecord,
  FileMetadata,
  InterviewState,
  Lang,
  TranscriptionResult,
} from "./types";

type Listener = () => void;

export interface Store<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
  fallback: T;
}

export function createStore<T>(key: string, area: "local" | "session", fallback: T): Store<T> {
  const listeners = new Set<Listener>();
  let memoryRaw: string | null = null;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function storage(): Storage | null {
    try {
      return area === "local" ? window.localStorage : window.sessionStorage;
    } catch {
      return null;
    }
  }

  function readRaw(): string | null {
    try {
      return storage()?.getItem(key) ?? memoryRaw;
    } catch {
      return memoryRaw;
    }
  }

  function get(): T {
    if (typeof window === "undefined") return fallback;
    const raw = readRaw();
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function set(next: T | ((previous: T) => T)) {
    const value = typeof next === "function" ? (next as (previous: T) => T)(get()) : next;
    const raw = value == null ? null : JSON.stringify(value);
    memoryRaw = raw;
    try {
      const s = storage();
      if (raw == null) s?.removeItem(key);
      else s?.setItem(key, raw);
    } catch {
      // Quota exceeded or storage blocked: the in-memory copy still works.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe, fallback };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

// ---------------------------------------------------------------------------
// App stores
// ---------------------------------------------------------------------------

export interface LiveSession {
  language: Lang;
  startedAt: string;
  documents: {
    licence: FileMetadata;
    workshop: FileMetadata;
    checked: boolean;
  };
  interview: InterviewState | null;
  lastTranscript: TranscriptionResult | null;
}

export type DeclarationBook = Record<string, Partial<Record<DeclarationId, DeclarationRecord>>>;

export const languageStore = createStore<Lang>("bizzagent.lang", "local", "en");
export const liveSessionStore = createStore<LiveSession | null>("bizzagent.live", "session", null);
export const declarationStore = createStore<DeclarationBook>("bizzagent.declarations", "session", {});
export const reviewQueueStore = createStore<ApplicationPack[]>("bizzagent.review.queue", "local", []);
export const importedBatchStore = createStore<ApplicationPack[] | null>(
  "bizzagent.review.imported",
  "local",
  null,
);

export type ThemeChoice = "system" | "light" | "dark";
export const themeStore = createStore<ThemeChoice>("bizzagent.theme", "local", "system");

export const dateOrderStore = createStore<"ec-first" | "gc-first">("bizzagent.dateOrder", "local", "ec-first");

export const lastWorkspaceStore = createStore<string | null>("bizzagent.lastWorkspace", "local", null);

/** Whether BizzAgent reads its replies aloud by itself. Off by default: voice is opt-in. */
export const voiceAutoplayStore = createStore<boolean>("bizzagent.voiceAutoplay", "local", false);
