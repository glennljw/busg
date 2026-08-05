'use client';

import { BusRouteByDirection } from '../types/buses';

export const fetchBusRoute = async (serviceNo: string): Promise<BusRouteByDirection> => {
  const res = await fetch(`/api/bus/routes/${encodeURIComponent(serviceNo)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch bus route (${res.status})`);
  }
  return res.json();
};
