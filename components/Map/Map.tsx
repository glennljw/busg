'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './Map.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { BusPages, Coordinates, LTABusArrival, LTABusStops } from '../../types/buses';
import { busStopMarkerDataUri } from '../../library/mapMarker';
import { busStopMinZoom, mapMinZoom, singaporeBounds } from '../../library/constants';
import { parseTime } from '../../library/busarrival';

interface SelectedRoute {
  serviceNo: string;
  coordinates: [number, number][];
}

interface MapProps {
  busStops: LTABusStops[];
  location: Coordinates | null;
  setCurrBusStopCode: (code: string) => void;
  setCurrPage: (page: BusPages) => void;
  onBusStopClick: () => void;
  liveArrivals: LTABusArrival[];
  route: SelectedRoute | null;
  walkingTarget: [number, number] | null;
  onClearWalking: () => void;
}

const EMPTY_FEATURE_COLLECTION: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const stopToFeature = (stop: LTABusStops) => ({
  type: 'Feature' as const,
  geometry: {
    type: 'Point' as const,
    coordinates: [+stop.Longitude, +stop.Latitude],
  },
  properties: {
    title: `${stop.Description}, ${stop.RoadName}`,
    stopNo: `${stop.BusStopCode}`,
  },
});

// Rough proxy for "this device likely has a compass": touch-capable devices
// with the orientation API are almost always phones/tablets with a
// magnetometer, whereas laptops/desktops technically expose the API but never
// report a real heading.
const supportsDeviceHeading = () =>
  typeof window !== 'undefined' && 'ontouchstart' in window && 'DeviceOrientationEvent' in window;

const createUserLocationMarkerElement = () => {
  const el = document.createElement('div');
  el.className = styles.user_location_dot;
  return el;
};

const lightPresetFor = (resolvedTheme: string | undefined) =>
  resolvedTheme === 'dark' ? 'night' : 'day';

// Mapbox Standard's 'night' light preset applies atmospheric dimming to
// everything in the scene, including our own layers -- so custom colors need
// a brighter dark-mode variant to actually read the same as they do in 'day'.
const routeColorFor = (resolvedTheme: string | undefined) =>
  resolvedTheme === 'dark' ? '#fbbf24' : '#d97706';

const liveBusColorFor = (resolvedTheme: string | undefined) =>
  resolvedTheme === 'dark' ? '#22c55e' : '#16a34a';

// Runs `fn` once the style (and any sources/layers added on load) are ready,
// whether that's already true or still pending.
const whenStyleReady = (map: mapboxgl.Map, fn: () => void) => {
  if (map.isStyleLoaded()) fn();
  else map.once('style.load', fn);
};

const boundsFromCoordinates = (coordinates: [number, number][]) =>
  coordinates.reduce(
    (bounds, coord) => bounds.extend(coord),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
  );

