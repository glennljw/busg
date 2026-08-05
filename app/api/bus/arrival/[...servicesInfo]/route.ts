import { NextResponse } from 'next/server';
import { busArrivalEndpoint } from '../../../../../library/constants';
import { BusArrivalEndpointDataType } from '../../../../../types/buses';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ servicesInfo: string[] }> }
) {
  const { servicesInfo } = await params;
  const [busStopCode, serviceNo] = servicesInfo ?? [];

  if (!busStopCode) {
    return NextResponse.json({ error: 'Missing bus stop code' }, { status: 400 });
  }

  const accountKey = process.env.LTA_API_KEY;
  if (!accountKey) {
    console.error('LTA_API_KEY is not configured on the server');
    return NextResponse.json({ error: 'Server is misconfigured' }, { status: 500 });
  }

  const query = new URLSearchParams({
    BusStopCode: busStopCode,
    ...(serviceNo ? { ServiceNo: serviceNo } : {}),
  });

  try {
    const upstream = await fetch(`${busArrivalEndpoint}?${query.toString()}`, {
      headers: { AccountKey: accountKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `LTA DataMall responded with ${upstream.status}` },
        { status: 502 }
      );
    }

    const data: BusArrivalEndpointDataType = await upstream.json();
    return NextResponse.json(data.Services ?? []);
  } catch (error) {
    console.error('Failed to fetch bus arrival timings', error);
    return NextResponse.json({ error: 'Failed to fetch bus arrival timings' }, { status: 502 });
  }
}
