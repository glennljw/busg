'use client';

import styles from './BusArrival.module.scss';
import { BusLoad, LTABusArrival, LTABusStops } from '../../types/buses';
import { Grid, GridItem, IconButton, Text } from '@chakra-ui/react';
import {
  IoCheckmark,
  IoRefresh,
  IoShareOutline,
  IoStar,
  IoStarOutline,
  IoWalk,
} from 'react-icons/io5';
import { MdAccessible } from 'react-icons/md';
import { useEffect, useMemo, useState } from 'react';
import { compareServiceNo, parseTime } from '../../library/busarrival';

interface BusArrivalProps {
  busStops: LTABusStops[];
  busStopCode: string;
  arrivals: LTABusArrival[];
  isLoading: boolean;
  hasError: boolean;
  lastUpdatedAt: number | null;
  onRefresh: () => void;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  onViewRoute: (serviceNo: string) => void;
  onWalkHere: () => void;
  isRouteLoading: boolean;
}

const urgencyClass = (mins: number) => {
  if (mins < 0) return styles.urgency_left;
  if (mins === 0) return styles.urgency_arrived;
  if (mins <= 5) return styles.urgency_soon;
  return styles.urgency_later;
};

const crowdLabel: Record<BusLoad, string> = {
  SEA: 'Seats available',
  SDA: 'Standing available',
  LSD: 'Limited standing',
  '': '',
};

const crowdClass: Record<BusLoad, string> = {
  SEA: styles.crowd_low,
  SDA: styles.crowd_mid,
  LSD: styles.crowd_high,
  '': '',
};

const BusArrival = ({
  busStops,
  busStopCode,
  arrivals,
  isLoading,
  hasError,
  lastUpdatedAt,
  onRefresh,
  favorites,
  onToggleFavorite,
  onViewRoute,
  onWalkHere,
  isRouteLoading,
}: BusArrivalProps) => {
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [justShared, setJustShared] = useState(false);

  const busStopDesc = busStops.find((stop) => stop.BusStopCode === busStopCode)?.Description ?? '';
  const isFavorite = favorites.includes(busStopCode);

  const arrivalTimings = useMemo(() => {
    return arrivals
      .map((service) => ({
        ServiceNo: service.ServiceNo,
        ArrivalTimeInMins: parseTime(service.NextBus.EstimatedArrival),
        Load: service.NextBus.Load,
        Feature: service.NextBus.Feature,
      }))
      .sort((a, b) => compareServiceNo(a.ServiceNo, b.ServiceNo));
  }, [arrivals]);

  useEffect(() => {
    const tickId = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, []);

  const elapsedSeconds = lastUpdatedAt
    ? Math.max(0, Math.floor((nowTick - lastUpdatedAt) / 1000))
    : null;

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}?stop=${busStopCode}`;
    const shareData = { title: busStopDesc || 'Busg bus stop', url };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      setJustShared(true);
      setTimeout(() => setJustShared(false), 2000);
    } catch (error) {
      // AbortError happens when the user just dismisses the native share sheet.
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Failed to share stop link', error);
      }
    }
  };

  const renderTimings = () => {
    if (busStopCode === '') return null;

    return (
      <div className={styles.body}>
        <Grid gap={2} templateColumns="repeat(1, 1fr)">
          <Grid templateColumns="repeat(7, 1fr)" alignItems="center">
            <GridItem className={styles.header_container} colSpan={5}>
              <Text className={styles.header_title}>Service No.</Text>
            </GridItem>
            <GridItem className={styles.header_container} colSpan={1}>
              <Text className={styles.header_title}>Next Bus</Text>
            </GridItem>
            <GridItem className={styles.refresh_button_container} colSpan={1}>
              <IconButton
                variant="ghost"
                size="xs"
                rounded="full"
                aria-label="Refresh bus timings"
                onClick={onRefresh}
              >
                <IoRefresh />
              </IconButton>
            </GridItem>
          </Grid>
        </Grid>
        {elapsedSeconds !== null && !hasError && (
          <Text className={styles.updated_text}>
            {elapsedSeconds < 5 ? 'Updated just now' : `Updated ${elapsedSeconds}s ago`}
          </Text>
        )}
        {hasError ? (
          <Text className={styles.status_text}>
            Couldn&apos;t load arrival timings. Try refreshing.
          </Text>
        ) : arrivalTimings.length === 0 && !isLoading ? (
          <Text className={styles.status_text}>No buses available</Text>
        ) : arrivalTimings.length === 0 && isLoading ? (
          <Text className={styles.status_text}>Loading&hellip;</Text>
        ) : (
          arrivalTimings.map((timing) => (
            <Grid key={timing.ServiceNo} templateColumns="repeat(7, 1fr)" alignItems="center">
              <GridItem colSpan={5}>
                <button
                  type="button"
                  className={styles.bus_no_container}
                  onClick={() => onViewRoute(timing.ServiceNo)}
                  disabled={isRouteLoading}
                  aria-label={`Show route for service ${timing.ServiceNo} on the map`}
                >
                  <Text className={styles.bus_no}>{timing.ServiceNo}</Text>
                  {timing.Load && (
                    <span
                      className={`${styles.crowd_dot} ${crowdClass[timing.Load]}`}
                      title={crowdLabel[timing.Load]}
                    />
                  )}
                  {timing.Feature === 'WAB' && (
                    <MdAccessible
                      className={styles.accessible_icon}
                      title="Wheelchair accessible"
                    />
                  )}
                </button>
              </GridItem>
              <GridItem className={styles.arr_time_container} colSpan={2}>
                <Text className={`${styles.arr_time} ${urgencyClass(timing.ArrivalTimeInMins)}`}>
                  {timing.ArrivalTimeInMins < 0
                    ? 'Left'
                    : timing.ArrivalTimeInMins === 0
                      ? 'Arr'
                      : `${timing.ArrivalTimeInMins} min`}
                </Text>
              </GridItem>
            </Grid>
          ))
        )}
      </div>
    );
  };

  return (
    <div className={styles.main}>
      <div className={styles.title_row}>
        <Text className={styles.bus_stop_desc}>{busStopDesc}</Text>
        <div className={styles.title_actions}>
          <IconButton
            variant="ghost"
            size="sm"
            rounded="full"
            aria-label="Walking directions to this stop"
            onClick={onWalkHere}
          >
            <IoWalk />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            rounded="full"
            aria-label={justShared ? 'Link copied' : 'Share this stop'}
            onClick={handleShare}
          >
            {justShared ? <IoCheckmark /> : <IoShareOutline />}
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            rounded="full"
            aria-label={isFavorite ? 'Remove from starred stops' : 'Add to starred stops'}
            onClick={() => onToggleFavorite(busStopCode)}
          >
            {isFavorite ? <IoStar color="#d97706" /> : <IoStarOutline />}
          </IconButton>
        </div>
      </div>
      {renderTimings()}
    </div>
  );
};

export default BusArrival;
