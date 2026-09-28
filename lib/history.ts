/**
 * Viewing history: a tiny external store over localStorage.
 *
 * Why no Context or state library: the only client state is a per-browser
 * list of visited dates. `useSyncExternalStore` subscribes components straight
 * to localStorage, and the `storage` event keeps other open tabs in sync.
 *
 * The pure functions (`parseHistory`, `addEntry`) hold all the logic and are
 * unit-tested. The rest is a thin browser adapter around them.
 */
import { useSyncExternalStore } from "react";
import { toTrustedAssetUrl } from "./assets";
import { getDateWindow, isInWindow, isIsoDate, type DateWindow } from "./dates";

export type HistoryEntry = {
  date: string;
  title: string;
  imageUrl: string | null;
};

const STORAGE_KEY = "apod:history:v1";
const MAX_ENTRIES = 50;
const EMPTY: HistoryEntry[] = [];

/**
 * Parses stored history defensively. localStorage is user-editable, so every
 * entry is re-validated. Dates outside the rolling window are pruned here,
 * which is how stale history "falls off" without a background job.
 */
export function parseHistory(
  raw: string | null,
  dateWindow: DateWindow,
): HistoryEntry[] {
  if (!raw) return EMPTY;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!Array.isArray(data)) return EMPTY;

  const seen = new Set<string>();
  const entries: HistoryEntry[] = [];

  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const { date, title, imageUrl } = item as Record<string, unknown>;

    if (!isIsoDate(date) || !isInWindow(date, dateWindow)) continue;
    if (typeof title !== "string" || title.length === 0) continue;
    if (seen.has(date)) continue;

    seen.add(date);
    entries.push({
      date,
      title: title.slice(0, 200),
      imageUrl: toTrustedAssetUrl(imageUrl),
    });
    if (entries.length === MAX_ENTRIES) break;
  }

  return entries;
}

/** Moves the entry to the front (most recent first) without duplicates. */
export function addEntry(
  entries: HistoryEntry[],
  entry: HistoryEntry,
): HistoryEntry[] {
  return [entry, ...entries.filter((e) => e.date !== entry.date)].slice(
    0,
    MAX_ENTRIES,
  );
}

// Browser adapter -----------------------------------------------------------

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedEntries: HistoryEntry[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (privacy modes, blocked cookies).
    return null;
  }
}

function writeRaw(value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore quota or access errors; history is a convenience feature.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Must return the same array reference while storage is unchanged, or
 * `useSyncExternalStore` would re-render forever. Re-parse only on change.
 */
function getSnapshot(): HistoryEntry[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedEntries = parseHistory(raw, getDateWindow());
  }
  return cachedEntries;
}

/** The server has no per-user history, so pre-rendered HTML stays generic. */
function getServerSnapshot(): HistoryEntry[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function recordVisit(entry: HistoryEntry) {
  writeRaw(JSON.stringify(addEntry(getSnapshot(), entry)));
}

export function clearHistory() {
  writeRaw(null);
}
