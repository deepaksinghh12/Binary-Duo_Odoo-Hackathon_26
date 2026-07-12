interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export const cache = {
  /**
   * Store a value in cache with a Time-To-Live (TTL) in milliseconds.
   */
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    memoryStore.set(key, { value, expiresAt });
  },

  /**
   * Retrieve a value from cache. Returns null if expired or not found.
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryStore.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }

    return entry.value as T;
  },

  /**
   * Delete a key from cache.
   */
  async delete(key: string): Promise<void> {
    memoryStore.delete(key);
  },

  /**
   * Clear all cache entries.
   */
  async clear(): Promise<void> {
    memoryStore.clear();
  }
};
