import { LTABusArrival } from '../types/buses';

export const fetchBusData = async (
  busStopCode: string,
  serviceNo?: string
): Promise<LTABusArrival[]> => {
  const path = serviceNo
    ? `/api/bus/arrival/${busStopCode}/${serviceNo}`
    : `/api/bus/arrival/${busStopCode}`;

  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch bus arrival data (${res.status})`);
  }

  return res.json();
};

export const parseTime = (time: string): number => {
  const currentTime = new Date();
  const arrivalTime = new Date(Date.parse(time));
  const timeDifferenceInMs = arrivalTime.getTime() - currentTime.getTime();
  const timeDifferenceInMins = timeDifferenceInMs / 1000 / 60;
  return Math.floor(timeDifferenceInMins);
};

// Service numbers can carry a letter suffix (e.g. "12e", "961M"), so a plain
// numeric `+a - +b` comparator breaks -- sort by the numeric part, then suffix.
export const compareServiceNo = (a: string, b: string): number => {
  const parse = (serviceNo: string) => {
    const match = serviceNo.match(/^(\d+)(.*)$/);
    return match
      ? { num: parseInt(match[1], 10), suffix: match[2] }
      : { num: Infinity, suffix: serviceNo };
  };
  const parsedA = parse(a);
  const parsedB = parse(b);
  return parsedA.num !== parsedB.num
    ? parsedA.num - parsedB.num
    : parsedA.suffix.localeCompare(parsedB.suffix);
};
