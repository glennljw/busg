'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'busg:favorite-stops';

export const useFavoriteStops = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Deliberately deferred to an effect (not a lazy useState initializer):
    // reading localStorage during the initial render would make the client's
    // first pass diverge from the server-rendered (storage-less) HTML and
    // trigger a hydration mismatch. This trades one extra render for that.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // Corrupted or inaccessible storage -- fall back to no favorites.
    }
  }, []);

  const toggleFavorite = useCallback((busStopCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(busStopCode)
        ? prev.filter((code) => code !== busStopCode)
        : [...prev, busStopCode];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
};
