import axios from 'axios';
import { LTABusStops } from '../types/buses';

export const fetchBusData = async (busStopCode: string, serviceNo: string) => {
  const serviceInfo = await axios.get(`/api/busservices/${busStopCode}/${serviceNo}`);
  return serviceInfo;
};

export const fetchBusStopDesc = async () => {
  const res = await axios.get('/api/busstops');
  const busStopsData: LTABusStops[] = res.data;

  console.log('bus stop data', busStopsData);
  return busStopsData;
};

export const parseTime = (time: string) => {
  let currentTime = new Date();
  let arrivalTime = new Date(Date.parse(time));
  const timeDifferenceInMs = arrivalTime.getTime() - currentTime.getTime();
  const timeDifferenceInMins = timeDifferenceInMs / 1000 / 60;
  const estArrivalTimeInMins = Math.floor(timeDifferenceInMins);
  return estArrivalTimeInMins;
};
