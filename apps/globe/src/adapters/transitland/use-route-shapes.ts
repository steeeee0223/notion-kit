import { useQuery } from "@tanstack/react-query";

import { mapApiClient } from "@/lib/api-client";
import { queryKey } from "@/lib/query-key";

export interface RouteShape {
  shapeId: string;
  routeId: string;
  points: [number, number][];
}

interface TripRouteResponse {
  trip: { id: string } | null;
  route: { id: string } | null;
  shape: {
    shape_id: string;
    geojson: unknown;
    generated: boolean;
  } | null;
}

export function useRouteShapes(
  tripId: string | null,
  fallbackRouteId?: string | null,
) {
  return useQuery<RouteShape[]>({
    queryKey: queryKey.mapServer.tripRoute(tripId ?? fallbackRouteId ?? null),
    queryFn: async () => {
      if (!tripId && !fallbackRouteId) return [];

      const { data, error } = tripId
        ? await mapApiClient<TripRouteResponse>(
            `/api/trips/${encodeURIComponent(tripId)}/route`,
            { query: { include_shape: true } },
          )
        : await mapApiClient<TripRouteResponse>("/api/map/route-shape", {
            query: { route_id: fallbackRouteId!, include_shape: true },
          });
      if (error) return [];
      return toRouteShapes(data);
    },
    enabled: !!(tripId ?? fallbackRouteId),
    staleTime: 5 * 60 * 1000,
  });
}

function toRouteShapes(response: TripRouteResponse): RouteShape[] {
  const shape = response.shape;
  if (!shape) return [];

  const routeId = response.route?.id ?? response.trip?.id ?? shape.shape_id;
  const lines = getLineCoordinates(shape.geojson);

  return lines.map((points, index) => ({
    shapeId:
      lines.length === 1 ? shape.shape_id : `${shape.shape_id}-${index + 1}`,
    routeId,
    points,
  }));
}

function getLineCoordinates(geojson: unknown): [number, number][][] {
  if (!geojson || typeof geojson !== "object") return [];
  const value = geojson as {
    type?: string;
    coordinates?: unknown;
    geometry?: unknown;
    features?: unknown;
  };

  if (value.type === "Feature") return getLineCoordinates(value.geometry);
  if (value.type === "FeatureCollection" && Array.isArray(value.features)) {
    return value.features.flatMap(getLineCoordinates);
  }
  if (value.type === "LineString") {
    return isLineString(value.coordinates) ? [value.coordinates] : [];
  }
  if (value.type === "MultiLineString") {
    return Array.isArray(value.coordinates)
      ? value.coordinates.filter(isLineString)
      : [];
  }

  return [];
}

function isLineString(value: unknown): value is [number, number][] {
  return (
    Array.isArray(value) &&
    value.every(
      (point) =>
        Array.isArray(point) &&
        point.length >= 2 &&
        typeof point[0] === "number" &&
        typeof point[1] === "number",
    )
  );
}
