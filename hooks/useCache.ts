/**
 * Tiny in-memory cache so navigating back to a tab
 * shows stale data instantly, then refreshes in the background.
 */
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 30_000; // 30 seconds

export function getCached<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL) { cache.delete(key); return null; }
  return hit.data as T;
}

export function setCache(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

export function invalidateCache(key: string) {
  cache.delete(key);
}
