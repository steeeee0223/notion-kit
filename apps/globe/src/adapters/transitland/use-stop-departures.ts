import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";

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
  trip_id: string;
  route_short_name: string | null;
  route_long_name: string | null;
  route_color: string | null;
  route_type: number | null;
  trip_headsign: string | null;
  direction_id: number | null;
  scheduled_arrival: string | null;
  scheduled_departure: string | null;
  estimated_departure: string | null;
  is_realtime: boolean;
  service_date: string;
}

function transferDeparture(dep: TransitlandDeparture): StopDeparture {
  return {
    tripId: dep.trip_id,
    tripHeadsign: dep.trip_headsign ?? "",
    routeShortName: dep.route_short_name ?? "",
    routeLongName: dep.route_long_name ?? "",
    routeColor: dep.route_color,
    routeType: dep.route_type ?? -1,
    directionId: dep.direction_id ?? -1,
    scheduledArrival: dep.scheduled_arrival,
    scheduledDeparture: dep.scheduled_departure,
    estimatedArrival: null,
    estimatedDeparture: dep.is_realtime ? dep.estimated_departure : null,
    serviceDate: dep.service_date,
  };
}

export function useStopDepartures(stopKey: string | null) {
  return useQuery<StopDeparture[]>({
    queryKey: queryKey.mapServer.stopDepartures(stopKey),
    queryFn: async () => {
      if (!stopKey) return [];
      const { data, error } = await mapApiClient<{
        departures: TransitlandDeparture[];
      }>(`/api/stops/${encodeURIComponent(stopKey)}/departures`, {
        query: { next: 7200, include_realtime: true, include_alerts: true },
      });
      if (error) return [];
      return data.departures.map(transferDeparture);
    },
    enabled: !!stopKey,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
