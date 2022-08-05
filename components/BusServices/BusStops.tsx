import axios from 'axios';
import styles from './BusStops.module.scss';
import { Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LTABusStops } from '../../types/buses';

interface BusStopsProps {
  busStopCode: string;
  isParentLoaded: boolean;
}

const BusStops = ({ busStopCode, isParentLoaded }: BusStopsProps) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [busStopArr, setBusStopArr] = useState([]);
  const [busStopDesc, setBusStopDesc] = useState<string>('');

  const fetchBusStopDesc = async () => {
    const res = await axios.get('/api/busstops');
    const busStopsData: LTABusStops[] = res.data;
    return busStopsData;
  };

  useEffect(() => {
    if (isLoaded) {
      const filteredBusStop: LTABusStops[] = busStopArr.filter((busStop) => {
        return busStop.BusStopCode === busStopCode;
      });
      const desc = filteredBusStop[0]?.Description ?? '';
      setBusStopDesc(desc);
    }
  }, [busStopCode, isLoaded]);

  useEffect(() => {
    fetchBusStopDesc()
      .then((res) => {
        setBusStopArr(res);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  return (
    <div>
      <Text className={styles.bus_stop_desc} fontSize="3xl">
        {!isParentLoaded || !isLoaded ? 'Loading...' : busStopDesc}
      </Text>
    </div>
  );
};

export default BusStops;
