import axios from 'axios';
import { busArrivalEndpoint } from '../library/constants';
import { LTABusArrival } from '../types/buses';
import { busArrivalTimeParams } from '../types/buses';

export const getBusArrivalTime = async (
  busArrivalTimeParams: busArrivalTimeParams
): Promise<LTABusArrival[]> => {
  const params = new URLSearchParams({
    BusStopCode: busArrivalTimeParams.busStopCode,
    // ServiceNo: busArrivalTimeParams.serviceNo,
  });
  const arrivalTimeQueryUrl = busArrivalEndpoint + '?' + params.toString();
  console.log('Query Endpoint: ' + arrivalTimeQueryUrl);

  try {
    const response = await axios.get(arrivalTimeQueryUrl, {
      headers: {
        AccountKey: busArrivalTimeParams.accountKey,
      },
    });
    console.log(response, 'Test response');
    return response.data;
  } catch (e) {
    console.log('Failed axios');
    console.log(e);
  }
};
