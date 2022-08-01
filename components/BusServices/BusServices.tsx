import axios from 'axios';
import styles from './BusServices.module.scss';
import { BusArrivalEndpointDataType, BusServiceNoAndArrival } from '../../types/buses';
import { Grid, GridItem, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const BusServices = () => {
  const [busStopCode, setBusStopCode] = useState<string>('');
  const [serviceNo, setServiceNo] = useState<string>('');
  const [isInvalidCode, setIsInvalidCode] = useState<boolean>(false);
  const [arrivalTimings, setArrivalTimings] = useState<BusServiceNoAndArrival[]>([]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target.value.length === 5) {
        setIsInvalidCode(false);
        setBusStopCode(e.target.value);
      } else {
        setBusStopCode('');
        setIsInvalidCode(true);
      }
    }
  };

  const fetchBusData = async () => {
    const serviceInfo = await axios.get(`/api/busservices/${busStopCode}/${serviceNo}`);
    return serviceInfo;
  };

  const parseTime = (time: string) => {
    let currentTime = new Date();
    let arrivalTime = new Date(Date.parse(time));
    const timeDifferenceInMs = arrivalTime.getTime() - currentTime.getTime();
    const timeDifferenceInMins = timeDifferenceInMs / 1000 / 60;
    const estArrivalTimeInMins = Math.floor(timeDifferenceInMins);
    return estArrivalTimeInMins;
  };

  useEffect(() => {
    fetchBusData().then((res) => {
      const busServices: BusArrivalEndpointDataType['Services'] = res.data;

      if (busServices?.[0]?.NextBus) {
        const busServiceTimings = busServices.map((data) => {
          return {
            ServiceNo: data.ServiceNo,
            ArrivalTimeInMins: parseTime(data.NextBus.EstimatedArrival),
          };
        });

        busServiceTimings.sort((a, b) => {
          return +a.ServiceNo - +b.ServiceNo;
        });
        setArrivalTimings(busServiceTimings);
      } else {
        setArrivalTimings([]);
      }
    });
  }, [busStopCode, serviceNo, fetchBusData]);

  return (
    <div className={styles.main}>
      <Input
        className={styles.input_bus_stop_code}
        isInvalid={isInvalidCode}
        errorBorderColor="red.500"
        focusBorderColor={isInvalidCode ? 'red.500' : 'blue.500'}
        placeholder={
          isInvalidCode ? 'Invalid bus stop number. Try again.' : 'Please enter a bus stop number'
        }
        size="xs"
        onKeyDown={handleKeyDown}
      />
      <Grid gap={4} templateColumns="repeat(1, 1fr)">
        <Grid templateColumns="repeat(7, 1fr)">
          <GridItem colSpan={5}>Bus No.</GridItem>
          <GridItem colSpan={2}>Arrival</GridItem>
        </Grid>
        {arrivalTimings.map((timing) => {
          return (
            <Grid templateColumns="repeat(7, 1fr)">
              <GridItem key={timing.ServiceNo} className={styles.bus_no} colSpan={5}>
                {timing.ServiceNo}
              </GridItem>
              <GridItem key={timing.ServiceNo} className={styles.arr_time} colSpan={2}>
                {timing.ArrivalTimeInMins < 0 ? 'Left' : timing.ArrivalTimeInMins + ' Mins'}
              </GridItem>
            </Grid>
          );
        })}
      </Grid>
      {/* <p>{JSON.stringify(arrivalTimings)}</p> */}
    </div>
  );
};

export default BusServices;
