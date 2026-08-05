'use client';

import styles from './Homepage.module.scss';
import { Drawer, IconButton, Input, useDisclosure } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import { BusPages, BusRouteByDirection, BusTabs, LTABusStops } from '../../types/buses';
import { useGeolocation } from '../../library/useGeolocation';
import { useFavoriteStops } from '../../library/useFavoriteStops';
import { useRecentStops } from '../../library/useRecentStops';
import { useBusArrivals } from '../../library/useBusArrivals';
import { distanceKm, formatDistance } from '../../library/distance';
import { fetchBusRoute } from '../../library/fetchBusRoute';
import BusArrival from '../BusArrival/BusArrival';
import BusStops from '../BusStops/BusStops';
import FavoritesDashboard from '../FavoritesDashboard/FavoritesDashboard';
import RoutePanel from '../RoutePanel/RoutePanel';
import Tab from '../Tab/Tab';
import { ColorModeToggle } from '../ColorModeToggle/ColorModeToggle';

const MapView = dynamic(() => import('../Map/Map'), {
  ssr: false,
  loading: () => <div className={styles.map_loading} />,
});

interface HomepageProps {
  busStops: LTABusStops[];
}

interface SelectedRoute {
  serviceNo: string;
  byDirection: BusRouteByDirection;
  direction: number;
}

