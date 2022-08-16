import mapboxgl from 'mapbox-gl';
import styles from './Map.module.scss';
import { useEffect, useRef, useState } from 'react';

const Map = () => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY ?? '';
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);
  const [currLocation, setCurrLocation] = useState<GeolocationCoordinates>(null);

  useEffect(() => {
    const userLocation: Geolocation = navigator.geolocation;
    if (userLocation) {
      userLocation.getCurrentPosition((pos: GeolocationPosition) => {
        const loc: GeolocationCoordinates = pos.coords;
        setCurrLocation(loc);
      });
    }
  }, []);

  useEffect(() => {
    if (map.current) return;

    if (currLocation) {
      map.current = new mapboxgl.Map(
        {
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v10',
          center: [currLocation?.longitude ?? 0, currLocation?.latitude ?? 0], // center map on user
          zoom: 15,
        },
        []
      );

      // add user header
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );

      // add full screen control
      map.current.addControl(new mapboxgl.FullscreenControl());
    }
  }, [currLocation]);

  return (
    <div>
      <div className={styles.map_container} ref={mapContainer} />{' '}
    </div>
  );
};

export default Map;
