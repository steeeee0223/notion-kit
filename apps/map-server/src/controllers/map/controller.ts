import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { sendError } from "@/lib/api-error";
import { quantizeBbox } from "@/lib/schemas";
import { openApi } from "@/openapi";
import {
  findRoutes,
  findStops,
  getAlerts,
  getFeedsByIds,
  getLatestVehicleSnapshots,
  getOrSetCached,
  getRoutesByIds,
  getStaticFeedCounts,
} from "@/services/repository";
import { buildStaticFeedStatusCandidates } from "@/services/static-feed-status";
import {
  toRouteResponse,
  toStopResponse,
  toVehicleResponse,
} from "@/services/transfer";
import { TransitlandClient } from "@/services/transitland/client";

import {
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapVehiclesQuerySchema,
  staticFeedsStatusQuerySchema,
} from "./schema";

const mapStopsResponseSchema = z.object({
  stops: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    feed_onestop_id: z.string().optional(),
    static_feed: z.unknown().optional(),
  }),
});

const mapRoutesResponseSchema = z.object({
  routes: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    feed_onestop_id: z.string(),
    static_feed: z.unknown().optional(),
  }),
});

const mapVehiclesResponseSchema = z.object({
  vehicles: z.array(z.unknown()),
  meta: z.object({
    snapshot_age_seconds: z.number(),
    snapshot_available: z.boolean(),
    message: z.string().optional(),
    auto_sync: z.unknown().optional(),
  }),
});

export function registerMapRoutes(app: FastifyInstance) {
  app.get(
    "/api/map/static-feeds/status",
    { schema: openApi.mapStaticFeedsStatus },
    async (request, reply) => {
      try {
        const query = staticFeedsStatusQuerySchema.parse(request.query);
        const transitland = new TransitlandClient();
        const feeds = await transitland.discoverFeeds({ bbox: query.bbox });
        const candidates = await buildStaticFeedStatusCandidates(feeds);
        return reply.send({
          candidates,
          meta: {
            bbox: [...query.bbox] as [number, number, number, number],
            total: candidates.length,
          },
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/map/routes",
    { schema: openApi.mapRoutes },
    async (request, reply) => {
      try {
        const query = mapRoutesQuerySchema.parse(request.query);
        const routes = await findRoutes({
          feedOnestopId: query.feed_onestop_id,
          routeType: query.route_type,
          limit: query.limit,
        });
        const response = mapRoutesResponseSchema.parse({
          routes: routes.map(toRouteResponse),
          meta: {
            total: routes.length,
            feed_onestop_id: query.feed_onestop_id,
            static_feed: await getCachedStaticFeedMeta(query.feed_onestop_id),
          },
        });
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/map/stops",
    { schema: openApi.mapStops },
    async (request, reply) => {
      try {
        const query = mapStopsQuerySchema.parse(request.query);
        if (query.feed_onestop_id) {
          return reply.send(
            mapStopsResponseSchema.parse(await buildStopsResponse(query)),
          );
        }
        const cacheKey = [
          "stops",
          query.bbox ? `bbox:${quantizeBbox(query.bbox)}` : null,
          `limit:${query.limit}`,
          `alerts:${query.include_alerts}`,
        ]
          .filter(Boolean)
          .join(":");
        const response = await getOrSetCached(
          cacheKey,
          60 * 60,
          mapStopsResponseSchema,
          async () => buildStopsResponse(query),
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
        const snapshotAvailable = vehicles.length > 0;
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
            snapshot_available: snapshotAvailable,
            ...(vehicles.length === 0
              ? {
                  message: snapshotAvailable
                    ? "No recent vehicle snapshots matched the current viewport or filters."
                    : "No recent vehicle snapshots are available.",
                }
              : {}),
          },
        };
        return reply.send(mapVehiclesResponseSchema.parse(response));
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

async function buildStopsResponse(query: z.infer<typeof mapStopsQuerySchema>) {
  const stops = await findStops({
    bbox: query.bbox,
    feedOnestopId: query.feed_onestop_id,
    limit: query.limit,
  });
  const alerts = query.include_alerts
    ? await getAlerts({
        feedOnestopIds: [...new Set(stops.map((stop) => stop.feedOnestopId))],
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
      ...(query.bbox
        ? {
            bbox: [...query.bbox] as [number, number, number, number],
          }
        : {}),
      ...(query.feed_onestop_id
        ? {
            feed_onestop_id: query.feed_onestop_id,
            static_feed: await getCachedStaticFeedMeta(query.feed_onestop_id),
          }
        : {}),
    },
  };
}

async function getCachedStaticFeedMeta(feedOnestopId: string) {
  const feeds = await getFeedsByIds([feedOnestopId]);
  const feed = feeds.get(feedOnestopId);
  const counts = await getStaticFeedCounts(feedOnestopId);
  if (!feed) {
    return {
      feed_onestop_id: feedOnestopId,
      status: "missing",
      sha1: null,
      fetched_at: null,
      last_static_sync: null,
      counts,
    };
  }
  const hasReadableRows =
    counts.stops > 0 && counts.routes > 0 && counts.trips > 0;
  return {
    feed_onestop_id: feed.onestopId,
    status: hasReadableRows ? "unknown" : "missing",
    sha1: feed.sha1Current,
    fetched_at: feed.fetchedAt?.toISOString() ?? null,
    last_static_sync: feed.lastStaticSync?.toISOString() ?? null,
    counts,
  };
}
