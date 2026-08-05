import { unstable_cache } from 'next/cache';
import { busRoutesEndpoint, busStopsRevalidateSeconds } from './constants';
import { BusRouteByDirection, LTABusRoute } from '../types/buses';

const RECORDS_PER_PAGE = 500;
// LTA doesn't support server-side ServiceNo filtering on this endpoint, so the
// whole dataset (~54 pages / ~27k rows today) has to be fetched and filtered
// here. Capped generously above the current page count as a safety net.
const MAX_PAGES = 100;
const PAGE_CONCURRENCY = 8;

const fetchRoutesPage = async (page: number, accountKey: string): Promise<LTABusRoute[]> => {
  const res = await fetch(`${busRoutesEndpoint}?$skip=${page * RECORDS_PER_PAGE}`, {
    headers: { AccountKey: accountKey },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`LTA DataMall responded with ${res.status} while fetching bus routes`);
  }

  const { value }: { value: LTABusRoute[] } = await res.json();
  return value;
};

const fetchAllBusRoutes = async (): Promise<LTABusRoute[]> => {
  const accountKey = process.env.LTA_API_KEY;
  if (!accountKey) {
    throw new Error('LTA_API_KEY is not configured on the server');
  }

  const allRows: LTABusRoute[] = [];

  for (let batchStart = 0; batchStart < MAX_PAGES; batchStart += PAGE_CONCURRENCY) {
    const pages = Array.from({ length: PAGE_CONCURRENCY }, (_, i) => batchStart + i).filter(
      (page) => page < MAX_PAGES
    );
    const results = await Promise.all(pages.map((page) => fetchRoutesPage(page, accountKey)));

    let reachedEnd = false;
    for (const rows of results) {
      allRows.push(...rows);
      if (rows.length < RECORDS_PER_PAGE) reachedEnd = true;
    }
    if (reachedEnd) break;
  }

  return allRows;
};

const fetchBusRouteForService = async (serviceNo: string): Promise<BusRouteByDirection> => {
  const allRoutes = await fetchAllBusRoutes();
  const byDirection: BusRouteByDirection = {};

  for (const row of allRoutes) {
    if (row.ServiceNo !== serviceNo) continue;
    if (!byDirection[row.Direction]) byDirection[row.Direction] = [];
    byDirection[row.Direction].push({
      busStopCode: row.BusStopCode,
      sequence: row.StopSequence,
      distanceKm: row.Distance,
    });
  }

  for (const direction of Object.keys(byDirection)) {
    byDirection[+direction].sort((a, b) => a.sequence - b.sequence);
  }

  return byDirection;
};

// The full dataset is ~7MB -- over Next's Data Cache 2MB-per-item ceiling, so
// caching it whole (as this used to) fails outright. Cache the small
// per-service result instead: unstable_cache folds call arguments into its
// key, so this is naturally keyed per serviceNo and each entry is a few KB.
export const getBusRouteForService = unstable_cache(fetchBusRouteForService, ['bus-route'], {
  revalidate: busStopsRevalidateSeconds,
});
