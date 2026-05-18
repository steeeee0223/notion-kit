import { createFetch, createSchema } from "@better-fetch/fetch";
import gtfsRealtimeBindings from "gtfs-realtime-bindings";
import { z } from "zod/v4";

import { upstreamError } from "@/lib/api-error";
import {
  buildRealtimeSnapshotData,
  type RtFeedMessage,
} from "@/services/realtime/data-transfer";
import {
  insertRealtimeSnapshotRows,
  listFeedsForRealtime,
} from "@/services/repository";

interface Decoder {
  transit_realtime?: {
    FeedMessage?: {
      decode: (data: Uint8Array) => RtFeedMessage;
    };
  };
}

export async function syncRealtimeFeeds(input: {
  feedIds?: string[];
  timeoutMs: number;
}) {
  const feeds = await listFeedsForRealtime(input.feedIds);
  const polled = [];
  const errors = [];
  for (const feed of feeds) {
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
    } catch (error) {
      errors.push({
        feedOnestopId: feed.onestopId,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { polled, errors };
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
