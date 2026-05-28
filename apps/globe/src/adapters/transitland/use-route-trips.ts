import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";
import {
  transportProviderPath,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";

export interface RouteTrip {
  id: string;
  tripId: string;
  routeId: string;
  serviceId: string;
  shapeId: string | null;
  tripHeadsign: string | null;
  tripShortName: string | null;
  directionId: number | null;
  firstDepartureTime: string | null;
  lastDepartureTime: string | null;
  matchingStopTimesCount: number;
}

interface RouteTripResponse {
  trips: {
    id: string;
    trip_id: string;
    route_id: string;
    service_id: string;
    shape_id: string | null;
    trip_headsign: string | null;
    trip_short_name: string | null;
    direction_id: number | null;
    first_departure_time: string | null;
    last_departure_time: string | null;
    matching_stop_times_count: number;
  }[];
}

export function useRouteTrips(
  provider: MapServerTransportProviderId,
  routeId: string | null,
  serviceDate: string,
  startTime: string,
  endTime: string,
) {
  return useQuery<RouteTrip[]>({
    queryKey: queryKey.mapServer.routeTrips(
      provider,
      routeId,
      serviceDate,
      startTime,
      endTime,
    ),
    queryFn: async () => {
      if (!routeId) return [];
      const { data, error } = await mapApiClient<RouteTripResponse>(
        transportProviderPath(provider, "/trips"),
        {
          query: {
            route_id: routeId,
            service_date: serviceDate,
            start_time: startTime,
            end_time: endTime,
            limit: 100,
          },
        },
      );
      if (error) return [];
      return data.trips.map(toRouteTrip);
    },
    enabled: !!routeId,
    staleTime: 60 * 1000,
  });
}

function toRouteTrip(trip: RouteTripResponse["trips"][number]): RouteTrip {
  return {
    id: trip.id,
    tripId: trip.trip_id,
    routeId: trip.route_id,
    serviceId: trip.service_id,
    shapeId: trip.shape_id,
    tripHeadsign: trip.trip_headsign,
    tripShortName: trip.trip_short_name,
    directionId: trip.direction_id,
    firstDepartureTime: trip.first_departure_time,
    lastDepartureTime: trip.last_departure_time,
    matchingStopTimesCount: trip.matching_stop_times_count,
  };
}