const Map = ({
  busStops,
  location,
  setCurrBusStopCode,
  setCurrPage,
  onBusStopClick,
  liveArrivals,
  route,
  walkingTarget,
  onClearWalking,
}: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isTooFarOut, setIsTooFarOut] = useState(false);
  const [walkingInfo, setWalkingInfo] = useState<{
    distanceKm: number;
    durationMin: number;
  } | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (mapRef.current || !location) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY ?? '';
    // Disable Mapbox's anonymous telemetry beacon -- it's routinely blocked by
    // ad blockers/privacy extensions, which surfaces as a noisy CORS error in
    // the console even though it has no effect on the map itself.
    mapboxgl.config.EVENTS_URL = null;

    const map = new mapboxgl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: 'mapbox://styles/mapbox/standard',
      center: [location.longitude, location.latitude],
      zoom: 16,
      minZoom: mapMinZoom,
      maxBounds: singaporeBounds,
      renderWorldCopies: false,
    });
    mapRef.current = map;

    if (supportsDeviceHeading()) {
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      });
      map.addControl(geolocateControl, 'bottom-right');
      // Show the user's live location by default instead of waiting for a tap.
      map.on('load', () => geolocateControl.trigger());
    } else {
      // No compass to cycle through -- just always show a fixed location dot.
      new mapboxgl.Marker({ element: createUserLocationMarkerElement() })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);
    }

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    const updateVisibleStops = () => {
      const source = map.getSource('points') as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      const zoomedOut = map.getZoom() < busStopMinZoom;
      setIsTooFarOut(zoomedOut);

      if (zoomedOut) {
        source.setData(EMPTY_FEATURE_COLLECTION);
        return;
      }

      const bounds = map.getBounds();
      const visibleStops = bounds
        ? busStops.filter((stop) => bounds.contains([+stop.Longitude, +stop.Latitude]))
        : [];

      source.setData({
        type: 'FeatureCollection',
        features: visibleStops.map(stopToFeature),
      });
    };

    map.on('style.load', () => {
      map.setConfigProperty('basemap', 'lightPreset', lightPresetFor(resolvedTheme));

      // Route line + the route's own stops (always visible, independent of
      // the zoom-gated bus-stop layer below). A white casing under the amber
      // line keeps it legible regardless of what's on the basemap beneath it.
      map.addSource('route-line', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
      // Mapbox Standard applies simulated 3D lighting to every layer -- even
      // flat circles/lines -- so colors visibly dim under the 'night' preset
      // no matter how bright the hex value is. `*-emissive-strength: 1` makes
      // a layer render at constant brightness regardless of ambient lighting,
      // which is the actual fix (brighter per-theme hex alone wasn't enough).
      map.addLayer({
        id: 'route-line-casing',
        type: 'line',
        source: 'route-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-emissive-strength': 1 },
      });
      map.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': routeColorFor(resolvedTheme),
          'line-width': 5,
          'line-emissive-strength': 1,
        },
      });
      map.addSource('route-stops', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
      map.addLayer({
        id: 'route-stops-layer',
        type: 'circle',
        source: 'route-stops',
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-color': routeColorFor(resolvedTheme),
          'circle-stroke-width': 2,
          'circle-emissive-strength': 1,
        },
      });

      // Walking directions line.
      map.addSource('walking-line', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
      map.addLayer({
        id: 'walking-line-layer',
        type: 'line',
        source: 'walking-line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-dasharray': [0.3, 1.6],
          'line-emissive-strength': 1,
        },
      });

      // Live bus positions (from the arrival data's NextBus coordinates).
      map.addSource('live-buses', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
      map.addLayer({
        id: 'live-buses-layer',
        type: 'circle',
        source: 'live-buses',
        paint: {
          'circle-radius': 8,
          'circle-color': liveBusColorFor(resolvedTheme),
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-emissive-strength': 1,
        },
      });

      const markerImage = new Image(128, 128);
      markerImage.onload = () => {
        map.addImage('bus_stop', markerImage);

        map.addSource('points', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });

        map.addLayer({
          id: 'points',
          type: 'symbol',
          source: 'points',
          layout: {
            'icon-image': 'bus_stop',
            'icon-size': 0.28,
            // Bus stops are often closely spaced (opposite sides of a road,
            // consecutive stops) -- without this, Mapbox's collision
            // avoidance silently drops markers it thinks would overlap.
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
          },
          paint: { 'icon-emissive-strength': 1 },
        });

        updateVisibleStops();
        map.on('moveend', updateVisibleStops);
      };
      markerImage.src = busStopMarkerDataUri;
    });

    map.on('click', 'points', (event) => {
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') return;

      const coordinates = feature.geometry.coordinates as [number, number];
      const { title, stopNo } = feature.properties as { title: string; stopNo: string };

      const existingPopups = document.getElementsByClassName('mapboxgl-popup');
      if (existingPopups[0]) existingPopups[0].remove();

      new mapboxgl.Popup({
        className: styles.map_popup,
        offset: [0, -15],
        closeButton: false,
      })
        .setLngLat(coordinates)
        .setHTML(`<h3>${title}</h3><p>${stopNo}</p>`)
        .addTo(map);

      map.flyTo({ center: coordinates, zoom: 18 });

      setCurrBusStopCode(stopNo);
      setCurrPage('arrival');
      onBusStopClick();
    });

    map.on('click', 'live-buses-layer', (event) => {
      const feature = event.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') return;

      const coordinates = feature.geometry.coordinates as [number, number];
      const { serviceNo, etaMins } = feature.properties as { serviceNo: string; etaMins: number };

      const existingPopups = document.getElementsByClassName('mapboxgl-popup');
      if (existingPopups[0]) existingPopups[0].remove();

      new mapboxgl.Popup({ className: styles.map_popup, offset: [0, -10], closeButton: false })
        .setLngLat(coordinates)
        .setHTML(
          `<h3>Service ${serviceNo}</h3><p>${etaMins <= 0 ? 'Arriving' : `${etaMins} min`}</p>`
        )
        .addTo(map);
    });

    for (const layerId of ['points', 'live-buses-layer']) {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // The map should only be created once, when the initial center resolves --
    // remaining props are read via closure or synced by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !resolvedTheme) return;

    whenStyleReady(map, () => {
      map.setConfigProperty('basemap', 'lightPreset', lightPresetFor(resolvedTheme));

      if (map.getLayer('route-line-layer')) {
        map.setPaintProperty('route-line-layer', 'line-color', routeColorFor(resolvedTheme));
      }
      if (map.getLayer('route-stops-layer')) {
        map.setPaintProperty(
          'route-stops-layer',
          'circle-stroke-color',
          routeColorFor(resolvedTheme)
        );
      }
      if (map.getLayer('live-buses-layer')) {
        map.setPaintProperty('live-buses-layer', 'circle-color', liveBusColorFor(resolvedTheme));
      }
    });
  }, [resolvedTheme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    whenStyleReady(map, () => {
      const lineSource = map.getSource('route-line') as mapboxgl.GeoJSONSource | undefined;
      const stopsSource = map.getSource('route-stops') as mapboxgl.GeoJSONSource | undefined;
      if (!lineSource || !stopsSource) return;

      if (!route || route.coordinates.length === 0) {
        lineSource.setData(EMPTY_FEATURE_COLLECTION);
        stopsSource.setData(EMPTY_FEATURE_COLLECTION);
        return;
      }

      lineSource.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: route.coordinates },
      });
      stopsSource.setData({
        type: 'FeatureCollection',
        features: route.coordinates.map((coordinate) => ({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: coordinate },
        })),
      });

      if (route.coordinates.length > 1) {
        map.fitBounds(boundsFromCoordinates(route.coordinates), { padding: 60, maxZoom: 16 });
      }
    });
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!walkingTarget || !location) {
      // Cleared -- synchronize the displayed state back to empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWalkingInfo(null);
      whenStyleReady(map, () => {
        const source = map.getSource('walking-line') as mapboxgl.GeoJSONSource | undefined;
        source?.setData(EMPTY_FEATURE_COLLECTION);
      });
      return;
    }

    let cancelled = false;

    const loadWalkingDirections = async () => {
      try {
        const from = `${location.longitude},${location.latitude}`;
        const to = `${walkingTarget[0]},${walkingTarget[1]}`;
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/walking/${from};${to}` +
          `?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Directions request failed (${res.status})`);
        const data = await res.json();
        const walkingRoute = data.routes?.[0];
        if (cancelled || !walkingRoute) return;

        const source = map.getSource('walking-line') as mapboxgl.GeoJSONSource | undefined;
        source?.setData({ type: 'Feature', properties: {}, geometry: walkingRoute.geometry });

        const coordinates = walkingRoute.geometry.coordinates as [number, number][];
        if (coordinates.length > 1) {
          map.fitBounds(boundsFromCoordinates(coordinates), { padding: 70, maxZoom: 17 });
        }

        setWalkingInfo({
          distanceKm: walkingRoute.distance / 1000,
          durationMin: Math.round(walkingRoute.duration / 60),
        });
      } catch (error) {
        console.error('Failed to fetch walking directions', error);
      }
    };

    whenStyleReady(map, () => {
      loadWalkingDirections();
    });

    return () => {
      cancelled = true;
    };
  }, [walkingTarget, location]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    whenStyleReady(map, () => {
      const source = map.getSource('live-buses') as mapboxgl.GeoJSONSource | undefined;
      if (!source) return;

      // Once a specific service's route is selected, only plot that
      // service's live position -- not every other service also passing
      // through the stop. Filtered here (not by the caller) so this is the
      // single source of truth for what "selected" means for this layer.
      const relevantArrivals = route
        ? liveArrivals.filter((service) => service.ServiceNo === route.serviceNo)
        : liveArrivals;

      const features = relevantArrivals
        .filter(
          (service) =>
            service.NextBus.Monitored === 1 &&
            +service.NextBus.Latitude !== 0 &&
            +service.NextBus.Longitude !== 0
        )
        .map((service) => ({
          type: 'Feature' as const,
          properties: {
            serviceNo: service.ServiceNo,
            etaMins: parseTime(service.NextBus.EstimatedArrival),
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [+service.NextBus.Longitude, +service.NextBus.Latitude],
          },
        }));

      source.setData({ type: 'FeatureCollection', features });
    });
  }, [liveArrivals, route]);

  return (
    <div className={styles.map_wrapper}>
      <div className={styles.map_container} ref={mapContainer} />
      {isTooFarOut && <div className={styles.zoom_hint}>Zoom in to see bus stops</div>}
      <div className={styles.banner_stack}>
        {walkingTarget && (
          <div className={styles.info_banner}>
            <span>
              {walkingInfo
                ? `${walkingInfo.distanceKm < 1 ? `${Math.round(walkingInfo.distanceKm * 1000)} m` : `${walkingInfo.distanceKm.toFixed(1)} km`} · ${walkingInfo.durationMin} min walk`
                : 'Loading walking directions…'}
            </span>
            <button type="button" onClick={onClearWalking} aria-label="Clear walking directions">
              &times;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
