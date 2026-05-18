import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { sendError } from "@/lib/api-error";
import { openApi } from "@/openapi";
import {
  getAlerts,
  getOrSetCached,
  getRoutesByIds,
  getShape,
  getStopsByIds,
  getStopTimesByTrip,
  getTrip,
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
        const cacheKey = `trip:${params.tripId}:route:${query.include_shape}`;
        const response = await getOrSetCached(
          cacheKey,
          24 * 60 * 60,
          tripRouteResponseSchema,
          async () => {
            const trip = await getTrip(params.tripId);
            const routeMap = await getRoutesByIds([trip.routeId]);
            const route = routeMap.get(trip.routeId);
            const shape =
              query.include_shape && trip.shapeId
                ? await getShape(trip.shapeId)
                : null;
            const alerts = await getAlerts({
              feedOnestopIds: [trip.feedOnestopId],
              routeIds: [trip.routeId],
            });
            return {
              trip: toTripResponse(trip),
              route: route ? toRouteResponse(route) : null,
              shape: toShapeResponse(shape),
              alerts: alerts.map(toAlertResponse),
            };
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
            const trip = await getTrip(params.tripId);
            const routeMap = await getRoutesByIds([trip.routeId]);
            const route = routeMap.get(trip.routeId);
            const stopTimeRows = await getStopTimesByTrip(trip.id);
            const stopMap = await getStopsByIds(
              stopTimeRows.map((st) => st.stopId),
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
                  stopMap.get(st.stopId),
                  updateByStop.get(st.stopId),
                  query.include_geometry,
                ),
              ),
            };
          },
        );
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
