const STORAGE_KEY = "carvizo:saved-listings";

type Listener = (ids: string[]) => void;

const listeners = new Set<Listener>();

function emit(ids: string[]): void {
  listeners.forEach((listener) => listener(ids));
}

export function readSavedListingIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeSavedListingIds(ids: string[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  emit(ids);
}

export function toggleSavedListing(id: string): string[] {
  const current = readSavedListingIds();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  writeSavedListingIds(next);
  return next;
}

export function subscribeSavedListings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
