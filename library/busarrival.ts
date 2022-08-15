import axios from 'axios';

export const fetchBusData = async (busStopCode: string, serviceNo: string) => {
  const serviceInfo = await axios.get(`/api/bus/arrival/${busStopCode}/${serviceNo}`);
  console.log('Fetch bus data: ', serviceInfo);
  return serviceInfo;
};

export const parseTime = (time: string) => {
  let currentTime = new Date();
  let arrivalTime = new Date(Date.parse(time));
  const timeDifferenceInMs = arrivalTime.getTime() - currentTime.getTime();
  const timeDifferenceInMins = timeDifferenceInMs / 1000 / 60;
  const estArrivalTimeInMins = Math.floor(timeDifferenceInMins);
  return estArrivalTimeInMins;
};
