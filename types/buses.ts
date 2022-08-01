export interface BusArrivalEndpointDataType {
  Services: LTABusArrival[];
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

export interface BusArrivalTimeParams {
  accountKey: string;
  busStopCode: string;
  serviceNo?: string;
}

export interface BusServiceNoAndArrival {
  ServiceNo: string;
  ArrivalTimeInMins: number;
}
