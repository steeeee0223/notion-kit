import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import {
  getAlerts,
  getLatestVehicleSnapshots,
  getOrSetCached,
  getRoutesByIds,
  getShape,
  getStopsByIds,
  getStopTimesByTrip,
  getTrip,
  getTripsByRouteId,
  getTripUpdates,
} from "@/services/repository";
import {
  toAlertResponse,
  toRouteResponse,
  toShapeResponse,
  toTripResponse,
  toTripStopTimeResponse,
} from "@/services/transfer";

const tripRouteResponseSchema = z.object({
  trip: z.unknown(),
  route: z.unknown(),
  shape: z.unknown().nullable(),
  alerts: z.array(z.unknown()),
});

const tripStopTimesResponseSchema = z.object({
  trip_id: z.string(),
  route_short_name: z.string().nullable(),
  service_date: z.string(),
  stop_times: z.array(z.unknown()),
});

type AlertRows = Awaited<ReturnType<typeof getAlerts>>;
type StopTimeRows = Awaited<ReturnType<typeof getStopTimesByTrip>>;
type StopMap = Awaited<ReturnType<typeof getStopsByIds>>;

export function registerTripRoutes(_app: FastifyInstance) {
  // noop
}

export async function buildTripRouteResponse(query: {
  tripId: string;
  includeShape: boolean;
  fallbackRouteId?: string;
}) {
  const cacheKey = [
    "trip",
    query.tripId,
    "route",
    query.includeShape,
    query.fallbackRouteId ?? "none",
    "v3",
  ].join(":");
  return getOrSetCached(
    cacheKey,
    24 * 60 * 60,
    tripRouteResponseSchema,
    async () => {
      try {
        const trip = await getTrip(query.tripId);
        const routeMap = await getRoutesByIds([trip.routeId]);
        const route = routeMap.get(trip.routeId);
        const shape = await getShapeResponseForTrip(trip, query.includeShape);
        const alerts = await getAlerts({
          feedOnestopIds: [trip.feedOnestopId],
          routeIds: [trip.routeId],
        });
        return {
          trip: toTripResponse(trip),
          route: route ? toRouteResponse(route) : null,
          shape,
          alerts: alerts.map(toAlertResponse),
        };
      } catch (error) {
        if (isNotFoundError(error)) {
          let fallbackRouteId = query.fallbackRouteId;
          if (!fallbackRouteId) {
            const [vehicle] = await getLatestVehicleSnapshots({
              tripId: query.tripId,
              limit: 1,
            });
            if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
          }
          let route = null;
          let alerts: AlertRows = [];
          let shape = null;
          if (fallbackRouteId) {
            const routeMap = await getRoutesByIds([fallbackRouteId]);
            route = routeMap.get(fallbackRouteId) ?? null;
            alerts = await getAlerts({ routeIds: [fallbackRouteId] });
            const fallbackTrips = await getTripsByRouteId(fallbackRouteId, 1);
            if (fallbackTrips[0]) {
              shape = await getShapeResponseForTrip(
                fallbackTrips[0],
                query.includeShape,
              );
            }
          }
          return {
            trip: null,
            route: route ? toRouteResponse(route) : null,
            shape,
            alerts: alerts.map(toAlertResponse),
          };
        }
        throw error;
      }
    },
  );
}

export async function buildTripStopTimesResponse(query: {
  tripId: string;
  date: string;
  includeRealtime: boolean;
  includeGeometry: boolean;
  fallbackRouteId?: string;
}) {
  const cacheKey = `trip:${query.tripId}:stoptimes:${query.date}:${query.includeRealtime}:${query.includeGeometry}:v3`;
  const ttl = query.includeRealtime ? 20 : 60 * 60;
  return getOrSetCached(
    cacheKey,
    ttl,
    tripStopTimesResponseSchema,
    async () => {
      try {
        const trip = await getTrip(query.tripId);
        const routeMap = await getRoutesByIds([trip.routeId]);
        const route = routeMap.get(trip.routeId);
        const stopTimeRows = await getStopTimesByTrip(trip.id);
        const stopMap = await getStopsByIds(
          stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
        );
        const updates = query.includeRealtime
          ? await getTripUpdates({ tripIds: [trip.id] })
          : [];
        const updateByStop = new Map(
          updates.map((update) => [update.stopId ?? "", update]),
        );
        return {
          trip_id: trip.id,
          route_short_name: route?.routeShortName ?? null,
          service_date: query.date,
          stop_times: stopTimeRows.map((st) =>
            toTripStopTimeResponse(
              st,
              st.stopId ? stopMap.get(st.stopId) : undefined,
              updateByStop.get(st.stopId ?? ""),
              query.includeGeometry,
            ),
          ),
        };
      } catch (error) {
        if (isNotFoundError(error)) {
          let fallbackRouteId = query.fallbackRouteId;
          if (!fallbackRouteId) {
            const [vehicle] = await getLatestVehicleSnapshots({
              tripId: query.tripId,
              limit: 1,
            });
            if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
          }
          let stopTimeRows: StopTimeRows = [];
          let stopMap: StopMap = new Map();
          if (fallbackRouteId) {
            const fallbackTrips = await getTripsByRouteId(fallbackRouteId, 1);
            if (fallbackTrips[0]) {
              stopTimeRows = await getStopTimesByTrip(fallbackTrips[0].id);
              stopMap = await getStopsByIds(
                stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
              );
            }
          }
          return {
            trip_id: query.tripId,
            route_short_name: null,
            service_date: query.date,
            stop_times: stopTimeRows.map((st) =>
              toTripStopTimeResponse(
                st,
                st.stopId ? stopMap.get(st.stopId) : undefined,
                undefined,
                query.includeGeometry,
              ),
            ),
          };
        }
        throw error;
      }
    },
  );
}

function isNotFoundError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    (error as { statusCode?: number }).statusCode === 404
  );
}

type TripRow = Awaited<ReturnType<typeof getTrip>>;

async function getShapeResponseForTrip(trip: TripRow, includeShape: boolean) {
  if (!includeShape) return null;

  if (trip.shapeId) {
    const shape = await getShape(trip.shapeId);
    if (shape) return toShapeResponse(shape);
  }

  return buildGeneratedShapeResponse(trip);
}

async function buildGeneratedShapeResponse(trip: TripRow) {
  const stopTimeRows = await getStopTimesByTrip(trip.id);
  const stopMap = await getStopsByIds(
    stopTimeRows.flatMap((stopTime) =>
      stopTime.stopId ? [stopTime.stopId] : [],
    ),
  );
  const coordinates: [number, number][] = [];

  for (const stopTime of stopTimeRows) {
    const stop = stopTime.stopId ? stopMap.get(stopTime.stopId) : undefined;
    if (typeof stop?.lon !== "number" || typeof stop.lat !== "number") {
      continue;
    }

    const previous = coordinates.at(-1);
    if (previous?.[0] === stop.lon && previous[1] === stop.lat) {
      continue;
    }
    coordinates.push([stop.lon, stop.lat]);
  }

  if (coordinates.length < 2) return null;

  return {
    shape_id: `${trip.tripId}:generated-stops`,
    geojson: {
      type: "LineString",
      coordinates,
    },
    points: coordinates.map(([lon, lat], index) => ({
      shape_pt_lat: lat,
      shape_pt_lon: lon,
      shape_pt_sequence: index + 1,
      shape_dist_traveled: null,
    })),
    generated: true,
  };
}
