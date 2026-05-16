import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { sendError } from "@/lib/api-error";
import { quantizeBbox } from "@/lib/schemas";
import { openApi } from "@/openapi";
import {
  findStops,
  getAlerts,
  getLatestVehicleSnapshots,
  getOrSetCached,
  getRoutesByIds,
} from "@/services/repository";
import { toStopResponse, toVehicleResponse } from "@/services/transfer";

import { mapStopsQuerySchema, mapVehiclesQuerySchema } from "./schema";

const mapStopsResponseSchema = z.object({
  stops: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  }),
});

const mapVehiclesResponseSchema = z.object({
  vehicles: z.array(z.unknown()),
  meta: z.object({ snapshot_age_seconds: z.number() }),
});

export function registerMapRoutes(app: FastifyInstance) {
  app.get(
    "/api/map/stops",
    { schema: openApi.mapStops },
    async (request, reply) => {
      try {
        const query = mapStopsQuerySchema.parse(request.query);
        const cacheKey = `stops:bbox:${quantizeBbox(query.bbox)}`;
        const response = await getOrSetCached(
          cacheKey,
          60 * 60,
          mapStopsResponseSchema,
          async () => {
            const stops = await findStops({
              bbox: query.bbox,
              limit: query.limit,
            });
            const alerts = query.include_alerts
              ? await getAlerts({
                  feedOnestopIds: [
                    ...new Set(stops.map((stop) => stop.feedOnestopId)),
                  ],
                  stopIds: stops.map((stop) => stop.id),
                })
              : [];
            return {
              stops: stops.map((stop) =>
                toStopResponse(
                  stop,
                  alerts.filter((alert) =>
                    (alert.affectedStops as string[] | null)?.includes(stop.id),
                  ),
                ),
              ),
              meta: {
                total: stops.length,
                bbox: [...query.bbox] as [number, number, number, number],
              },
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
    "/api/map/vehicles",
    { schema: openApi.mapVehicles },
    async (request, reply) => {
      try {
        const query = mapVehiclesQuerySchema.parse(request.query);
        const vehicles = await getLatestVehicleSnapshots({
          bbox: query.bbox,
          feedOnestopId: query.feed_onestop_id,
        });
        const routes = await getRoutesByIds(
          vehicles.flatMap((vehicle) =>
            vehicle.routeId ? [vehicle.routeId] : [],
          ),
        );
        const newest = vehicles.reduce(
          (max, vehicle) => Math.max(max, vehicle.capturedAt.getTime()),
          0,
        );
        const response = {
          vehicles: vehicles
            .filter((vehicle) => {
              if (typeof query.route_type !== "number") return true;
              const route = vehicle.routeId
                ? routes.get(vehicle.routeId)
                : undefined;
              return route?.routeType === query.route_type;
            })
            .map((vehicle) =>
              toVehicleResponse(
                vehicle,
                vehicle.routeId ? routes.get(vehicle.routeId) : undefined,
              ),
            ),
          meta: {
            snapshot_age_seconds: newest
              ? Math.max(0, Math.floor((Date.now() - newest) / 1000))
              : 0,
          },
        };
        return reply.send(mapVehiclesResponseSchema.parse(response));
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}
