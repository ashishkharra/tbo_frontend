/**
 * Session Storage utilities for MasterFilter persistence
 * Session storage persists across page navigations but clears when browser tab is closed
 */

export interface MasterFilterState {
  division?: string;
  parliament?: string;
  assembly?: string;
  district?: string;
  block?: string;
  parliamentLabel?: string;
  assemblyLabel?: string;
  districtLabel?: string;
  blockLabel?: string;
}

export interface MasterFilterStorage {
  filters: MasterFilterState;
  isLocked: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'masterFilterState';
const LOCK_STORAGE_KEY = 'masterFilterLockState';

/**
 * Save master filter state to session storage
 */
export const saveMasterFiltersToSession = (filters: MasterFilterState, isLocked: boolean = false): void => {
  try {
    const storageData: MasterFilterStorage = {
      filters,
      isLocked,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    
    // Also save lock state separately for quick access
    if (isLocked) {
     /* sessionStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify({
        isLocked: true,
        filters,
        timestamp: Date.now()
      }));
      */
    } else {
      sessionStorage.removeItem(LOCK_STORAGE_KEY);
    }
    
    console.log('💾 Master filters saved to session storage:', filters);
  } catch (error) {
    console.error('Error saving master filters to session storage:', error);
  }
};

/**
 * Load master filter state from session storage
 */
export const loadMasterFiltersFromSession = (): { filters: MasterFilterState; isLocked: boolean } => {
  try {
    // First check if filters are locked
    const lockData = sessionStorage.getItem(LOCK_STORAGE_KEY);
    if (lockData) {
      try {
        const lockState = JSON.parse(lockData);
        if (lockState && lockState.isLocked && lockState.filters && typeof lockState.filters === 'object') {
          console.log('🔒 Loading locked master filters from session storage:', lockState.filters);
          return {
            filters: lockState.filters || {},
            isLocked: true
          };
        }
      } catch (parseError) {
        console.warn('Error parsing lock data:', parseError);
      }
    }
    
    // Load regular saved filters
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const storageData: MasterFilterStorage = JSON.parse(savedData);
        if (storageData && storageData.filters && typeof storageData.filters === 'object') {
          console.log('📂 Loading master filters from session storage:', storageData.filters);
          return {
            filters: storageData.filters || {},
            isLocked: false
          };
        }
      } catch (parseError) {
        console.warn('Error parsing saved data:', parseError);
      }
    }
    
    console.log('📭 No master filters found in session storage');
    return {
      filters: {},
      isLocked: false
    };
  } catch (error) {
    console.error('Error loading master filters from session storage:', error);
    return {
      filters: {},
      isLocked: false
    };
  }
};

/**
 * Clear master filter state from session storage
 */
export const clearMasterFiltersFromSession = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LOCK_STORAGE_KEY);
    console.log('🗑️ Master filters cleared from session storage');
  } catch (error) {
    console.error('Error clearing master filters from session storage:', error);
  }
};

/**
 * Check if master filters exist in session storage
 */
export const hasMasterFiltersInSession = (): boolean => {
  try {
    const lockData = sessionStorage.getItem(LOCK_STORAGE_KEY);
    if (lockData) {
      const lockState = JSON.parse(lockData);
      return lockState.isLocked && lockState.filters;
    }
    
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const storageData: MasterFilterStorage = JSON.parse(savedData);
      return Object.keys(storageData.filters).length > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking master filters in session storage:', error);
    return false;
  }
};

/**
 * Get master filter state without loading (for quick checks)
 */
export const getMasterFiltersFromSession = (): MasterFilterState => {
  try {
    const lockData = sessionStorage.getItem(LOCK_STORAGE_KEY);
    if (lockData) {
      const lockState = JSON.parse(lockData);
      if (lockState.isLocked && lockState.filters) {
        return lockState.filters;
      }
    }
    
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const storageData: MasterFilterStorage = JSON.parse(savedData);
      return storageData.filters;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting master filters from session storage:', error);
    return {};
  }
};

/**
 * Save lock state to session storage
 */
export const saveLockStateToSession = (filters: MasterFilterState): void => {
  try {
    const lockData = {
      isLocked: true,
      filters,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockData));
    console.log('🔒 Lock state saved to session storage:', filters);
  } catch (error) {
    console.error('Error saving lock state to session storage:', error);
  }
};

/**
 * Clear lock state from session storage
 */
export const clearLockStateFromSession = (): void => {
  try {
    sessionStorage.removeItem(LOCK_STORAGE_KEY);
    console.log('🔓 Lock state cleared from session storage');
  } catch (error) {
    console.error('Error clearing lock state from session storage:', error);
  }
};
