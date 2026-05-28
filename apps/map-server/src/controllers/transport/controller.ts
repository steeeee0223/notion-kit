import type { FastifyInstance } from "fastify";

import { ApiError, sendError } from "@/lib/api-error";
import { openApi } from "@/openapi";
import { getActiveConfig, getConfigAdminToken } from "@/services/config";
import { unsupportedCapability } from "@/services/transport/errors";
import {
  assertProviderCapability,
  transportProviderRegistry,
} from "@/services/transport/registry";
import type {
  ProviderCapability,
  ProviderContext,
  TransportProviderAdapter,
} from "@/services/transport/types";

import {
  departuresQuerySchema,
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
  mapVehiclesQuerySchema,
  providerParamsSchema,
  providerStopParamsSchema,
  staticFeedsStatusQuerySchema,
} from "./schema";

export function registerTransportRoutes(app: FastifyInstance) {
  app.get(
    "/api/transport/:provider/static-feeds/status",
    async (request, reply) => {
      try {
        const { provider } = providerParamsSchema.parse(request.params);
        const query = staticFeedsStatusQuerySchema.parse(request.query);
        const adapter = transportProviderRegistry.get(provider);
        assertProviderMethod(adapter, "static_schedule", "discoverStaticFeeds");
        const context = await buildProviderContext(app);
        return reply.send(
          await adapter.discoverStaticFeeds({ bbox: query.bbox }, context),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/transport/:provider/routes",
    { schema: openApi.transportRoutes },
    async (request, reply) => {
      try {
        const { provider } = providerParamsSchema.parse(request.params);
        const query = mapRoutesQuerySchema.parse(request.query);
        const adapter = transportProviderRegistry.get(provider);
        assertProviderMethod(adapter, "static_schedule", "findRoutes");
        const context = await buildProviderContext(app);
        return reply.send(
          await adapter.findRoutes(
            {
              feedOnestopId: query.feed_onestop_id,
              routeType: query.route_type,
              limit: query.limit,
            },
            context,
          ),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/transport/:provider/stops",
    { schema: openApi.transportStops },
    async (request, reply) => {
      try {
        const { provider } = providerParamsSchema.parse(request.params);
        const query = mapStopsQuerySchema.parse(request.query);
        const adapter = transportProviderRegistry.get(provider);
        assertProviderMethod(adapter, "static_schedule", "findStops");
        const context = await buildProviderContext(app);
        return reply.send(
          await adapter.findStops(
            {
              bbox: query.bbox,
              feedOnestopId: query.feed_onestop_id,
              includeAlerts: query.include_alerts,
              limit: query.limit,
            },
            context,
          ),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get("/api/transport/:provider/trips", async (request, reply) => {
    try {
      const { provider } = providerParamsSchema.parse(request.params);
      const query = mapTripsQuerySchema.parse(request.query);
      const adapter = transportProviderRegistry.get(provider);
      assertProviderMethod(adapter, "static_schedule", "findTrips");
      const context = await buildProviderContext(app);
      return reply.send(
        await adapter.findTrips(
          {
            routeId: query.route_id,
            serviceDate: query.service_date,
            startTime: query.start_time,
            endTime: query.end_time,
            directionId: query.direction_id,
            limit: query.limit,
          },
          context,
        ),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/route-shape", async (request, reply) => {
    try {
      const { provider } = providerParamsSchema.parse(request.params);
      const query = mapRouteShapeQuerySchema.parse(request.query);
      const adapter = transportProviderRegistry.get(provider);
      assertProviderMethod(adapter, "static_schedule", "findRouteShape");
      const context = await buildProviderContext(app);
      return reply.send(
        await adapter.findRouteShape(
          {
            routeId: query.route_id,
            includeShape: query.include_shape,
          },
          context,
        ),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get(
    "/api/transport/:provider/stops/:stopId/departures",
    async (request, reply) => {
      try {
        const { provider, stopId } = providerStopParamsSchema.parse(
          request.params,
        );
        const query = departuresQuerySchema.parse(request.query);
        const adapter = transportProviderRegistry.get(provider);
        assertProviderMethod(adapter, "departures", "findDepartures");
        const context = await buildProviderContext(app);
        return reply.send(
          await adapter.findDepartures(
            {
              stopId,
              date: query.date,
              startTime: query.start_time,
              endTime: query.end_time,
              includeRealtime: query.include_realtime,
              includeAlerts: query.include_alerts,
              limit: query.limit,
            },
            context,
          ),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.get(
    "/api/transport/:provider/vehicles",
    { schema: openApi.transportVehicles },
    async (request, reply) => {
      try {
        const { provider } = providerParamsSchema.parse(request.params);
        const query = mapVehiclesQuerySchema.parse(request.query);
        const adapter = transportProviderRegistry.get(provider);
        assertProviderMethod(adapter, "realtime_vehicles", "findVehicles");
        const context = await buildProviderContext(app);
        return reply.send(
          await adapter.findVehicles(
            {
              bbox: query.bbox,
              feedOnestopId: query.feed_onestop_id,
              routeType: query.route_type,
            },
            context,
          ),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

async function buildProviderContext(
  app: FastifyInstance,
): Promise<ProviderContext> {
  try {
    const activeConfig = await getActiveConfig(app.env.MAP_ADMIN_TOKEN);
    return {
      configUser: activeConfig.adminToken,
      credentials: activeConfig.credentials,
      log: app.log,
    };
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      return {
        configUser: getConfigAdminToken(app.env.MAP_ADMIN_TOKEN),
        credentials: {},
        log: app.log,
      };
    }

    throw error;
  }
}

type TransportReadMethod = keyof Pick<
  TransportProviderAdapter,
  | "discoverStaticFeeds"
  | "findRoutes"
  | "findStops"
  | "findTrips"
  | "findRouteShape"
  | "findDepartures"
  | "findVehicles"
>;

function assertProviderMethod<TMethod extends TransportReadMethod>(
  provider: TransportProviderAdapter,
  capability: ProviderCapability,
  method: TMethod,
): asserts provider is TransportProviderAdapter &
  Required<Pick<TransportProviderAdapter, TMethod>> {
  assertProviderCapability(provider, capability);
  if (typeof provider[method] !== "function") {
    throw unsupportedCapability(provider.key, capability);
  }
}
