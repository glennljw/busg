import mapboxgl from 'mapbox-gl';
import styles from './Map.module.scss';
import { useEffect, useRef, useState } from 'react';
import { LTABusStops } from '../../types/buses';

interface MapProps {
  busStops: LTABusStops[];
}

const Map = ({ busStops }: MapProps) => {
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
          zoom: 18,
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

      const sourceFeatures = busStops.map((stop) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [+stop.Longitude, +stop.Latitude],
          },
          properties: { title: `${stop.Description}, ${stop.RoadName}` },
        };
      });

      map.current.on('load', () => {
        // Load an image from an external URL.
        map.current.loadImage('/images/bus-stop-icon.png', (error, image) => {
          if (error) throw error;

          // Add the image to the map style.
          map.current.addImage('bus_stop', image);

          map.current.addSource('points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: sourceFeatures,
            },
          });

          map.current.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points', // reference the data source
            layout: {
              'icon-image': 'bus_stop',
              'icon-size': 0.05,
              'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            },
          });
        });
      });
    }
  }, [currLocation]);

  return (
    <div>
      <div className={styles.map_container} ref={mapContainer} />{' '}
    </div>
  );
};

export default Map;
