'use client';

import styles from './RoutePanel.module.scss';
import { IconButton, Text } from '@chakra-ui/react';
import { IoClose, IoRepeat } from 'react-icons/io5';
import { RouteStopDetail } from '../../types/buses';

interface RoutePanelProps {
  serviceNo: string;
  stops: RouteStopDetail[];
  isLoop: boolean;
  onReverse: () => void;
  onClose: () => void;
  onSelectStop: (code: string) => void;
}

const RoutePanel = ({
  serviceNo,
  stops,
  isLoop,
  onReverse,
  onClose,
  onSelectStop,
}: RoutePanelProps) => {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Text className={styles.title}>Service {serviceNo}</Text>
        {isLoop ? (
          <span className={styles.loop_badge}>Loop service</span>
        ) : (
          <IconButton
            variant="ghost"
            size="sm"
            rounded="full"
            aria-label="Reverse route direction"
            onClick={onReverse}
          >
            <IoRepeat />
          </IconButton>
        )}
        <IconButton
          variant="ghost"
          size="sm"
          rounded="full"
          aria-label="Close route"
          onClick={onClose}
        >
          <IoClose />
        </IconButton>
      </div>
      <div className={styles.stop_list}>
        {stops.map((stop, index) => (
          <button
            type="button"
            key={`${stop.busStopCode}-${stop.sequence}`}
            className={styles.stop_row}
            onClick={() => onSelectStop(stop.busStopCode)}
          >
            <span className={styles.stop_info}>
              {index === 0 && <span className={styles.endpoint_tag}>Start</span>}
              {index === stops.length - 1 && <span className={styles.endpoint_tag}>End</span>}
              <Text className={styles.stop_name}>{stop.description}</Text>
              <Text className={styles.stop_meta}>
                {stop.roadName} &middot; {stop.distanceKm.toFixed(1)} km
              </Text>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoutePanel;
