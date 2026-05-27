export const queryKey = {
  bkk: {
    vehicles: () => ["bkk", "vehicles"] as const,
    routeShapes: (routeId: string | null) =>
      ["bkk", "route-shapes", routeId] as const,
  },
  mapServer: {
    vehicles: (bbox: string) => ["map-server", "vehicles", bbox] as const,
    staticFeedStatus: (bbox: string | null) =>
      ["map-server", "static-feed-status", bbox] as const,
    routes: (feedOnestopId: string | null) =>
      ["map-server", "routes", feedOnestopId] as const,
    stops: (feedOnestopId: string | null) =>
      ["map-server", "stops", feedOnestopId] as const,
    tripRoute: (tripId: string | null) =>
      ["map-server", "trip-route", tripId] as const,
    routeTrips: (
      routeId: string | null,
      serviceDate: string,
      startTime: string,
      endTime: string,
    ) =>
      [
        "map-server",
        "route-trips",
        routeId,
        serviceDate,
        startTime,
        endTime,
      ] as const,
    tripStopTimes: (tripId: string | null) =>
      ["map-server", "trip-stop-times", tripId] as const,
    stopDepartures: (stopKey: string | null) =>
      ["map-server", "stop-departures", stopKey] as const,
  },
} as const;
