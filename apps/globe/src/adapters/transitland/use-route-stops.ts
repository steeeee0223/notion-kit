import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";

export interface RouteStop {
  id: number;
  onestopId: string;
  stopId: string;
  stopName: string;
  longitude: number;
  latitude: number;
  routeShortNames: string[];
}

interface TransitlandStop {
  id: number;
  onestop_id: string;
  stop_id: string;
  stop_name: string;
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  location_type: number;
  route_stops?: {
    route: {
      route_short_name: string;
    };
  }[];
}

function transferStop(stop: TransitlandStop): RouteStop {
  return {
    id: stop.id,
    onestopId: stop.onestop_id,
    stopId: stop.stop_id,
    stopName: stop.stop_name,
    longitude: stop.geometry.coordinates[0],
    latitude: stop.geometry.coordinates[1],
    routeShortNames:
      stop.route_stops?.map((rs) => rs.route.route_short_name) ?? [],
  };
}

export function useRouteStops(
  routeId: string | null,
  operatorOnestopId?: string,
) {
  return useQuery<RouteStop[]>({
    queryKey: ["transitland", "route-stops", routeId, operatorOnestopId],
    queryFn: async () => {
      if (!routeId) return [];
      const { data, error } = await mapApiClient<{ stops: TransitlandStop[] }>(
        `/transitland/route-stops/${routeId}`,
        {
          query: operatorOnestopId ? { operatorId: operatorOnestopId } : {},
        },
      );
      if (error) return [];
      return data.stops.map(transferStop);
    },
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}
