import { createFetch, createSchema } from "@better-fetch/fetch";
import gtfsRealtimeBindings from "gtfs-realtime-bindings";
import { z } from "zod/v4";

import { upstreamError } from "@/lib/api-error";
import type { Bbox } from "@/lib/schemas";
import { parseFeedMetadataRows } from "@/services/gtfs/data-transfer";
import {
  buildRealtimeSnapshotData,
  type RtFeedMessage,
} from "@/services/realtime/data-transfer";
import {
  insertRealtimeSnapshotRows,
  listFeedsForRealtime,
  upsertRows,
} from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  TransitlandClient,
  type TransitlandRealtimeVehicleFeed,
} from "@/services/transitland/client";

interface Decoder {
  transit_realtime?: {
    FeedMessage?: {
      decode: (data: Uint8Array) => RtFeedMessage;
    };
  };
}

export async function syncRealtimeFeeds(input: {
  bbox?: Bbox;
  feedIds?: string[];
  timeoutMs: number;
}) {
  const errors = [];
  let feedIdsToPoll = input.feedIds;
  const transitlandTargets = new Map<string, TransitlandRealtimeVehicleFeed>();

  if (input.feedIds?.length || input.bbox) {
    const transitland = new TransitlandClient();
    const feedRows = [];

    if (input.feedIds?.length) {
      for (const feedId of [...new Set(input.feedIds)]) {
        try {
          const feed = await transitland.getFeed(feedId);
          const feedOnestopId = getFeedOnestopId(feed);
          const sha1 = getFeedVersion(feed)?.sha1 ?? null;
          feedRows.push(...parseFeedMetadataRows(feed, feedOnestopId, sha1));
          if (feed.spec?.toUpperCase() === "GTFS_RT") {
            transitlandTargets.set(feedOnestopId, feed);
          }
        } catch (error) {
          errors.push({
            feedOnestopId: feedId,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (input.bbox) {
      try {
        const discoveredFeeds = await transitland.discoverRealtimeVehicleFeeds({
          bbox: input.bbox,
        });
        const discoveredFeedIds = [];
        for (const feed of discoveredFeeds) {
          const feedOnestopId = getFeedOnestopId(feed);
          if (!feedOnestopId) continue;
          discoveredFeedIds.push(feedOnestopId);
          transitlandTargets.set(feedOnestopId, feed);
          const sha1 = getFeedVersion(feed)?.sha1 ?? null;
          feedRows.push(...parseFeedMetadataRows(feed, feedOnestopId, sha1));
        }
        feedIdsToPoll = [
          ...new Set([...(feedIdsToPoll ?? []), ...discoveredFeedIds]),
        ];
      } catch (error) {
        errors.push({
          feedOnestopId: "bbox",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    await upsertRows("feeds", dedupeFeedRows(feedRows));
  }

  const feeds = await listFeedsForRealtime(feedIdsToPoll);
  const polled = [];
  const polledFeedIds = new Set<string>();
  for (const feed of feeds) {
    if (transitlandTargets.has(feed.onestopId)) continue;
    const started = Date.now();
    try {
      const capturedAt = new Date().toISOString();
      const [vehiclePositions, tripUpdates, alerts] = await Promise.all([
        feed.rtVehiclePositionsUrl
          ? fetchGtfsRt(feed.rtVehiclePositionsUrl, input.timeoutMs)
          : Promise.resolve(null),
        feed.rtTripUpdatesUrl
          ? fetchGtfsRt(feed.rtTripUpdatesUrl, input.timeoutMs)
          : Promise.resolve(null),
        feed.rtAlertsUrl
          ? fetchGtfsRt(feed.rtAlertsUrl, input.timeoutMs)
          : Promise.resolve(null),
      ]);

      const rows = buildRealtimeSnapshotData({
        feedOnestopId: feed.onestopId,
        capturedAt,
        vehiclePositions,
        tripUpdates,
        alerts,
      });
      await insertRealtimeSnapshotRows(rows);

      polled.push({
        feedOnestopId: feed.onestopId,
        vehiclePositionsCount: rows.vehiclePositions.length,
        tripUpdatesCount: rows.tripUpdates.length,
        alertsCount: rows.alerts.length,
        durationMs: Date.now() - started,
      });
      polledFeedIds.add(feed.onestopId);
    } catch (error) {
      errors.push({
        feedOnestopId: feed.onestopId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const transitland = new TransitlandClient();
  for (const [feedOnestopId, target] of transitlandTargets) {
    if (polledFeedIds.has(feedOnestopId)) continue;
    const started = Date.now();
    try {
      const capturedAt = new Date().toISOString();
      const snapshotFeedOnestopId = target.staticFeedOnestopId ?? feedOnestopId;
      const vehiclePositions =
        await transitland.downloadLatestRealtimeVehiclePositions(feedOnestopId);
      const rows = buildRealtimeSnapshotData({
        feedOnestopId: snapshotFeedOnestopId,
        capturedAt,
        vehiclePositions: vehiclePositions as RtFeedMessage,
        tripUpdates: null,
        alerts: null,
      });
      await insertRealtimeSnapshotRows(rows);
      polled.push({
        feedOnestopId: snapshotFeedOnestopId,
        vehiclePositionsCount: rows.vehiclePositions.length,
        tripUpdatesCount: 0,
        alertsCount: 0,
        durationMs: Date.now() - started,
      });
      polledFeedIds.add(feedOnestopId);
    } catch (error) {
      errors.push({
        feedOnestopId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    polled,
    errors,
    meta: {
      requested_bbox: input.bbox ?? null,
      requested_feed_ids: feedIdsToPoll ?? [],
      matched_realtime_feed_count: new Set([
        ...feeds.map((feed) => feed.onestopId),
        ...transitlandTargets.keys(),
      ]).size,
      ...(feeds.length === 0 && transitlandTargets.size === 0
        ? {
            message: feedIdsToPoll?.length
              ? "No realtime-capable feeds matched the requested bbox or feedIds."
              : "No realtime-capable feeds are stored. Provide bbox or feedIds, or run static sync for feeds that include GTFS-RT vehicle positions.",
          }
        : {}),
    },
  };
}

function dedupeFeedRows<T extends { onestopId: string }>(rows: T[]) {
  return [...new Map(rows.map((row) => [row.onestopId, row])).values()];
}

async function fetchGtfsRt(url: string, timeoutMs: number) {
  const $fetch = createFetch({
    baseURL: url,
    schema: createSchema({ "/": { output: z.instanceof(ArrayBuffer) } }),
  });
  const { data, error } = await $fetch("/", { timeout: timeoutMs });
  if (error) throw upstreamError("GTFS-RT fetch failed", error);
  const buffer = new Uint8Array(data);
  const decoder = gtfsRealtimeBindings as Decoder;
  const feedMessage = decoder.transit_realtime?.FeedMessage;
  if (!feedMessage) throw upstreamError("GTFS-RT decoder is unavailable");
  return feedMessage.decode(buffer);
}
