import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";

export interface StopDeparture {
  tripId: string;
  tripHeadsign: string;
  routeShortName: string;
  routeLongName: string;
  routeColor: string | null;
  routeType: number;
  directionId: number;
  scheduledArrival: string | null;
  scheduledDeparture: string | null;
  estimatedArrival: string | null;
  estimatedDeparture: string | null;
  serviceDate: string;
}

interface TransitlandDeparture {
  trip: {
    trip_id: string;
    trip_headsign: string;
    direction_id: number;
    route: {
      route_short_name: string;
      route_long_name: string;
      route_type: number;
      route_color: string | null;
    };
  };
  arrival: { scheduled: string | null; estimated: string | null };
  departure: { scheduled: string | null; estimated: string | null };
  service_date: string;
}

function transferDeparture(dep: TransitlandDeparture): StopDeparture {
  return {
    tripId: dep.trip.trip_id,
    tripHeadsign: dep.trip.trip_headsign,
    routeShortName: dep.trip.route.route_short_name,
    routeLongName: dep.trip.route.route_long_name,
    routeColor: dep.trip.route.route_color,
    routeType: dep.trip.route.route_type,
    directionId: dep.trip.direction_id,
    scheduledArrival: dep.arrival.scheduled,
    scheduledDeparture: dep.departure.scheduled,
    estimatedArrival: dep.arrival.estimated,
    estimatedDeparture: dep.departure.estimated,
    serviceDate: dep.service_date,
  };
}

export function useStopDepartures(stopKey: string | null) {
  return useQuery<StopDeparture[]>({
    queryKey: ["transitland", "departures", stopKey],
    queryFn: async () => {
      if (!stopKey) return [];
      const { data, error } = await mapApiClient<{
        stops: { departures: TransitlandDeparture[] }[];
      }>(`/transitland/stops/${encodeURIComponent(stopKey)}/departures`, {
        query: { next: 7200 },
      });
      if (error) return [];
      const deps = data.stops[0]?.departures ?? [];
      return deps.map(transferDeparture);
    },
    enabled: !!stopKey,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
