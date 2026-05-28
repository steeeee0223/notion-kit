import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifySchema,
} from "fastify";

import { sendError, unauthorized } from "@/lib/api-error";
import { openApi } from "@/openapi";
import { getActiveConfig, getConfigAdminToken } from "@/services/config";
import { runRetention } from "@/services/repository";
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

import { realtimeSyncBodySchema, staticSyncBodySchema } from "./schema";

interface OpenApiExtension {
  adminTransportValidate: Record<string, FastifySchema>;
  adminTransportStaticSync: Record<string, FastifySchema>;
  adminTransportRealtimeSync: Record<string, FastifySchema>;
}

const api = openApi as typeof openApi & OpenApiExtension;

const documentedProviders = ["transit", "simulator"] as const;
const hiddenOpenApiSchema = { hide: true } as FastifySchema;

export function registerAdminRoutes(app: FastifyInstance) {
  for (const provider of documentedProviders) {
    app.post(
      `/api/admin/transport/${provider}/validate`,
      { schema: api.adminTransportValidate[provider] },
      (request, reply) => handleValidate(app, provider, request, reply),
    );
    app.post(
      `/api/admin/transport/${provider}/sync/static`,
      { schema: api.adminTransportStaticSync[provider] },
      (request, reply) => handleStaticSync(app, provider, request, reply),
    );
    app.post(
      `/api/admin/transport/${provider}/sync/realtime`,
      { schema: api.adminTransportRealtimeSync[provider] },
      (request, reply) => handleRealtimeSync(app, provider, request, reply),
    );
  }

  // Keep compatibility generic paths
  app.post(
    "/api/admin/transport/:provider/validate",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = (request.params ?? {}) as { provider: string };
      return handleValidate(app, provider, request, reply);
    },
  );
  app.post(
    "/api/admin/transport/:provider/sync/static",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = (request.params ?? {}) as { provider: string };
      return handleStaticSync(app, provider, request, reply);
    },
  );
  app.post(
    "/api/admin/transport/:provider/sync/realtime",
    { schema: hiddenOpenApiSchema },
    async (request, reply) => {
      const { provider } = (request.params ?? {}) as { provider: string };
      return handleRealtimeSync(app, provider, request, reply);
    },
  );

  app.post(
    "/api/admin/retention",
    { schema: openApi.adminRetention },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        await runRetention();
        return reply.send({ ok: true });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );
}

function assertAdmin(app: FastifyInstance, request: FastifyRequest) {
  if (!app.env.MAP_ADMIN_TOKEN) return;
  const header = request.headers.authorization;
  if (header !== `Bearer ${app.env.MAP_ADMIN_TOKEN}`) {
    throw unauthorized();
  }
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
  } catch {
    return {
      configAdminToken: getConfigAdminToken(app.env.MAP_ADMIN_TOKEN),
      credentials: {},
      log: app.log,
    };
  }
}

type TransportSyncMethod = keyof Pick<
  TransportProviderAdapter,
  "syncStatic" | "syncRealtime"
>;

function assertProviderMethod<TMethod extends TransportSyncMethod>(
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

async function handleValidate(
  app: FastifyInstance,
  providerKey: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    assertAdmin(app, request);
    const provider = transportProviderRegistry.get(providerKey);
    return reply.send(
      await provider.healthCheck(await buildProviderContext(app)),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

async function handleStaticSync(
  app: FastifyInstance,
  providerKey: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    assertAdmin(app, request);
    const provider = transportProviderRegistry.get(providerKey);
    assertProviderMethod(provider, "static_schedule", "syncStatic");
    const body = staticSyncBodySchema.parse(request.body ?? {});
    return reply.send(
      await provider.syncStatic(body, await buildProviderContext(app)),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

async function handleRealtimeSync(
  app: FastifyInstance,
  providerKey: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    assertAdmin(app, request);
    const provider = transportProviderRegistry.get(providerKey);
    assertProviderMethod(provider, "realtime_vehicles", "syncRealtime");
    const body = realtimeSyncBodySchema.parse(request.body ?? {});
    const response = await provider.syncRealtime(
      {
        ...body,
        timeoutMs: app.env.MAP_RT_POLL_TIMEOUT_MS,
      },
      await buildProviderContext(app),
    );
    app.wsHub.broadcastVehicles().catch((error: unknown) => {
      app.log.error(error, "Failed to broadcast realtime vehicles");
    });
    return reply.send(response);
  } catch (error) {
    return sendError(reply, error);
  }
}
