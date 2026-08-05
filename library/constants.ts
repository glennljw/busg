// LTA DataMall Endpoint
export const dataMallUrl = 'https://datamall2.mytransport.sg/ltaodataservice';
// LTA retired BusArrivalv2 -- the live endpoint is now versioned in the path.
export const busArrivalEndpoint = dataMallUrl + '/v3/BusArrival';
export const busStopsEndpoint = dataMallUrl + '/BusStops';
export const busRoutesEndpoint = dataMallUrl + '/BusRoutes';

// Marina Bay, Singapore -- used when the browser has no/denied geolocation access
export const defaultMapCenter = { latitude: 1.2838, longitude: 103.8591 };

export const busStopsRevalidateSeconds = 60 * 60 * 24;

// Padded bounding box around mainland Singapore + outlying islands (Pulau Ubin,
// Sentosa, Jurong Island, ...) -- keeps the map from panning/zooming out to the
// rest of the world.
export const singaporeBounds: [[number, number], [number, number]] = [
  [103.55, 1.13],
  [104.13, 1.48],
];

export const mapMinZoom = 10.5;

// Bus stop markers only render once the user is zoomed in this far, and only
// within the current viewport -- avoids plotting thousands of markers at once.
export const busStopMinZoom = 15;
