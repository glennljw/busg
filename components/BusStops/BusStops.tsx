'use client';

import styles from './BusStops.module.scss';
import { Button, IconButton, Text } from '@chakra-ui/react';
import { IoStar, IoStarOutline } from 'react-icons/io5';
import { useState } from 'react';
import { LTABusStops } from '../../types/buses';

const PAGE_SIZE = 40;

interface BusStopProps {
  busStops: LTABusStops[];
  handleBusStopNameClick: () => void;
  setCurrBusStopCode: (code: string) => void;
  favorites: string[];
  onToggleFavorite: (code: string) => void;
  getDistanceLabel?: (stop: LTABusStops) => string | null;
  emptyMessage?: string;
}

const BusStops = ({
  busStops,
  handleBusStopNameClick,
  setCurrBusStopCode,
  favorites,
  onToggleFavorite,
  getDistanceLabel,
  emptyMessage,
}: BusStopProps) => {
  // Callers remount this component (via a `key` tied to the query/tab) whenever
  // the list's identity changes, so this only ever needs to track its own paging.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (busStops.length === 0) {
    return emptyMessage ? <Text className={styles.empty_message}>{emptyMessage}</Text> : null;
  }

  const visibleStops = busStops.slice(0, visibleCount);

  return (
    <div className={styles.bus_stop_list}>
      {visibleStops.map((stop) => {
        const isFavorite = favorites.includes(stop.BusStopCode);
        const distanceLabel = getDistanceLabel?.(stop);

        return (
          <div className={styles.bus_stop_row} key={stop.BusStopCode}>
            <Button
              className={styles.bus_stop_button}
              variant="ghost"
              justifyContent="flex-start"
              onClick={() => {
                setCurrBusStopCode(stop.BusStopCode.toString());
                handleBusStopNameClick();
              }}
            >
              <span className={styles.bus_stop_row_text}>
                <Text as="span" className={styles.bus_stop_name}>
                  {stop.Description}
                </Text>
                <Text as="span" className={styles.bus_stop_meta}>
                  {stop.RoadName} &middot; {stop.BusStopCode}
                  {distanceLabel ? ` · ${distanceLabel}` : ''}
                </Text>
              </span>
            </Button>
            <IconButton
              className={styles.favorite_button}
              variant="ghost"
              size="sm"
              rounded="full"
              aria-label={isFavorite ? 'Remove from starred stops' : 'Add to starred stops'}
              onClick={() => onToggleFavorite(stop.BusStopCode)}
            >
              {isFavorite ? <IoStar color="#d97706" /> : <IoStarOutline />}
            </IconButton>
          </div>
        );
      })}
      {visibleCount < busStops.length && (
        <Button
          className={styles.show_more_button}
          variant="ghost"
          size="sm"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
        >
          Show more ({busStops.length - visibleCount} left)
        </Button>
      )}
    </div>
  );
};

export default BusStops;
