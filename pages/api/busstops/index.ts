import axios, { AxiosResponse } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { busStopsEndpoint } from '../../../library/constants';
import { BusStopsEndpointDataType, LTABusStops } from '../../../types/buses';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<BusStopsEndpointDataType['value']>
) => {
  const busStopsData = await getBusStops();
  res.status(200).json(busStopsData);
};

const getBusStops = async () => {
  let count = 0;
  const maxRecords = 500;
  let isDone = false;
  let res: BusStopsEndpointDataType['value'] = [];

  while (!isDone) {
    const newRes: AxiosResponse = await axios.get(
      `${busStopsEndpoint}?$skip=${count * maxRecords}`,
      {
        headers: { AccountKey: process.env.NEXT_PUBLIC_LTA_API_KEY },
      }
    );

    res = res.concat(newRes.data);
    count++;
    if (newRes.data.value.length === 0) isDone = true;
  }

  return res;
};

export default handler;
