import { useQuery } from "@tanstack/react-query";

import type { RouteStop } from "@/adapters/transitland/use-route-stops";
import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";

export type StaticFeedStatus = "missing" | "current" | "stale" | "unknown";

export interface StaticFeedCounts {
  stops: number;
  routes: number;
  trips: number;
  stopTimes: number;
}

export interface StaticFeedCandidate {
  feed_lookup_key: string;
  feed_onestop_id: string;
  name: string | null;
  spec: string | null;
  status: StaticFeedStatus;
  is_strong_match: boolean;
  version: {
    sha1: string | null;
    fetched_at: string | null;
  };
  local: {
    exists: boolean;
    sha1: string | null;
    fetched_at: string | null;
    last_static_sync: string | null;
    counts: StaticFeedCounts;
  };
}

export interface StaticFeedSelection {
  feedLookupKey: string;
  feedOnestopId: string;
  name: string | null;
  status: StaticFeedStatus;
  counts: StaticFeedCounts;
}

export interface TransitRoute {
  id: string;
  feed_onestop_id: string;
  route_id: string;
  route_short_name: string | null;
  route_long_name: string | null;
  route_type: number | null;
  route_color: string | null;
  agency_name: string | null;
}

export interface TransitStop {
  id: string;
  feed_onestop_id: string;
  stop_id: string;
  stop_name: string | null;
  stop_code: string | null;
  lat: number | null;
  lon: number | null;
}

export interface StaticFeedStatusResponse {
  candidates: StaticFeedCandidate[];
  meta: {
    bbox: [number, number, number, number];
    total: number;
  };
}

export interface RoutesResponse {
  routes: TransitRoute[];
}

export interface StopsResponse {
  stops: TransitStop[];
}

export function useStaticFeedStatus<T = StaticFeedStatusResponse>(
  bbox: string | null,
  enabled: boolean,
  selector?: (data: StaticFeedStatusResponse) => T,
) {
  return useQuery<StaticFeedStatusResponse, Error, T>({
    queryKey: queryKey.mapServer.staticFeedStatus(bbox),
    queryFn: async () => {
      if (!bbox) {
        return { candidates: [], meta: { bbox: [0, 0, 0, 0], total: 0 } };
      }
      const { data, error } = await mapApiClient<StaticFeedStatusResponse>(
        "/api/map/static-feeds/status",
        { query: { bbox } },
      );
      if (error) throw toError(error);
      return data;
    },
    select: selector,
    enabled: enabled && !!bbox,
    staleTime: 60 * 1000,
  });
}

export function useFeedRoutes<T = TransitRoute[]>(
  feedOnestopId: string | null,
  enabled: boolean,
  selector: (data: RoutesResponse) => T = selectRoutes as (
    data: RoutesResponse,
  ) => T,
) {
  return useQuery<RoutesResponse, Error, T>({
    queryKey: queryKey.mapServer.routes(feedOnestopId),
    queryFn: async () => {
      if (!feedOnestopId) return { routes: [] };
      const { data, error } = await mapApiClient<RoutesResponse>(
        "/api/map/routes",
        { query: { feed_onestop_id: feedOnestopId, limit: 500 } },
      );
      if (error) throw toError(error);
      return data;
    },
    select: selector,
    enabled: enabled && !!feedOnestopId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeedStops<T = RouteStop[]>(
  feedOnestopId: string | null,
  enabled: boolean,
  selector: (data: StopsResponse) => T = selectRouteStops as (
    data: StopsResponse,
  ) => T,
) {
  return useQuery<StopsResponse, Error, T>({
    queryKey: queryKey.mapServer.stops(feedOnestopId),
    queryFn: async () => {
      if (!feedOnestopId) return { stops: [] };
      const { data, error } = await mapApiClient<StopsResponse>(
        "/api/map/stops",
        { query: { feed_onestop_id: feedOnestopId, limit: 500 } },
      );
      if (error) throw toError(error);
      return data;
    },
    select: selector,
    enabled: enabled && !!feedOnestopId,
    staleTime: 5 * 60 * 1000,
  });
}

export function toStaticFeedSelection(
  candidate: StaticFeedCandidate,
): StaticFeedSelection {
  return {
    feedLookupKey: candidate.feed_lookup_key,
    feedOnestopId: candidate.feed_onestop_id,
    name: candidate.name,
    status: candidate.status,
    counts: candidate.local.counts,
  };
}

export function hasReadableStaticRows(
  selection: Pick<StaticFeedSelection, "counts">,
) {
  return (
    selection.counts.stops > 0 &&
    selection.counts.routes > 0 &&
    selection.counts.trips > 0
  );
}

export function isUsableStaticFeed(selection: StaticFeedSelection | null) {
  if (!selection) return false;
  if (selection.status === "current") return true;
  return selection.status === "unknown" && hasReadableStaticRows(selection);
}

function selectRoutes(data: RoutesResponse) {
  return data.routes;
}

function selectRouteStops(data: StopsResponse) {
  return data.stops.flatMap(toRouteStop);
}

function toRouteStop(stop: TransitStop): RouteStop[] {
  if (typeof stop.lat !== "number" || typeof stop.lon !== "number") return [];
  return [
    {
      id: stop.id,
      stopId: stop.stop_id,
      stopName: stop.stop_name ?? "Unknown stop",
      longitude: stop.lon,
      latitude: stop.lat,
      routeShortNames: [],
    },
  ];
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}
