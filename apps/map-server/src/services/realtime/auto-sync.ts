import type { FastifyBaseLogger } from "fastify";

import type { MapServerEnv } from "@/env";
import { quantizeBbox, type Bbox } from "@/lib/schemas";

import { syncRealtimeFeeds } from "./gtfs-rt";

const AUTO_SYNC_COOLDOWN_MS = 60_000;

const lastAutoSyncAtByKey = new Map<string, number>();
const inFlightByKey = new Map<string, Promise<RealtimeAutoSyncMeta>>();

export interface RealtimeAutoSyncMeta {
  attempted: boolean;
  skipped_reason?: "cooldown" | "in_flight";
  polled_count?: number;
  vehicle_positions_count?: number;
  errors_count?: number;
  message: string;
}

export async function maybeAutoSyncRealtimeSnapshots(input: {
  bbox?: Bbox;
  env: MapServerEnv;
  feedIds?: string[];
  logger: FastifyBaseLogger;
}): Promise<RealtimeAutoSyncMeta> {
  const key = autoSyncKey(input);
  const inFlight = inFlightByKey.get(key);
  if (inFlight) {
    return {
      attempted: false,
      skipped_reason: "in_flight",
      message:
        "No recent vehicle snapshots are available. A realtime sync is already running.",
    };
  }

  const now = Date.now();
  const elapsedMs = now - (lastAutoSyncAtByKey.get(key) ?? 0);
  if (elapsedMs < AUTO_SYNC_COOLDOWN_MS) {
    return {
      attempted: false,
      skipped_reason: "cooldown",
      message:
        "No recent vehicle snapshots are available. Realtime auto-sync was recently attempted.",
    };
  }

  lastAutoSyncAtByKey.set(key, now);
  const nextInFlight = syncRealtimeFeeds({
    bbox: input.bbox,
    feedIds: input.feedIds,
    timeoutMs: input.env.MAP_RT_POLL_TIMEOUT_MS,
  })
    .then((result) => {
      const vehiclePositionsCount = result.polled.reduce(
        (total, feed) => total + feed.vehiclePositionsCount,
        0,
      );
      return {
        attempted: true,
        polled_count: result.polled.length,
        vehicle_positions_count: vehiclePositionsCount,
        errors_count: result.errors.length,
        message:
          vehiclePositionsCount > 0
            ? "No recent vehicle snapshots were available, so realtime sync was triggered."
            : "Realtime sync completed, but no vehicle position snapshots were returned.",
      };
    })
    .catch((error: unknown) => {
      input.logger.error(error, "Realtime auto-sync failed");
      return {
        attempted: true,
        polled_count: 0,
        vehicle_positions_count: 0,
        errors_count: 1,
        message:
          error instanceof Error
            ? `Realtime auto-sync failed: ${error.message}`
            : "Realtime auto-sync failed.",
      };
    })
    .finally(() => {
      inFlightByKey.delete(key);
    });

  inFlightByKey.set(key, nextInFlight);
  return nextInFlight;
}

function autoSyncKey(input: { bbox?: Bbox; feedIds?: string[] }) {
  if (input.feedIds?.length) {
    return `feeds:${[...new Set(input.feedIds)].sort().join(",")}`;
  }
  if (input.bbox) return `bbox:${quantizeBbox(input.bbox)}`;
  return "all";
}
