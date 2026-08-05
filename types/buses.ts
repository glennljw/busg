export interface BusArrivalEndpointDataType {
  Services: LTABusArrival[];
}

export interface BusStopsEndpointDataType {
  value: LTABusStops[];
}

// Seats available / standing available / limited standing
export type BusLoad = 'SEA' | 'SDA' | 'LSD' | '';
// Wheelchair accessible bus, or none reported
export type BusFeature = 'WAB' | '';
// Single deck / double deck / bendy
export type BusType = 'SD' | 'DD' | 'BD' | '';

export interface LTANextBus {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string;
  Monitored: number;
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: BusLoad;
  Feature: BusFeature;
  Type: BusType;
}

export interface LTABusArrival {
  ServiceNo: string;
  Operator: string;
  NextBus: LTANextBus;
  NextBus2: LTANextBus;
  NextBus3: LTANextBus;
}

export interface LTABusStops {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
}

export interface BusServiceNoAndArrival {
  ServiceNo: string;
  ArrivalTimeInMins: number;
  Load: BusLoad;
  Feature: BusFeature;
}

export type BusTabs = 'names' | 'code' | 'nearby' | 'favorites';

export type BusPages = 'main' | 'arrival';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LTABusRoute {
  ServiceNo: string;
  Operator: string;
  Direction: number;
  StopSequence: number;
  BusStopCode: string;
  Distance: number;
}

export interface BusRouteStop {
  busStopCode: string;
  sequence: number;
  distanceKm: number;
}

export type BusRouteByDirection = Record<number, BusRouteStop[]>;

export interface RouteStopDetail {
  busStopCode: string;
  sequence: number;
  distanceKm: number;
  description: string;
  roadName: string;
  longitude: number;
  latitude: number;
}