const Homepage = ({ busStops }: HomepageProps) => {
  const { open, onOpen, onClose, setOpen } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const location = useGeolocation();
  const { favorites, toggleFavorite } = useFavoriteStops();
  const { recentCodes, addRecentStop } = useRecentStops();
  const [currTab, setCurrTab] = useState<BusTabs>('names');
  const [currBusStopCode, setCurrBusStopCode] = useState<string>('');
  const [currPage, setCurrPage] = useState<BusPages>('main');
  const [userInput, setUserInput] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [walkingTarget, setWalkingTarget] = useState<[number, number] | null>(null);

  const activeStopCode = currPage === 'arrival' ? currBusStopCode : '';
  const arrivalState = useBusArrivals(activeStopCode);
  // Map narrows this down to the selected route's service itself, using the
  // `route` prop it already receives -- see Map.tsx's live-buses effect.
  const liveArrivals = currPage === 'arrival' ? arrivalState.arrivals : [];

  const sortedBusStops = useMemo(() => {
    return [...busStops].sort((stop1, stop2) => stop1.Description.localeCompare(stop2.Description));
  }, [busStops]);

  const filteredBusStops = useMemo(() => {
    if (userInput === '') return [];
    const query = userInput.toLocaleUpperCase();
    return sortedBusStops.filter((stop) => stop.Description.toLocaleUpperCase().includes(query));
  }, [sortedBusStops, userInput]);

  const recentBusStops = useMemo(() => {
    const stopByCode = new Map(busStops.map((stop) => [stop.BusStopCode, stop]));
    return recentCodes
      .map((code) => stopByCode.get(code))
      .filter((stop): stop is LTABusStops => Boolean(stop));
  }, [busStops, recentCodes]);

  const nearbyBusStops = useMemo(() => {
    if (!location) return [];
    return [...busStops]
      .sort(
        (a, b) =>
          distanceKm(location, { latitude: a.Latitude, longitude: a.Longitude }) -
          distanceKm(location, { latitude: b.Latitude, longitude: b.Longitude })
      )
      .slice(0, 200);
  }, [busStops, location]);

  const favoriteBusStops = useMemo(() => {
    return sortedBusStops.filter((stop) => favorites.includes(stop.BusStopCode));
  }, [sortedBusStops, favorites]);

  // A service with only one direction in LTA's data loops back to its start
  // rather than running a separate return leg -- there's nothing to reverse.
  const isLoopService = selectedRoute ? Object.keys(selectedRoute.byDirection).length < 2 : false;

  const routeStopDetails = useMemo(() => {
    if (!selectedRoute) return [];
    const stopByCode = new Map(busStops.map((stop) => [stop.BusStopCode, stop]));
    const stops = selectedRoute.byDirection[selectedRoute.direction] ?? [];

    return stops
      .map((routeStop) => {
        const stop = stopByCode.get(routeStop.busStopCode);
        if (!stop) return null;
        return {
          busStopCode: routeStop.busStopCode,
          sequence: routeStop.sequence,
          distanceKm: routeStop.distanceKm,
          description: stop.Description,
          roadName: stop.RoadName,
          longitude: +stop.Longitude,
          latitude: +stop.Latitude,
        };
      })
      .filter((stop): stop is NonNullable<typeof stop> => Boolean(stop));
  }, [selectedRoute, busStops]);

  const routeForMap = useMemo(() => {
    if (!selectedRoute || routeStopDetails.length === 0) return null;
    return {
      serviceNo: selectedRoute.serviceNo,
      coordinates: routeStopDetails.map((stop): [number, number] => [
        stop.longitude,
        stop.latitude,
      ]),
    };
  }, [selectedRoute, routeStopDetails]);

  const openStop = (code: string) => {
    setCurrBusStopCode(code);
    setCurrPage('arrival');
  };

  // One-time hydration of state from the URL (?stop=CODE) and from "arrived
  // at a stop" bookkeeping (recent stops) -- both are inherently side-effecty
  // reactions to navigation, not values derivable during render.
  useEffect(() => {
    const stopParam = new URLSearchParams(window.location.search).get('stop');
    if (stopParam && busStops.some((stop) => stop.BusStopCode === stopParam)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openStop(stopParam);
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currPage === 'arrival' && currBusStopCode) {
      addRecentStop(currBusStopCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currPage, currBusStopCode]);

  const handleTabChange = (tab: BusTabs) => {
    setCurrTab(tab);
    setCurrPage('main');
    setUserInput('');
  };

  const isValidInput = (input: string) => {
    if (input === '') return false;
    switch (currTab) {
      case 'names':
        return busStops.some((stop) =>
          stop.Description.toLocaleUpperCase().includes(input.toLocaleUpperCase())
        );
      case 'code':
        return busStops.some((stop) => stop.BusStopCode === input);
      default:
        return false;
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const value = e.currentTarget.value;
    if (!isValidInput(value)) return;

    setCurrPage('main');
    setUserInput(value);
    if (currTab === 'code') {
      openStop(value);
    }
  };

  const handleViewRoute = async (serviceNo: string) => {
    setIsRouteLoading(true);
    try {
      const byDirection = await fetchBusRoute(serviceNo);
      const directions = Object.keys(byDirection).map(Number);
      // Prefer whichever direction actually serves the stop we're looking at.
      const initialDirection =
        directions.find((dir) =>
          byDirection[dir].some((stop) => stop.busStopCode === currBusStopCode)
        ) ?? directions[0];

      setSelectedRoute({ serviceNo, byDirection, direction: initialDirection });
      onClose();
    } catch (error) {
      console.error('Failed to fetch bus route', error);
    } finally {
      setIsRouteLoading(false);
    }
  };

  const handleReverseRoute = () => {
    // Both directions come back from the same fetch, so reversing is just a
    // local state flip -- no need to hit the API again.
    setSelectedRoute((prev) => {
      if (!prev) return prev;
      const directions = Object.keys(prev.byDirection).map(Number);
      const otherDirection = directions.find((dir) => dir !== prev.direction);
      return otherDirection === undefined ? prev : { ...prev, direction: otherDirection };
    });
  };

  const handleWalkHere = () => {
    const stop = busStops.find((s) => s.BusStopCode === currBusStopCode);
    if (!stop) return;
    setWalkingTarget([+stop.Longitude, +stop.Latitude]);
    onClose();
  };

  const renderInput = () => {
    if (currTab !== 'names' && currTab !== 'code') return null;

    return (
      <Input
        className={styles.search_input}
        placeholder={currTab === 'names' ? 'Search by bus stop name' : 'Search by bus stop number'}
        onKeyDown={handleOnKeyDown}
        aria-invalid={userInput !== '' && !isValidInput(userInput)}
        autoFocus
      />
    );
  };

  const renderPage = () => {
    if (currPage === 'arrival') {
      const hasValidBusStopCode = busStops.some((stop) => stop.BusStopCode === currBusStopCode);
      if (hasValidBusStopCode) {
        return (
          <BusArrival
            busStops={busStops}
            busStopCode={currBusStopCode}
            arrivals={arrivalState.arrivals}
            isLoading={arrivalState.isLoading}
            hasError={arrivalState.hasError}
            lastUpdatedAt={arrivalState.lastUpdatedAt}
            onRefresh={arrivalState.refetch}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewRoute={handleViewRoute}
            onWalkHere={handleWalkHere}
            isRouteLoading={isRouteLoading}
          />
        );
      }
    }

    if (currTab === 'names') {
      return (
        <BusStops
          key={`names:${userInput}`}
          busStops={userInput === '' ? recentBusStops : filteredBusStops}
          handleBusStopNameClick={() => setCurrPage('arrival')}
          setCurrBusStopCode={setCurrBusStopCode}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          emptyMessage={
            userInput === '' ? 'Recently viewed stops will show up here' : 'No matching stops found'
          }
        />
      );
    }

    if (currTab === 'nearby') {
      return (
        <BusStops
          key="nearby"
          busStops={nearbyBusStops}
          handleBusStopNameClick={() => setCurrPage('arrival')}
          setCurrBusStopCode={setCurrBusStopCode}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          getDistanceLabel={(stop) =>
            location
              ? formatDistance(
                  distanceKm(location, { latitude: stop.Latitude, longitude: stop.Longitude })
                )
              : null
          }
          emptyMessage={location ? 'No nearby stops found' : 'Waiting for your location…'}
        />
      );
    }

    if (currTab === 'favorites') {
      return (
        <FavoritesDashboard
          favoriteStops={favoriteBusStops}
          onSelectStop={openStop}
          onToggleFavorite={toggleFavorite}
        />
      );
    }

    return null;
  };

  return (
    <div className={styles.homepage}>
      <MapView
        busStops={busStops}
        location={location}
        setCurrBusStopCode={setCurrBusStopCode}
        setCurrPage={setCurrPage}
        onBusStopClick={onOpen}
        liveArrivals={liveArrivals}
        route={routeForMap}
        walkingTarget={walkingTarget}
        onClearWalking={() => setWalkingTarget(null)}
      />
      {selectedRoute && (
        <RoutePanel
          serviceNo={selectedRoute.serviceNo}
          stops={routeStopDetails}
          isLoop={isLoopService}
          onReverse={handleReverseRoute}
          onClose={() => setSelectedRoute(null)}
          onSelectStop={(code) => {
            setSelectedRoute(null);
            openStop(code);
          }}
        />
      )}
      <IconButton
        className={styles.drawer_button}
        ref={btnRef}
        onClick={onOpen}
        aria-label="Search bus stops"
        size="lg"
        rounded="full"
      >
        <IoSearchOutline />
      </IconButton>
      <ColorModeToggle className={styles.mode_button} />
      <Drawer.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        placement="bottom"
        size="md"
        finalFocusEl={() => btnRef.current}
      >
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content className={styles.drawer_content}>
            <Drawer.CloseTrigger asChild>
              <IconButton
                aria-label="Close search"
                variant="ghost"
                size="sm"
                className={styles.close_button}
              >
                <IoClose />
              </IconButton>
            </Drawer.CloseTrigger>
            <Drawer.Header className={styles.drawer_header}>
              <Drawer.Title>Search bus stops</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Tab activeTab={currTab} setTab={handleTabChange} />
              {renderInput()}
              {renderPage()}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </div>
  );
};

export default Homepage;
