import type { MapServerTransportProviderId } from "./transport-provider";

export const queryKey = {
  bkk: {
    vehicles: () => ["bkk", "vehicles"] as const,
    routeShapes: (routeId: string | null) =>
      ["bkk", "route-shapes", routeId] as const,
  },
  mapServer: {
    vehicles: (provider: MapServerTransportProviderId, bbox: string) =>
      ["map-server", provider, "vehicles", bbox] as const,
    staticFeedStatus: (
      provider: MapServerTransportProviderId,
      bbox: string | null,
    ) => ["map-server", provider, "static-feed-status", bbox] as const,
    routes: (
      provider: MapServerTransportProviderId,
      feedOnestopId: string | null,
    ) => ["map-server", provider, "routes", feedOnestopId] as const,
    stops: (
      provider: MapServerTransportProviderId,
      feedOnestopId: string | null,
    ) => ["map-server", provider, "stops", feedOnestopId] as const,
    tripRoute: (
      provider: MapServerTransportProviderId,
      tripId: string | null,
    ) => ["map-server", provider, "trip-route", tripId] as const,
    routeTrips: (
      provider: MapServerTransportProviderId,
      routeId: string | null,
      serviceDate: string,
      startTime: string,
      endTime: string,
    ) =>
      [
        "map-server",
        provider,
        "route-trips",
        routeId,
        serviceDate,
        startTime,
        endTime,
      ] as const,
    tripStopTimes: (
      provider: MapServerTransportProviderId,
      tripId: string | null,
    ) => ["map-server", provider, "trip-stop-times", tripId] as const,
    stopDepartures: (
      provider: MapServerTransportProviderId,
      stopKey: string | null,
    ) => ["map-server", provider, "stop-departures", stopKey] as const,
  },
} as const;
