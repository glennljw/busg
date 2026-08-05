'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'busg:recent-stops';
const MAX_RECENTS = 10;

export const useRecentStops = () => {
  const [recentCodes, setRecentCodes] = useState<string[]>([]);

  useEffect(() => {
    // Deferred to an effect (not a lazy useState initializer) so the client's
    // first render matches the storage-less server render -- see
    // useFavoriteStops for the same hydration-mismatch rationale.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setRecentCodes(JSON.parse(raw));
    } catch {
      // Corrupted or inaccessible storage -- fall back to no recents.
    }
  }, []);

  const addRecentStop = useCallback((busStopCode: string) => {
    setRecentCodes((prev) => {
      if (prev[0] === busStopCode) return prev;
      const next = [busStopCode, ...prev.filter((code) => code !== busStopCode)].slice(
        0,
        MAX_RECENTS
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentCodes, addRecentStop };
};
