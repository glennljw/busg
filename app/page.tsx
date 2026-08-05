import Homepage from '../components/Homepage/Homepage';
import { getBusStops } from '../library/busstops';
import { LTABusStops } from '../types/buses';

export default async function Home() {
  let busStops: LTABusStops[] = [];

  try {
    busStops = await getBusStops();
  } catch (error) {
    console.error('Failed to load bus stops', error);
  }

  return <Homepage busStops={busStops} />;
}
