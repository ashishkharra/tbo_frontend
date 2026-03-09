/**
 * ISR-like Cache Utility
 * Implements Incremental Static Regeneration pattern for client-side data caching
 * Features:
 * - Persistent cache using localStorage
 * - Stale-while-revalidate pattern
 * - Automatic background revalidation
 * - Support for pagination and filters
 */

export interface CacheConfig {
  revalidate?: number; // Revalidation time in milliseconds (default: 5 minutes)
  cacheKey?: string;   // Base cache key (default: 'isr_cache')
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

export interface CacheResult<T> {
  data: T | null;
  isStale: boolean;
  fromCache: boolean;
}

const DEFAULT_REVALIDATE = 300000; // 5 minutes
const DEFAULT_CACHE_KEY = 'isr_cache';

/**
 * Generate a unique cache key from filters and pagination params
 */
export function generateCacheKey(
  baseKey: string,
  filters: Record<string, any>,
  pagination?: { page?: number; limit?: number; offset?: number }
): string {
  const filterStr = JSON.stringify(
    Object.entries(filters)
      .filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
  );
  
  const paginationStr = pagination
    ? `_p${pagination.page || 0}_l${pagination.limit || 0}_o${pagination.offset || 0}`
    : '';
  
  return `${baseKey}${paginationStr}_${Buffer.from(filterStr).toString('base64')}`;
}

/**
 * Get data from cache
 */
export function getCachedData<T>(
  key: string,
  revalidate: number = DEFAULT_REVALIDATE
): CacheResult<T> {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      return { data: null, isStale: false, fromCache: false };
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const isStale = (now - entry.timestamp) > revalidate;

    return {
      data: entry.data,
      isStale,
      fromCache: true
    };
  } catch (e) {
    console.warn('ISR Cache: Failed to read from cache', e);
    return { data: null, isStale: false, fromCache: false };
  }
}

/**
 * Set data in cache
 */
export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('ISR Cache: Failed to write to cache', e);
    // If localStorage is full, clear old entries
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      clearOldCache();
      // Try again
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          key
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (e2) {
        console.error('ISR Cache: Still failed after cleanup', e2);
      }
    }
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('ISR Cache: Failed to clear cache', e);
  }
}

/**
 * Clear all cache entries with a specific prefix
 */
export function clearCacheByPrefix(prefix: string): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('ISR Cache: Failed to clear cache by prefix', e);
  }
}

/**
 * Clear old cache entries (older than 24 hours)
 */
export function clearOldCache(maxAge: number = 86400000): void {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(DEFAULT_CACHE_KEY) || key.startsWith('isr_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const entry = JSON.parse(cached);
            if (entry.timestamp && (now - entry.timestamp) > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  } catch (e) {
    console.warn('ISR Cache: Failed to clear old cache', e);
  }
}

/**
 * Fetch data with ISR pattern - serve from cache immediately, revalidate if stale
 */
export async function fetchWithISR<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const revalidate = config.revalidate || DEFAULT_REVALIDATE;
  
  // Try to get from cache first
  const cached = getCachedData<T>(cacheKey, revalidate);
  
  if (cached.fromCache && cached.data) {
    console.log('✅ ISR: Serving from cache', cacheKey);
    
    // If stale, revalidate in background
    if (cached.isStale) {
      console.log('🔄 ISR: Cache stale, revalidating in background...');
      fetcher()
        .then(freshData => {
          setCachedData(cacheKey, freshData);
          console.log('✅ ISR: Background revalidation complete');
        })
        .catch(err => {
          console.warn('⚠️ ISR: Background revalidation failed', err);
        });
    }
    
    // Return cached data immediately
    return cached.data;
  }
  
  // No cache, fetch fresh data
  console.log('📡 ISR: Fetching fresh data (no cache)', cacheKey);
  const freshData = await fetcher();
  setCachedData(cacheKey, freshData);
  return freshData;
}

/**
 * Invalidate cache and refetch
 */
export async function revalidate<T>(
  cacheKey: string,
  fetcher: () => Promise<T>
): Promise<T> {
  console.log('🔄 ISR: Force revalidating', cacheKey);
  clearCache(cacheKey);
  const freshData = await fetcher();
  setCachedData(cacheKey, freshData);
  return freshData;
}
