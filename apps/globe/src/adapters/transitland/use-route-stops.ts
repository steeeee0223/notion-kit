import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  transportProviderPath,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";

export interface RouteStop {
  /**
   * the unique ID of the stop, <feed_onestop_id>:<stop_id>
   */
  id: string;
  /**
   * the stop ID
   */
  stopId: string;
  stopName: string;
  longitude: number;
  latitude: number;
  routeShortNames: string[];
}

interface TripStopTime {
  stop_id: string;
  stop_name: string | null;
  lat?: number | null;
  lon?: number | null;
}

interface TripStopTimesResponse {
  trip_id: string;
  route_short_name: string | null;
  service_date: string;
  stop_times: TripStopTime[];
}

interface StopsResponse {
  stops: {
    id: string;
    stop_id: string;
    stop_name: string | null;
    lat: number | null;
    lon: number | null;
  }[];
}

function transferStop(
  stop: TripStopTime,
  routeShortName: string | null,
): RouteStop | null {
  if (typeof stop.lon !== "number" || typeof stop.lat !== "number") {
    return null;
  }

  return {
    id: stop.stop_id,
    stopId: stop.stop_id,
    stopName: stop.stop_name ?? "Unknown stop",
    longitude: stop.lon,
    latitude: stop.lat,
    routeShortNames: routeShortName ? [routeShortName] : [],
  };
}

export function useRouteStops(
  provider: MapServerTransportProviderId,
  tripId: string | null,
  fallbackRouteId?: string | null,
) {
  return useQuery<RouteStop[]>({
    queryKey: queryKey.mapServer.tripStopTimes(
      provider,
      tripId ?? fallbackRouteId ?? null,
    ),
    queryFn: async () => {
      const id = tripId ?? fallbackRouteId ?? null;
      if (!id) return [];

      if (provider !== "transitland" && fallbackRouteId) {
        const feedOnestopId = getFeedOnestopId(fallbackRouteId);
        if (!feedOnestopId) return [];
        const { data, error } = await mapApiClient<StopsResponse>(
          transportProviderPath(provider, "/stops"),
          { query: { feed_onestop_id: feedOnestopId, limit: 500 } },
        );
        if (error) return [];
        return data.stops.flatMap((stop) => {
          const routeStop = transferStop(
            {
              stop_id: stop.id,
              stop_name: stop.stop_name,
              lat: stop.lat,
              lon: stop.lon,
            },
            null,
          );
          return routeStop ? [routeStop] : [];
        });
      }

      const query: Record<string, boolean | string> = {
        include_realtime: true,
        include_geometry: true,
      };
      if (fallbackRouteId) query.fallback_route_id = fallbackRouteId;

      const { data, error } = await mapApiClient<TripStopTimesResponse>(
        `/api/trips/${encodeURIComponent(id)}/stop-times`,
        { query },
      );
      if (error) return [];
      return data.stop_times.flatMap((stop) => {
        const routeStop = transferStop(stop, data.route_short_name);
        return routeStop ? [routeStop] : [];
      });
    },
    enabled: !!(tripId ?? fallbackRouteId),
    staleTime: 20 * 1000,
  });
}

function getFeedOnestopId(routeId: string) {
  const separatorIndex = routeId.indexOf(":");
  if (separatorIndex <= 0) return null;
  return routeId.slice(0, separatorIndex);
}
