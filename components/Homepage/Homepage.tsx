import styles from './Homepage.module.scss';
import { Input } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { BusPages, BusTabs, LTABusStops } from '../../types/buses';
import BusArrival from '../BusArrival/BusArrival';
import BusStops from '../BusStops/BusStops';
import Tab from '../Tab/Tab';

interface HomepageProps {
  busStops: LTABusStops[];
}

const Homepage = ({ busStops }: HomepageProps) => {
  const [currTab, setCurrTab] = useState<BusTabs>('names');
  const [currBusStopCode, setCurrBusStopCode] = useState<string>('');
  const [currPage, setCurrPage] = useState<BusPages>('main');
  const [userInput, setUserInput] = useState<string>('');

  const filteredBusStops = useMemo(() => {
    const busStopNames = busStops.map((stop) => ({
      ...stop,
      Description: stop.Description.toLocaleUpperCase(),
    }));
    const sortedBusStopsByName = [...busStopNames].sort((stop1, stop2) => {
      return stop1.Description.localeCompare(stop2.Description);
    });

    return sortedBusStopsByName.filter((stop) => {
      if (userInput === '') {
        return false;
      }
      return stop.Description.includes(userInput.toLocaleUpperCase());
    });
  }, [userInput]);

  useEffect(() => {
    setCurrPage('main');
  }, [currTab]);

  const isValidInput = (input: string) => {
    switch (currTab) {
      case 'names':
        return (
          busStops.filter((stop) =>
            stop.Description.toLocaleUpperCase().includes(input.toLocaleUpperCase())
          ).length > 0
        );
      case 'code':
        return busStops.filter((stop) => stop.BusStopCode === input).length > 0;
      default:
        return false;
    }
  };

  const handleBusStopNameClick = () => {
    setCurrPage('arrival');
  };

  const handleOnKeyDown = (e) => {
    if (e.key === 'Enter') {
      const isValid = isValidInput(e.target.value);
      if (isValid) {
        setCurrPage('main');
        setUserInput(e.target.value);
        if (currTab === 'code') {
          setCurrPage('arrival');
          setCurrBusStopCode(e.target.value);
        }
      }
    }
  };

  const renderInput = () => {
    if (currTab === 'names') {
      return (
        <Input
          placeholder="Please enter a bus stop name"
          onKeyDown={handleOnKeyDown}
          isInvalid={!isValidInput(userInput)}
        />
      );
    } else {
      return (
        <Input
          placeholder="Please enter a bus stop number"
          onKeyDown={handleOnKeyDown}
          isInvalid={!isValidInput(userInput)}
        />
      );
    }
  };

  const renderPage = () => {
    if (currPage === 'main' && currTab === 'names') {
      return (
        <BusStops
          busStops={filteredBusStops}
          handleBusStopNameClick={handleBusStopNameClick}
          setCurrBusStopCode={(code: string) => setCurrBusStopCode(code)}
        />
      );
    } else if (currPage === 'arrival' && isValidInput(userInput)) {
      return <BusArrival busStops={busStops} busStopCode={currBusStopCode} />;
    } else {
      return <div></div>;
    }
  };

  return (
    <div>
      <Tab setTab={(tabName) => setCurrTab(tabName)} />
      {renderInput()}
      {renderPage()}
    </div>
  );
};

export default Homepage;
