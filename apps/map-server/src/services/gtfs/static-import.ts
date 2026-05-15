import { parse } from "csv-parse/sync";
import JSZip from "jszip";

import { env } from "@/env";
import { badRequest } from "@/lib/api-error";
import {
  buildStaticFeedData,
  buildStaticImportResult,
  type CsvRow,
} from "@/services/gtfs/data-transfer";
import {
  replaceFeedStaticCoreRows,
  replaceFeedStaticRows,
} from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  type TransitlandFeed,
} from "@/services/transitland/client";

export type { StaticImportResult } from "@/services/gtfs/data-transfer";

const DEV_STOP_TIMES_IMPORT_LIMIT = 1_000_000;

export async function importGtfsStaticFeed(input: {
  feed: TransitlandFeed;
  zipBuffer: Buffer;
  force?: boolean;
  existingSha1?: string | null;
}) {
  const started = Date.now();
  const feedOnestopId = getFeedOnestopId(input.feed);
  if (!feedOnestopId)
    throw badRequest("Transitland feed is missing onestop_id");

  const feedVersion = getFeedVersion(input.feed);
  const sha1 = feedVersion?.sha1 ?? null;
  if (!input.force && sha1 && input.existingSha1 === sha1) {
    return buildStaticImportResult(feedOnestopId, sha1, "skipped", started);
  }

  const zip = await JSZip.loadAsync(input.zipBuffer);
  const agencies = await readCsv(zip, "agency.txt");
  const stops = await readCsv(zip, "stops.txt");
  const routes = await readCsv(zip, "routes.txt");
  const trips = await readCsv(zip, "trips.txt");
  const stopTimes = await readCsv(zip, "stop_times.txt");
  const calendar = await readCsv(zip, "calendar.txt");
  const calendarDates = await readCsv(zip, "calendar_dates.txt");
  const shapes = await readCsv(zip, "shapes.txt");

  const data = buildStaticFeedData({
    feed: input.feed,
    feedOnestopId,
    sha1,
    agencies,
    stops,
    routes,
    trips,
    stopTimes,
    calendar,
    calendarDates,
    shapes,
  });

  if (shouldImportCoreRowsOnly(data.counts.stopTimes)) {
    await replaceFeedStaticCoreRows(feedOnestopId, data.rows);
    return buildStaticImportResult(
      feedOnestopId,
      sha1,
      "partial",
      started,
      { ...data.counts, stopTimes: 0 },
      [
        `Skipped ${data.counts.stopTimes.toLocaleString("en-US")} stop_times rows in development because this feed exceeds the local import limit of ${DEV_STOP_TIMES_IMPORT_LIMIT.toLocaleString("en-US")} rows.`,
        "Stops, routes, trips, shapes, calendar, and feed metadata were imported.",
      ].join(" "),
    );
  }

  await replaceFeedStaticRows(feedOnestopId, data.rows);

  return buildStaticImportResult(
    feedOnestopId,
    sha1,
    input.existingSha1 ? "updated" : "imported",
    started,
    data.counts,
  );
}

function shouldImportCoreRowsOnly(stopTimesCount: number) {
  return (
    env.NODE_ENV !== "production" &&
    stopTimesCount > DEV_STOP_TIMES_IMPORT_LIMIT
  );
}

async function readCsv(zip: JSZip, filename: string) {
  const file = zip.file(filename);
  if (!file) return [] as CsvRow[];
  const content = await file.async("string");
  return parse(content, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CsvRow[];
}
