import { busStopsEndpoint, busStopsRevalidateSeconds } from './constants';
import { BusStopsEndpointDataType, LTABusStops } from '../types/buses';

const RECORDS_PER_PAGE = 500;
// LTA DataMall paginates in fixed pages of 500; Singapore has ~5,300 bus stops today.
// Capped generously so a misbehaving API can't loop forever.
const MAX_PAGES = 40;

export const getBusStops = async (): Promise<LTABusStops[]> => {
  const accountKey = process.env.LTA_API_KEY;
  if (!accountKey) {
    throw new Error('LTA_API_KEY is not configured on the server');
  }

  const stops: LTABusStops[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await fetch(`${busStopsEndpoint}?$skip=${page * RECORDS_PER_PAGE}`, {
      headers: { AccountKey: accountKey },
      next: { revalidate: busStopsRevalidateSeconds },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`LTA DataMall responded with ${res.status} while fetching bus stops`);
    }

    const { value }: BusStopsEndpointDataType = await res.json();
    stops.push(...value);

    if (value.length < RECORDS_PER_PAGE) break;
  }

  return stops;
};
