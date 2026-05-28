import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
} from "fastify";

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
  providerTripParamsSchema,
  staticFeedsStatusQuerySchema,
  tripRouteQuerySchema,
  tripStopTimesQuerySchema,
} from "./schema";

interface OpenApiExtension {
  transportStaticFeedsStatus: Record<string, FastifySchema>;
  transportRoutes: Record<string, FastifySchema>;
  transportStops: Record<string, FastifySchema>;
  transportTrips: Record<string, FastifySchema>;
  transportRouteShape: Record<string, FastifySchema>;
  transportStopDepartures: Record<string, FastifySchema>;
  transportVehicles: Record<string, FastifySchema>;
  transportTripRoute: Record<string, FastifySchema>;
  transportTripStopTimes: Record<string, FastifySchema>;
}

const api = openApi as typeof openApi & OpenApiExtension;

const documentedProviders = ["transit", "simulator"] as const;
const hiddenOpenApiSchema = { hide: true } as FastifySchema;

export function registerTransportRoutes(app: FastifyInstance) {
  for (const provider of documentedProviders) {
    app.get(
      `/api/transport/${provider}/static-feeds/status`,
      { schema: api.transportStaticFeedsStatus[provider] },
      (request, reply) =>
        handleStaticFeedsStatus(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/routes`,
      { schema: api.transportRoutes[provider] },
      (request, reply) => handleRoutes(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/stops`,
      { schema: api.transportStops[provider] },
      (request, reply) => handleStops(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/trips`,
      { schema: api.transportTrips[provider] },
      (request, reply) => handleTrips(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/route-shape`,
      { schema: api.transportRouteShape[provider] },
      (request, reply) => handleRouteShape(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/stops/:stopId/departures`,
      { schema: api.transportStopDepartures[provider] },
      (request, reply) => {
        const { stopId } = request.params as { stopId: string };
        return handleDepartures(app, provider, stopId, request, reply);
      },
    );
    app.get(
      `/api/transport/${provider}/vehicles`,
      { schema: api.transportVehicles[provider] },
      (request, reply) => handleVehicles(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/trips/:tripId/route`,
      { schema: api.transportTripRoute[provider] },
      (request, reply) => handleTripRoute(app, provider, request, reply),
    );
    app.get(
      `/api/transport/${provider}/trips/:tripId/stop-times`,
      { schema: api.transportTripStopTimes[provider] },
      (request, reply) => handleTripStopTimes(app, provider, request, reply),
    );
  }

  // Keep compatibility with legacy generic `:provider` routes (without openapi schemas since they are now registered above)
  app.get(
    "/api/transport/:provider/static-feeds/status",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleStaticFeedsStatus(app, provider, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/routes",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleRoutes(app, provider, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/stops",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleStops(app, provider, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/trips",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleTrips(app, provider, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/route-shape",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleRouteShape(app, provider, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/stops/:stopId/departures",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider, stopId } = providerStopParamsSchema.parse(
        request.params,
      );
      return handleDepartures(app, provider, stopId, request, reply);
    },
  );
  app.get(
    "/api/transport/:provider/vehicles",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = providerParamsSchema.parse(request.params);
      return handleVehicles(app, provider, request, reply);
    },
  );
}

async function buildProviderContext(
  app: FastifyInstance,
): Promise<ProviderContext> {
  try {
    const activeConfig = await getActiveConfig(app.env.MAP_ADMIN_TOKEN);
    return {
      configAdminToken: activeConfig.adminToken,
      credentials: activeConfig.credentials,
      log: app.log,
    };
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      return {
        configAdminToken: getConfigAdminToken(app.env.MAP_ADMIN_TOKEN),
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
  | "findTripRoute"
  | "findTripStopTimes"
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

async function handleStaticFeedsStatus(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleRoutes(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleStops(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleTrips(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleRouteShape(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleDepartures(
  app: FastifyInstance,
  provider: string,
  stopId: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleVehicles(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
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
}

async function handleTripRoute(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = providerTripParamsSchema.parse({
      provider,
      ...(request.params ?? {}),
    });
    const query = tripRouteQuerySchema.parse(request.query);
    const adapter = transportProviderRegistry.get(params.provider);
    assertProviderMethod(adapter, "static_schedule", "findTripRoute");
    const context = await buildProviderContext(app);
    return reply.send(
      await adapter.findTripRoute(
        {
          tripId: params.tripId,
          includeShape: query.include_shape,
          fallbackRouteId: query.fallback_route_id,
        },
        context,
      ),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

async function handleTripStopTimes(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = providerTripParamsSchema.parse({
      provider,
      ...(request.params ?? {}),
    });
    const query = tripStopTimesQuerySchema.parse(request.query);
    const adapter = transportProviderRegistry.get(params.provider);
    assertProviderMethod(adapter, "static_schedule", "findTripStopTimes");
    const context = await buildProviderContext(app);
    return reply.send(
      await adapter.findTripStopTimes(
        {
          tripId: params.tripId,
          date: query.date,
          includeRealtime: query.include_realtime,
          includeGeometry: query.include_geometry,
          fallbackRouteId: query.fallback_route_id,
        },
        context,
      ),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}
