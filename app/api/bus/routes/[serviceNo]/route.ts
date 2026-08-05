import { NextResponse } from 'next/server';
import { getBusRouteForService } from '../../../../../library/busroutes';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ serviceNo: string }> }
) {
  const { serviceNo } = await params;

  if (!serviceNo) {
    return NextResponse.json({ error: 'Missing service number' }, { status: 400 });
  }

  try {
    const route = await getBusRouteForService(serviceNo);
    return NextResponse.json(route);
  } catch (error) {
    console.error('Failed to fetch bus route', error);
    return NextResponse.json({ error: 'Failed to fetch bus route' }, { status: 502 });
  }
}
