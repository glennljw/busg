import styles from '../styles/Home.module.scss';
import BusServices from '../components/BusServices/BusServices';
import axios, { AxiosResponse } from 'axios';
import { busStopsEndpoint } from '../library/constants';
import { BusStopsEndpointDataType } from '../types/buses';

export default function Home({ busStops }) {
  return <BusServices busStops={busStops} />;
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
