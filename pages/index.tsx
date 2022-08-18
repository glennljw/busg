import styles from '../styles/Home.module.scss';
import axios, { AxiosResponse } from 'axios';
import { busStopsEndpoint } from '../library/constants';
import { BusStopsEndpointDataType, LTABusStops } from '../types/buses';
import Homepage from '../components/Homepage/Homepage';
import Map from '../components/Map/Map';

export default function Home({ busStops }: { busStops: LTABusStops[] }) {
  return (
    <div>
      <Homepage busStops={busStops} />
      <Map busStops={busStops} />
    </div>
  );
}

export const getStaticProps = async () => {
  const res = await getBusStops();

  return {
    props: { busStops: res },
  };
};

const getBusStops = async () => {
  let count = 0;
  const maxRecords = 500;
  let isDone = false;
  let res: BusStopsEndpointDataType['value'] = [];
  try {
    while (!isDone) {
      const newRes: AxiosResponse = await axios.get(
        `${busStopsEndpoint}?$skip=${count * maxRecords}`,
        {
          headers: { AccountKey: process.env.NEXT_PUBLIC_LTA_API_KEY },
        }
      );

      res = res.concat(newRes.data.value);
      count++;
      if (newRes.data.value.length === 0) isDone = true;
    }

    return res;
  } catch (e) {
    console.log('error', e);
  }
};
