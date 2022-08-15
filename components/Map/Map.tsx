import mapboxgl from 'mapbox-gl';
import styles from './Map.module.scss';
import { useEffect, useRef } from 'react';

const Map = () => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY ?? '';
  const mapContainer = useRef<any>(null);
  const map = useRef<mapboxgl.Map | any>(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map(
      {
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [15.4542, 18.7322], // center map on Chad
        zoom: 1.8,
      },
      []
    );
  }, []);
  return (
    <div>
      <div className={styles.map_container} ref={mapContainer} />
    </div>
  );
};

export default Map;
