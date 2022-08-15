import styles from './BusStops.module.scss';
import { Button, Input } from '@chakra-ui/react';
import { useState } from 'react';
import { LTABusStops } from '../../types/buses';
import BusArrival from '../BusArrival/BusArrival';

interface BusStopProps {
  busStops: LTABusStops[];
  handleBusStopNameClick: () => void;
  setCurrBusStopCode: (code: string) => void;
}

const BusStops = ({ busStops, handleBusStopNameClick, setCurrBusStopCode }: BusStopProps) => {
  const sortedBusStops = [...busStops]
    .sort((a, b) => a.Description.localeCompare(b.Description))
    .map((stop) => ({ ...stop, Description: stop.Description.toLocaleUpperCase() }));

  const [searchedBusStops, setSearchedBusStops] = useState<LTABusStops[]>([]);

  const handleSearch = (searchQuery: string) => {
    const newlySearchedBusStops = sortedBusStops.filter((stop) => {
      if (searchQuery === '') {
        return false;
      }
      return stop.Description.concat(`, ${stop.RoadName}`.toLocaleUpperCase()).includes(
        searchQuery.toLocaleUpperCase()
      );
    });
    return newlySearchedBusStops;
  };

  return (
    <div>
      <Input
        placeholder="Please enter a bus stop name"
        onChange={(e) => {
          setSearchedBusStops(handleSearch(e.target.value));
        }}
      />
      {searchedBusStops.map((stop) => (
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
