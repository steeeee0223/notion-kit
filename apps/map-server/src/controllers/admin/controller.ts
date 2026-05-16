import type { FastifyInstance, FastifyRequest } from "fastify";

import { badRequest, sendError, unauthorized } from "@/lib/api-error";
import { openApi } from "@/openapi";
import { buildStaticImportResult } from "@/services/gtfs/data-transfer";
import { importGtfsStaticFeed } from "@/services/gtfs/static-import";
import { syncRealtimeFeeds } from "@/services/realtime/gtfs-rt";
import { getFeedsByIds, runRetention } from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  TransitlandClient,
} from "@/services/transitland/client";

import { realtimeSyncBodySchema, staticSyncBodySchema } from "./schema";

export function registerAdminRoutes(app: FastifyInstance) {
  app.post(
    "/api/admin/sync/static",
    { schema: openApi.adminStaticSync },
    async (request, reply) => {
      try {
        assertAdmin(app, request);
        const body = staticSyncBodySchema.parse(request.body ?? {});
        const transitland = new TransitlandClient(app.env.TRANS_TRANSITLAND);
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
          const started = Date.now();
          try {
            if (!body.force && sha1 && sha1 === existingSha1) {
              synced.push(
                buildStaticImportResult(
                  feedOnestopId,
                  sha1,
                  "skipped",
                  started,
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
            errors.push({
              feedOnestopId,
              message: error instanceof Error ? error.message : String(error),
            });
            synced.push(
              buildStaticImportResult(feedOnestopId, sha1, "error", started),
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
