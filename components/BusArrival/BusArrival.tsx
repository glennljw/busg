import styles from './BusArrival.module.scss';
import { BusArrivalEndpointDataType, BusServiceNoAndArrival, LTABusStops } from '../../types/buses';
import { Grid, GridItem, IconButton, Input, Text } from '@chakra-ui/react';
import { IoMdRefreshCircle } from 'react-icons/io';
import { useEffect, useState } from 'react';
import { fetchBusData, parseTime } from '../../library/busarrival';

interface BusArrivalProps {
  busStops: LTABusStops[];
  busStopCode: string;
}

const BusArrival = ({ busStops, busStopCode }: BusArrivalProps) => {
  const [busStopDesc, setBusStopDesc] = useState<string>('');
  const [serviceNo, setServiceNo] = useState<string>('');
  const [arrivalTimings, setArrivalTimings] = useState<BusServiceNoAndArrival[]>([]);
  const [isLoadingTiming, setIsLoadingTiming] = useState<boolean>(true);

  useEffect(() => {
    const filteredBusStop: LTABusStops[] = busStops.filter((busStop) => {
      return busStop.BusStopCode === busStopCode;
    });
    const desc = filteredBusStop[0]?.Description ?? '';
    setBusStopDesc(desc);
  }, [busStopCode]);

  useEffect(() => {
    const resetAndFetch = async () => {
      let promiseSetIsLoading = new Promise((resolve, reject) => {
        // setTimeout(() => {
        setIsLoadingTiming(true);
        // }, 5000);
      });
      await promiseSetIsLoading
        .then((res) => {
          fetchTimings();
        })
        .catch((e) => {
          console.log(e);
        });
    };
    resetAndFetch();
  }, [busStopCode, serviceNo]);

  const fetchTimings = async () => {
    await fetchBusData(busStopCode, serviceNo)
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
        setIsLoadingTiming(false);
      });
  };

  const renderTimings = () => {
    return busStopCode === '' ? (
      <div></div>
    ) : (
      <div className={styles.body}>
        <Grid gap={2} templateColumns="repeat(1, 1fr)">
          <Grid templateColumns="repeat(7, 1fr)">
            <GridItem className={styles.header_container} colSpan={5}>
              <Text className={styles.header_title}>Bus No.</Text>
            </GridItem>
            <GridItem className={styles.header_container} colSpan={2}>
              <Text className={styles.header_title}>Arrival</Text>
            </GridItem>
          </Grid>
          <Grid templateColumns="repeat(7,1fr)">
            <GridItem className={styles.refresh_button} colStart={7} colSpan={1}>
              <IconButton
                variant="outline"
                size="xs"
                colorScheme="black"
                aria-label="Refresh bus timings"
                fontSize="20px"
                icon={<IoMdRefreshCircle />}
                onClick={() => {
                  console.log('Refresh');
                  fetchTimings();
                }}
              />
            </GridItem>
          </Grid>
        </Grid>
        {arrivalTimings.length === 0 && !isLoadingTiming ? (
          <Text fontSize="4xl">No buses available</Text>
        ) : arrivalTimings.length === 0 && isLoadingTiming ? (
          <Text fontSize="4xl">No buses available</Text>
        ) : (
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
        )}
      </div>
    );
  };

  return (
    <div className={styles.main}>
      <Text className={styles.bus_stop_desc} fontSize="3xl">
        {busStopDesc}
      </Text>
      {renderTimings()}
    </div>
  );
};

export default BusArrival;
