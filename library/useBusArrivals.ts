'use client';

import { useCallback, useEffect, useState } from 'react';
import { LTABusArrival } from '../types/buses';
import { fetchBusData } from './busarrival';

const REFRESH_INTERVAL_MS = 15_000;

// Shared by BusArrival (renders the list) and Map (plots live bus positions
// from the same NextBus coordinates) so a selected stop is only polled once.
export const useBusArrivals = (busStopCode: string) => {
  const [arrivals, setArrivals] = useState<LTABusArrival[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const fetchArrivals = useCallback(async () => {
    if (!busStopCode) return;
    try {
      const data = await fetchBusData(busStopCode);
      setArrivals(data.filter((service) => service.NextBus?.EstimatedArrival));
      setHasError(false);
      setLastUpdatedAt(Date.now());
    } catch (error) {
      console.error('Failed to fetch bus arrival timings', error);
      setArrivals([]);
      setHasError(true);
    }
  }, [busStopCode]);

  useEffect(() => {
    if (!busStopCode) {
      // No stop selected -- synchronize the displayed state back to empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setArrivals([]);

      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const resetAndFetch = async () => {
      setIsLoading(true);
      await fetchArrivals();
      if (!cancelled) setIsLoading(false);
    };
    // Fetch-on-mount/dependency-change with a loading flag -- the standard
    // effect-based data-fetching pattern when there's no fetch library involved.
    resetAndFetch();

    return () => {
      cancelled = true;
    };
  }, [busStopCode, fetchArrivals]);

  useEffect(() => {
    if (!busStopCode) return;
    const refreshId = setInterval(() => fetchArrivals(), REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshId);
  }, [busStopCode, fetchArrivals]);

  return { arrivals, isLoading, hasError, lastUpdatedAt, refetch: fetchArrivals };
};
