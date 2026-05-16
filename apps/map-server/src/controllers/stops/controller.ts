import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { sendError } from "@/lib/api-error";
import { openApi } from "@/openapi";
import { buildStopDepartures } from "@/services/departures";
import { getOrSetCached } from "@/services/repository";

import { departuresQuerySchema, stopParamsSchema } from "./schema";

const departuresResponseSchema = z.object({
  stop: z.unknown(),
  departures: z.array(z.unknown()),
  alerts: z.array(z.unknown()),
  meta: z.object({
    date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    realtime_available: z.boolean(),
  }),
});

export function registerStopRoutes(app: FastifyInstance) {
  app.get(
    "/api/stops/:stopId/departures",
    { schema: openApi.stopDepartures },
    async (request, reply) => {
      try {
        const params = stopParamsSchema.parse(request.params);
        const query = departuresQuerySchema.parse(request.query);
        const realtimeCacheSuffix = query.include_realtime ? "rt" : "static";
        const cacheKey = [
          "departures",
          params.stopId,
          query.date,
          query.start_time,
          realtimeCacheSuffix,
        ].join(":");
        const ttl = query.include_realtime ? 30 : 10 * 60;
        const response = await getOrSetCached(
          cacheKey,
          ttl,
          departuresResponseSchema,
          async () => {
            const data = await buildStopDepartures({
              stopId: params.stopId,
              date: query.date,
              startTime: query.start_time,
              endTime: query.end_time,
              includeRealtime: query.include_realtime,
              includeAlerts: query.include_alerts,
              limit: query.limit,
            });
            return {
              stop: data.stop,
              departures: data.departures,
              alerts: data.alerts,
              meta: {
                date: query.date,
                start_time: query.start_time,
                end_time: query.end_time,
                realtime_available: data.realtimeAvailable,
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
}
