import type { FastifyInstance } from "fastify";
import { z } from "zod/v4";

import { notFound, sendError } from "@/lib/api-error";
import { quantizeBbox } from "@/lib/schemas";
import { openApi } from "@/openapi";
import {
  findRoutes,
  findStops,
  findTripsByRoute,
  findTripsByRouteInTimeRange,
  getActiveServices,
  getAlerts,
  getFeedsByIds,
  getLatestVehicleSnapshots,
  getOrSetCached,
  getRoutesByIds,
  getShape,
  getStaticFeedCounts,
  getStopsByIds,
  getStopTimesByTrip,
  getTripsByRouteId,
} from "@/services/repository";
import { buildStaticFeedStatusCandidates } from "@/services/static-feed-status";
import {
  toRouteResponse,
  toRouteTripSummaryResponse,
  toShapeResponse,
  toStopResponse,
  toTripResponse,
  toVehicleResponse,
} from "@/services/transfer";
import { TransitlandClient } from "@/services/transitland/client";

import {
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
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

const mapTripsResponseSchema = z.object({
  trips: z.array(z.unknown()),
  meta: z.object({
    total: z.number(),
    route_id: z.string(),
    service_date: z.string(),
    start_time: z.string(),
    end_time: z.string(),
  }),
});

const mapRouteShapeResponseSchema = z.object({
  trip: z.unknown().nullable(),
  route: z.unknown(),
  shape: z.unknown().nullable(),
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
    "/api/map/trips",
    { schema: openApi.mapTrips },
    async (request, reply) => {
      try {
        const query = mapTripsQuerySchema.parse(request.query);
        const routeMap = await getRoutesByIds([query.route_id]);
        const route = routeMap.get(query.route_id);
        if (!route)
          throw notFound("Route not found", { routeId: query.route_id });

        const activeServices = await getActiveServices(
          route.feedOnestopId,
          query.service_date,
        );
        const staticCounts = await getStaticFeedCounts(route.feedOnestopId);
        const tripRows =
          staticCounts.stopTimes > 0 && activeServices.size > 0
            ? await findTripsByRouteInTimeRange({
                routeId: query.route_id,
                serviceIds: [...activeServices],
                startTime: query.start_time,
                endTime: query.end_time,
                directionId: query.direction_id,
                limit: query.limit,
              })
            : (
                await findTripsByRoute({
                  routeId: query.route_id,
                  serviceIds:
                    activeServices.size > 0 ? [...activeServices] : undefined,
                  directionId: query.direction_id,
                  limit: query.limit,
                })
              ).map((trip) => ({
                trip,
                firstDepartureTime: null,
                lastDepartureTime: null,
                stopCount: 0,
              }));
        const response = mapTripsResponseSchema.parse({
          trips: tripRows.map(toRouteTripSummaryResponse),
          meta: {
            total: tripRows.length,
            route_id: query.route_id,
            service_date: query.service_date,
            start_time: query.start_time,
            end_time: query.end_time,
          },
        });
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/map/route-shape",
    { schema: openApi.mapRouteShape },
    async (request, reply) => {
      try {
        const query = mapRouteShapeQuerySchema.parse(request.query);
        const routeMap = await getRoutesByIds([query.route_id]);
        const route = routeMap.get(query.route_id);
        if (!route)
          throw notFound("Route not found", { routeId: query.route_id });

        const [trip] = await getTripsByRouteId(query.route_id, 1);
        const response = mapRouteShapeResponseSchema.parse({
          trip: trip ? toTripResponse(trip) : null,
          route: toRouteResponse(route),
          shape: trip
            ? await getShapeResponseForTrip(trip, query.include_shape)
            : null,
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

type TripRow = Awaited<ReturnType<typeof getTripsByRouteId>>[number];

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
