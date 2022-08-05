import axios from 'axios';
import styles from './BusServices.module.scss';
import { BusArrivalEndpointDataType, BusServiceNoAndArrival } from '../../types/buses';
import { Grid, GridItem, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import BusStops from './BusStops';

const BusServices = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
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
    fetchBusData()
      .then((res) => {
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
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [busStopCode, serviceNo]);

  return (
    <div className={styles.main}>
      <Input
        className={styles.input_bus_stop_code}
        isInvalid={isInvalidCode}
        errorBorderColor="red.500"
        focusBorderColor={isInvalidCode ? 'red.500' : 'blue.500'}
        placeholder={isInvalidCode ? 'Invalid bus stop number' : 'Please enter a bus stop number'}
        size="m"
        onKeyDown={handleKeyDown}
      />
      <BusStops busStopCode={busStopCode} isParentLoaded={isLoaded} />
      <Grid gap={4} templateColumns="repeat(1, 1fr)">
        <Grid templateColumns="repeat(7, 1fr)">
          <GridItem className={styles.header_container} colSpan={5}>
            <Text className={styles.header_title}>Bus No.</Text>
          </GridItem>
          <GridItem className={styles.header_container} colSpan={2}>
            <Text className={styles.header_title}>Arrival</Text>
          </GridItem>
        </Grid>
        {isLoaded ? (
          arrivalTimings.map((timing) => {
            return (
              <Grid key={timing.ServiceNo} templateColumns="repeat(7, 1fr)">
                <GridItem className={styles.bus_no_container} colSpan={5}>
                  <Text className={styles.bus_no}>{timing.ServiceNo}</Text>
                </GridItem>
                <GridItem className={styles.arr_time_container} colSpan={2}>
                  <Text className={styles.arr_time}>
                    {timing.ArrivalTimeInMins < 0
                      ? 'Left'
                      : timing.ArrivalTimeInMins === 0
                      ? 'Arr'
                      : timing.ArrivalTimeInMins}
                  </Text>
                </GridItem>
              </Grid>
            );
          })
        ) : (
          <Text fontSize="6xl"> Loading bus timings...</Text>
        )}
      </Grid>
    </div>
  );
};

export default BusServices;
