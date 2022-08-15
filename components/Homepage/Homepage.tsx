import styles from './Homepage.module.scss';
import { Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BusPages, LTABusStops } from '../../types/buses';
import BusArrival from '../BusArrival/BusArrival';
import BusStops from '../BusStops/BusStops';
import Tab from '../Tab/Tab';

interface HomepageProps {
  busStops: LTABusStops[];
}

const Homepage = ({ busStops }: HomepageProps) => {
  const [currPage, setCurrPage] = useState<BusPages>('main');
  const [currBusStopCode, setCurrBusStopCode] = useState<string>('');

  const handleBusStopNameClick = () => {
    setCurrPage('arrival');
  };

  const renderPage = () => {
    if (currPage === 'main') {
      return <div>Welcome</div>;
    } else if (currPage === 'code') {
      return <BusArrival busStops={busStops} originalCode={currBusStopCode} />;
    } else {
      return (
        <BusStops
          busStops={busStops}
          handleBusStopNameClick={handleBusStopNameClick}
          setCurrBusStopCode={(code) => setCurrBusStopCode(code)}
        />
      );
    }
  };

  return (
    <div>
      <Tab setPage={(pageName) => setCurrPage(pageName)} />
      {renderPage()}
    </div>
  );
};

export default Homepage;
