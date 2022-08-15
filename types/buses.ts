export interface BusArrivalEndpointDataType {
  Services: LTABusArrival[];
}

export interface BusStopsEndpointDataType {
  value: LTABusStops[];
}

export interface LTABusArrival {
  ServiceNo: string;
  Operator: string;
  NextBus: {
    OriginCode: number;
    DestinationCode: number;
    EstimatedArrival: string;
    Latitude: string;
    Longitude: string;
    VisitNumber: number;
    Load: string;
    Feature: string;
    Type: string;
  };
  NextBus2: {
    OriginCode: number;
    DestinationCode: number;
    EstimatedArrival: string;
    Latitude: string;
    Longitude: string;
    VisitNumber: number;
    Load: string;
    Feature: string;
    Type: string;
  };
  NextBus3: {
    OriginCode: number;
    DestinationCode: number;
    EstimatedArrival: string;
    Latitude: string;
    Longitude: string;
    VisitNumber: number;
    Load: string;
    Feature: string;
    Type: string;
  };
}

export interface LTABusStops {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
}

export interface BusArrivalTimeParams {
  accountKey: string;
  busStopCode: string;
  serviceNo?: string;
}

export interface BusServiceNoAndArrival {
  ServiceNo: string;
  ArrivalTimeInMins: number;
}

export type BusPages = 'main' | 'arrival' | 'names' | 'code';
