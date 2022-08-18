import mapboxgl from 'mapbox-gl';
import styles from './Map.module.scss';
import { useEffect, useRef, useState } from 'react';
import { BusPages, LTABusStops } from '../../types/buses';

interface MapProps {
  busStops: LTABusStops[];
  setCurrBusStopCode: (code: string) => void;
  setCurrPage: (page: BusPages) => void;
  onBusStopClick: () => void;
}

const Map = ({ busStops, setCurrBusStopCode, setCurrPage, onBusStopClick }: MapProps) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY ?? '';
  const mapContainer = useRef<any>(null);
  const mapRef = useRef<mapboxgl.Map | any>(null);
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
    let map: mapboxgl = mapRef.current;
    if (map) return;

    if (currLocation) {
      map = new mapboxgl.Map(
        {
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/outdoors-v11',
          center: [currLocation?.longitude ?? 0, currLocation?.latitude ?? 0], // center map on user
          zoom: 18,
        },
        []
      );

      // add user header
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );

      // add full screen control
      map.addControl(new mapboxgl.FullscreenControl());

      const sourceFeatures = busStops.map((stop) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [+stop.Longitude, +stop.Latitude],
          },
          properties: {
            title: `${stop.Description}, ${stop.RoadName}`,
            stopNo: `${stop.BusStopCode}`,
          },
        };
      });

      map.on('load', () => {
        // Load an image from an external URL.
        map.loadImage('/images/bus-stop-icon.png', (error, image) => {
          if (error) throw error;

          // Add the image to the map style.
          map.addImage('bus_stop', image);

          map.addSource('points', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: sourceFeatures,
            },
          });

          map.addLayer({
            id: 'points',
            type: 'symbol',
            source: 'points', // reference the data source
            layout: {
              'icon-image': 'bus_stop',
              'icon-size': 0.05,
            },
          });
        });
      });

      map.on('click', (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['points'], // replace with your layer name
        });

        if (!features.length) {
          return;
        }

        const feature = features[0];

        const popups = document.getElementsByClassName('mapboxgl-popup');
        if (popups[0]) popups[0].remove();

        const popup = new mapboxgl.Popup({
          className: 'mapbox_popup_title',
          offset: [0, -15],
          closeButton: false,
        })
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`<h3>${feature.properties.title}</h3><p>${feature.properties.stopNo}</p>`)
          .addTo(map);

        map.flyTo({ center: feature.geometry.coordinates, zoom: 18 });

        setCurrBusStopCode(feature.properties.stopNo);
        setCurrPage('arrival');
        onBusStopClick();
      });

      map.on('mouseenter', 'points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'points', () => {
        map.getCanvas().style.cursor = '';
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
