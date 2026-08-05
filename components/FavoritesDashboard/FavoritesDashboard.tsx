'use client';

import { useEffect, useState } from 'react';
import styles from './FavoritesDashboard.module.scss';
import { LTABusStops } from '../../types/buses';
import { compareServiceNo, fetchBusData, parseTime } from '../../library/busarrival';
import { IconButton, Text } from '@chakra-ui/react';
import { IoStar } from 'react-icons/io5';

const REFRESH_INTERVAL_MS = 30_000;
const MAX_SERVICES_SHOWN = 3;

interface ServicePreview {
  serviceNo: string;
  mins: number;
}

interface StopPreview {
  services: ServicePreview[];
  hasError: boolean;
}

interface FavoritesDashboardProps {
  favoriteStops: LTABusStops[];
  onSelectStop: (code: string) => void;
  onToggleFavorite: (code: string) => void;
}

const formatMins = (mins: number) => (mins < 0 ? 'Left' : mins === 0 ? 'Arr' : `${mins}m`);

const FavoritesDashboard = ({
  favoriteStops,
  onSelectStop,
  onToggleFavorite,
}: FavoritesDashboardProps) => {
  const [previews, setPreviews] = useState<Record<string, StopPreview>>({});
  const stopCodesKey = favoriteStops.map((stop) => stop.BusStopCode).join(',');

  useEffect(() => {
    if (!stopCodesKey) {
      // No favorites -- synchronize the displayed state back to empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviews({});
      return;
    }

    let cancelled = false;
    const codes = stopCodesKey.split(',');

    const loadAll = async () => {
      const results = await Promise.all(
        codes.map(async (code): Promise<[string, StopPreview]> => {
          try {
            const data = await fetchBusData(code);
            const services = data
              .filter((service) => service.NextBus?.EstimatedArrival)
              .map((service) => ({
                serviceNo: service.ServiceNo,
                mins: parseTime(service.NextBus.EstimatedArrival),
              }))
              .sort((a, b) => compareServiceNo(a.serviceNo, b.serviceNo))
              .slice(0, MAX_SERVICES_SHOWN);
            return [code, { services, hasError: false }];
          } catch (error) {
            console.error('Failed to fetch favorite stop arrivals', error);
            return [code, { services: [], hasError: true }];
          }
        })
      );

      if (cancelled) return;
      // Fetch-on-mount/interval with results applied once settled -- the
      // standard effect-based data-fetching pattern used across this app.

      setPreviews(Object.fromEntries(results));
    };

    loadAll();
    const intervalId = setInterval(loadAll, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [stopCodesKey]);

  if (favoriteStops.length === 0) {
    return <Text className={styles.empty_message}>Tap the star on a stop to save it here</Text>;
  }

  return (
    <div className={styles.dashboard}>
      {favoriteStops.map((stop) => {
        const preview = previews[stop.BusStopCode];

        return (
          <div
            key={stop.BusStopCode}
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStop(stop.BusStopCode)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectStop(stop.BusStopCode);
            }}
          >
            <div className={styles.card_header}>
              <Text className={styles.card_title}>{stop.Description}</Text>
              <IconButton
                variant="ghost"
                size="xs"
                rounded="full"
                aria-label="Remove from starred stops"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(stop.BusStopCode);
                }}
              >
                <IoStar color="#d97706" />
              </IconButton>
            </div>
            <div className={styles.card_services}>
              {!preview ? (
                <Text className={styles.card_status}>Loading&hellip;</Text>
              ) : preview.hasError ? (
                <Text className={styles.card_status}>Couldn&apos;t load</Text>
              ) : preview.services.length === 0 ? (
                <Text className={styles.card_status}>No buses available</Text>
              ) : (
                preview.services.map((service) => (
                  <span key={service.serviceNo} className={styles.chip}>
                    {service.serviceNo} &middot; {formatMins(service.mins)}
                  </span>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FavoritesDashboard;
