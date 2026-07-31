type CachedSession = {
  isActive: boolean;
  expiresAt: Date;
  eventId: string;
  cachedAt: number;
};

const cache = new Map<string, CachedSession>();
const TTL_MS = 60_000; // 60 seconds — session revocation takes up to 60s to propagate

export function getCachedSession(sessionId: string): CachedSession | null {
  const entry = cache.get(sessionId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > TTL_MS) {
    cache.delete(sessionId);
    return null;
  }
  return entry;
}

export function setCachedSession(
  sessionId: string,
  data: Pick<CachedSession, "isActive" | "expiresAt" | "eventId">
): void {
  cache.set(sessionId, { ...data, cachedAt: Date.now() });
}

export function invalidateCachedSession(sessionId: string): void {
  cache.delete(sessionId);
}
