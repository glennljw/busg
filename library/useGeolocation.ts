'use client';

import { useEffect, useState } from 'react';
import { Coordinates } from '../types/buses';
import { defaultMapCenter } from './constants';

export const useGeolocation = (): Coordinates | null => {
  const [location, setLocation] = useState<Coordinates | null>(() =>
    typeof navigator !== 'undefined' && !navigator.geolocation ? defaultMapCenter : null
  );

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      () => {
        // Permission denied or unavailable -- fall back so the app still works.
        setLocation(defaultMapCenter);
      },
      { timeout: 8000 }
    );
  }, []);

  return location;
};
