import type { FastifyInstance, FastifyRequest } from "fastify";

import { badRequest, sendError, unauthorized } from "@/lib/api-error";
import { openApi } from "@/openapi";
import { getActiveConfig, getConfigAdminToken } from "@/services/config";
import { buildStaticImportResult } from "@/services/gtfs/data-transfer";
import { importGtfsStaticFeed } from "@/services/gtfs/static-import";
import { syncRealtimeFeeds } from "@/services/realtime/gtfs-rt";
import {
  getFeedsByIds,
  getStaticFeedCounts,
  runRetention,
} from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  TransitlandClient,
} from "@/services/transitland/client";
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

export function registerAdminRoutes(app: FastifyInstance) {
  app.post(
    "/api/admin/transport/:provider/validate",
    { schema: openApi.adminTransportValidate },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const { provider: providerKey } = (request.params ?? {}) as {
          provider: string;
        };
        const provider = transportProviderRegistry.get(providerKey);
        return reply.send(
          await provider.healthCheck(await buildProviderContext(app)),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.post(
    "/api/admin/transport/:provider/sync/static",
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const { provider: providerKey } = (request.params ?? {}) as {
          provider: string;
        };
        const provider = transportProviderRegistry.get(providerKey);
        assertProviderMethod(provider, "static_schedule", "syncStatic");
        const body = staticSyncBodySchema.parse(request.body ?? {});
        return reply.send(
          await provider.syncStatic(body, await buildProviderContext(app)),
        );
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.post(
    "/api/admin/transport/:provider/sync/realtime",
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const { provider: providerKey } = (request.params ?? {}) as {
          provider: string;
        };
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
    },
  );

  app.post(
    "/api/admin/sync/static",
    { schema: openApi.adminStaticSync },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const body = staticSyncBodySchema.parse(request.body ?? {});
        const transitland = new TransitlandClient();
        const feeds = await transitland.discoverFeeds({
          bbox: body.bbox,
          feedIds: body.feedIds,
        });
        if (feeds.length === 0) {
          throw badRequest("No Transitland GTFS feeds matched the request");
        }

        const existingFeeds = await getFeedsByIds(
          feeds.map(getFeedOnestopId).filter(Boolean),
        );
        const synced = [];
        const errors = [];
        let transitlandApiCallsUsed = body.feedIds?.length ?? 1;

        for (const feed of feeds) {
          const feedOnestopId = getFeedOnestopId(feed);
          const sha1 = getFeedVersion(feed)?.sha1 ?? null;
          const existingSha1 =
            existingFeeds.get(feedOnestopId)?.sha1Current ?? null;
          const existingCounts = await getStaticFeedCounts(feedOnestopId);
          const started = Date.now();
          try {
            if (
              !body.force &&
              sha1 &&
              sha1 === existingSha1 &&
              existingCounts.stops > 0 &&
              existingCounts.routes > 0 &&
              existingCounts.trips > 0
            ) {
              synced.push(
                buildStaticImportResult(
                  feedOnestopId,
                  sha1,
                  "skipped",
                  started,
                  existingCounts,
                ),
              );
              continue;
            }
            const zipBuffer =
              await transitland.downloadLatestFeedVersion(feedOnestopId);
            transitlandApiCallsUsed += 1;
            synced.push(
              await importGtfsStaticFeed({
                feed,
                zipBuffer,
                force: body.force,
                existingSha1,
              }),
            );
          } catch (error) {
            const message = getErrorMessage(error);
            app.log.error(
              { error: message, feedOnestopId },
              "Static GTFS import failed",
            );
            errors.push({
              feedOnestopId,
              message,
            });
            synced.push(
              buildStaticImportResult(
                feedOnestopId,
                sha1,
                "error",
                started,
                undefined,
                message,
              ),
            );
          }
        }

        return reply.send({
          synced,
          transitlandApiCallsUsed,
          errors,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    },
  );

  app.post(
    "/api/admin/sync/realtime",
    { schema: openApi.adminRealtimeSync },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const body = realtimeSyncBodySchema.parse(request.body ?? {});
        const response = await syncRealtimeFeeds({
          bbox: body.bbox,
          feedIds: body.feedIds,
          timeoutMs: app.env.MAP_RT_POLL_TIMEOUT_MS,
        });
        app.wsHub.broadcastVehicles().catch((error: unknown) => {
          app.log.error(error, "Failed to broadcast realtime vehicles");
        });
        return reply.send(response);
      } catch (error) {
        return sendError(reply, error);
      }
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

const MAX_IMPORT_ERROR_MESSAGE_LENGTH = 2000;

function getErrorMessage(error: unknown) {
  const causeMessage = getNestedErrorMessage(error);
  if (causeMessage) return truncateErrorMessage(causeMessage);
  if (error instanceof Error && error.message) {
    return truncateErrorMessage(error.message);
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return truncateErrorMessage(message);
    }
  }
  if (typeof error === "string" && error.length > 0) {
    return truncateErrorMessage(error);
  }

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}") {
      return truncateErrorMessage(serialized);
    }
  } catch {
    // Fall through to the generic message.
  }

  return "Unknown static GTFS import error";
}

function getNestedErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("cause" in error)) return null;
  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message) return cause.message;
  if (cause && typeof cause === "object" && "message" in cause) {
    const message = (cause as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return null;
}

function truncateErrorMessage(message: string) {
  if (message.length <= MAX_IMPORT_ERROR_MESSAGE_LENGTH) return message;
  return `${message.slice(0, MAX_IMPORT_ERROR_MESSAGE_LENGTH)}...`;
}
