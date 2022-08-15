import styles from './BusStops.module.scss';
import { Button } from '@chakra-ui/react';
import { LTABusStops } from '../../types/buses';

interface BusStopProps {
  busStops: LTABusStops[];
  handleBusStopNameClick: () => void;
  setCurrBusStopCode: (code: string) => void;
}

const BusStops = ({ busStops, handleBusStopNameClick, setCurrBusStopCode }: BusStopProps) => {
  return (
    <div>
      {busStops.map((stop) => (
        <Button
          className={styles.bus_stop_names}
          key={stop.BusStopCode}
          colorScheme="gray"
          variant="solid"
          onClick={() => {
            setCurrBusStopCode(stop.BusStopCode.toString());
            handleBusStopNameClick();
          }}
        >
          {`${stop.Description}, ${stop.RoadName}, ${stop.BusStopCode}`}
        </Button>
      ))}
    </div>
  );
};

export default BusStops;
