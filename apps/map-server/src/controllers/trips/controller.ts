import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { sendError } from "@/lib/api-error";
import { openApi } from "@/openapi";
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

import {
  tripParamsSchema,
  tripRouteQuerySchema,
  tripStopTimesQuerySchema,
} from "./schema";

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

export function registerTripRoutes(app: FastifyInstance) {
  app.get(
    "/api/trips/:tripId/route",
    { schema: openApi.tripRoute },
    async (request, reply) => {
      try {
        const params = tripParamsSchema.parse(request.params);
        const query = tripRouteQuerySchema.parse(request.query);
        const cacheKey = [
          "trip",
          params.tripId,
          "route",
          query.include_shape,
          query.fallback_route_id ?? "none",
          "v2",
        ].join(":");
        const response = await getOrSetCached(
          cacheKey,
          24 * 60 * 60,
          tripRouteResponseSchema,
          async () => {
            try {
              const trip = await getTrip(params.tripId);
              const routeMap = await getRoutesByIds([trip.routeId]);
              const route = routeMap.get(trip.routeId);
              const shape = await getShapeResponseForTrip(
                trip,
                query.include_shape,
              );
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
              if (
                error &&
                typeof error === "object" &&
                "statusCode" in error &&
                (error as { statusCode?: number }).statusCode === 404
              ) {
                let fallbackRouteId = query.fallback_route_id;
                if (!fallbackRouteId) {
                  const [vehicle] = await getLatestVehicleSnapshots({
                    tripId: params.tripId,
                    limit: 1,
                  });
                  if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
                }
                let route = null;
                let alerts: any[] = [];
                let shape = null;
                if (fallbackRouteId) {
                  const routeMap = await getRoutesByIds([fallbackRouteId]);
                  route = routeMap.get(fallbackRouteId) ?? null;
                  alerts = await getAlerts({ routeIds: [fallbackRouteId] });
                  const fallbackTrips = await getTripsByRouteId(
                    fallbackRouteId,
                    1,
                  );
                  if (fallbackTrips[0]) {
                    shape = await getShapeResponseForTrip(
                      fallbackTrips[0],
                      query.include_shape,
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
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/trips/:tripId/stop-times",
    { schema: openApi.tripStopTimes },
    async (request, reply) => {
      try {
        const params = tripParamsSchema.parse(request.params);
        const query = tripStopTimesQuerySchema.parse(request.query);
        const cacheKey = `trip:${params.tripId}:stoptimes:${query.date}:${query.include_realtime}:${query.include_geometry}`;
        const ttl = query.include_realtime ? 20 : 60 * 60;
        const response = await getOrSetCached(
          cacheKey,
          ttl,
          tripStopTimesResponseSchema,
          async () => {
            try {
              const trip = await getTrip(params.tripId);
              const routeMap = await getRoutesByIds([trip.routeId]);
              const route = routeMap.get(trip.routeId);
              const stopTimeRows = await getStopTimesByTrip(trip.id);
              const stopMap = await getStopsByIds(
                stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
              );
              const updates = query.include_realtime
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
                    query.include_geometry,
                  ),
                ),
              };
            } catch (error) {
              if (
                error &&
                typeof error === "object" &&
                "statusCode" in error &&
                (error as { statusCode?: number }).statusCode === 404
              ) {
                let fallbackRouteId = query.fallback_route_id;
                if (!fallbackRouteId) {
                  const [vehicle] = await getLatestVehicleSnapshots({
                    tripId: params.tripId,
                    limit: 1,
                  });
                  if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
                }
                let stopTimeRows: any[] = [];
                let stopMap = new Map();
                if (fallbackRouteId) {
                  const fallbackTrips = await getTripsByRouteId(
                    fallbackRouteId,
                    1,
                  );
                  if (fallbackTrips[0]) {
                    stopTimeRows = await getStopTimesByTrip(
                      fallbackTrips[0].id,
                    );
                    stopMap = await getStopsByIds(
                      stopTimeRows.flatMap((st) =>
                        st.stopId ? [st.stopId] : [],
                      ),
                    );
                  }
                }
                return {
                  trip_id: params.tripId,
                  route_short_name: null,
                  service_date: query.date,
                  stop_times: stopTimeRows.map((st) =>
                    toTripStopTimeResponse(
                      st,
                      st.stopId ? stopMap.get(st.stopId) : undefined,
                      undefined,
                      query.include_geometry,
                    ),
                  ),
                };
              }
              throw error;
            }
          },
        );
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

type TripRow = Awaited<ReturnType<typeof getTrip>>;

async function getShapeResponseForTrip(
  trip: TripRow,
  includeShape: boolean,
) {
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
