import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../../services/api';
import { fetchWithISR, generateCacheKey as generateISRCacheKey } from '../../utils/isrCache';

interface LiveVoterListFilters {
  parliament?: string;
  assembly?: string;
  district?: string;
  block?: string;
  mandal?: string;
  kendra?: string;
  partyDistrict?: string;
  dataId?: string;
  lbt?: string;
  gram?: string;
  gp?: string;
  bhagNo?: string;
  areaColony?: string;
  mobile?: string;
  hno?: string;
  name?: string;
  rName?: string;
  surname?: string;
  gender?: string;
  caste?: string;
  age?: string;
  [key: string]: any;
}

interface UseLiveVoterListOptions {
  page?: number;
  limit?: number | 'All';
  filters?: LiveVoterListFilters;
  enabled?: boolean; // Allow conditional fetching
}

// Generate cache key from filters
function generateCacheKey(options: UseLiveVoterListOptions) {
  const { page = 1, limit = 50, filters = {} } = options;
  
  // Only create key if we have at least one master filter
  const hasMasterFilter = Object.keys(filters).some(key => 
    ['dataId', 'parliament', 'assembly', 'district', 'block', 'mandal', 'kendra', 'partyDistrict'].includes(key) &&
    filters[key] && filters[key] !== ''
  );

  if (!hasMasterFilter) {
    return null; // Return null to disable fetching
  }

  // Use ISR cache key generator with pagination support
  return generateISRCacheKey('liveVoterList', filters, { page, limit: typeof limit === 'number' ? limit : 50 });
}

// Fetcher function for ISR
async function fetchLiveVoterList(page: number, limit: number, filters: LiveVoterListFilters) {
  console.log('📊 ISR Fetching live voter list:', { page, limit, filters });

  const response = await apiService.getLiveVoterList(page, limit, filters);
  
  return {
    data: response.data || [],
    pagination: response.pagination || {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: limit
    }
  };
}

export function useLiveVoterList(options: UseLiveVoterListOptions) {
  const { enabled = true, page = 1, limit = 50, filters = {} } = options;
  const cacheKey = enabled ? generateCacheKey(options) : null;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const isMountedRef = useRef(true);
  const lastFetchRef = useRef<string | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!cacheKey) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Prevent duplicate fetches
    if (!force && lastFetchRef.current === cacheKey) {
      console.log('⏭️ Skipping duplicate fetch for', cacheKey);
      return;
    }

    lastFetchRef.current = cacheKey;
    setIsLoading(true);
    setError(null);

    try {
      const limitNum = typeof limit === 'number' ? limit : 50;
      
      // Use ISR cache - serves from cache immediately if available, revalidates if stale
      const result = await fetchWithISR(
        cacheKey,
        () => fetchLiveVoterList(page, limitNum, filters),
        { 
          revalidate: 30000 // Revalidate after 30 seconds
        }
      );

      if (isMountedRef.current) {
        setData(result);
        setIsLoading(false);
        setIsValidating(false);
        console.log('✅ ISR Cache updated:', cacheKey);
      }
    } catch (err) {
      console.error('❌ ISR Fetch error:', err);
      if (isMountedRef.current) {
        setError(err);
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [cacheKey, page, limit, filters]);

  // Fetch on mount and when cache key changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    data: data?.data || [],
    pagination: data?.pagination || {
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: limit
    },
    isLoading,
    isValidating,
    error,
    mutate: () => fetchData(true), // Force refresh
    refresh: () => fetchData(true) // Helper to manually refresh data
  };
}
