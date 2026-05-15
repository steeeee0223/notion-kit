import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";

export interface RouteStop {
  id: string;
  onestopId: string;
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

function transferStop(
  stop: TripStopTime,
  routeShortName: string | null,
): RouteStop | null {
  if (typeof stop.lon !== "number" || typeof stop.lat !== "number") {
    return null;
  }

  return {
    id: stop.stop_id,
    onestopId: stop.stop_id,
    stopId: stop.stop_id,
    stopName: stop.stop_name ?? stop.stop_id,
    longitude: stop.lon,
    latitude: stop.lat,
    routeShortNames: routeShortName ? [routeShortName] : [],
  };
}

export function useRouteStops(
  tripId: string | null,
  fallbackRouteId?: string | null,
) {
  return useQuery<RouteStop[]>({
    queryKey: queryKey.mapServer.tripStopTimes(
      tripId ?? fallbackRouteId ?? null,
    ),
    queryFn: async () => {
      const id = tripId ?? fallbackRouteId ?? null;
      if (!id) return [];
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
