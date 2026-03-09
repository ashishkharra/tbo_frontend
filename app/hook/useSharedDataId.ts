'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'liveVoterListDataId';

export function useSharedDataId() {
  const [dataId, setDataIdState] = useState('');

  // Load from session storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      setDataIdState(stored);
    }
  }, []);

  const setDataId = useCallback((value: string) => {
    setDataIdState(value);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  return { dataId, setDataId };
}

