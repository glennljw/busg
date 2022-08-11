import axios from 'axios';
import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';
import { busArrivalEndpoint } from '../../../library/constants';
import { BusArrivalEndpointDataType, BusArrivalTimeParams } from '../../../types/buses';

// const cors = Cors({ methods: ['POST', 'GET', 'HEAD'] });

// const runCors = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }

//       return resolve(result);
//     });
//   });
// };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //   await runCors(req, res, cors);

  const { servicesInfo } = req.query;
  // Split matched params array

  let response = { Services: [] };

  // array structure will be as follows: [busStopCode, serviceNo]
  // url will be as such: endpoint?busStopCode=xxx&serviceNo=yyy
  if (servicesInfo?.length == 1) {
    response = await getBusArrivalTime({
      accountKey: process.env.NEXT_PUBLIC_LTA_API_KEY,
      busStopCode: servicesInfo[0],
    });
  } else {
    response = await getBusArrivalTime({
      accountKey: process.env.NEXT_PUBLIC_LTA_API_KEY,
      busStopCode: servicesInfo[0],
      serviceNo: servicesInfo[1],
    });
  }

  res.status(200).json(response.Services);
};

export const getBusArrivalTime = async (
  busArrivalTimeParams: BusArrivalTimeParams
): Promise<BusArrivalEndpointDataType> => {
  let params;

  if (busArrivalTimeParams.serviceNo) {
    params = new URLSearchParams({
      BusStopCode: busArrivalTimeParams.busStopCode,
      ServiceNo: busArrivalTimeParams.serviceNo,
    });
  } else {
    params = new URLSearchParams({
      BusStopCode: busArrivalTimeParams.busStopCode,
    });
  }

  const arrivalTimeQueryUrl = busArrivalEndpoint + '?' + params.toString();

  // console.log('Query Endpoint: ' + arrivalTimeQueryUrl);

  try {
    const response = await axios.get(arrivalTimeQueryUrl, {
      headers: {
        AccountKey: busArrivalTimeParams.accountKey,
      },
    });
    return response.data;
  } catch (e) {
    console.log(e);
  }
};

export default handler;
