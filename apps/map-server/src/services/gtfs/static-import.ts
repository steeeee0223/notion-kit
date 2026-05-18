import { parse } from "csv-parse/sync";
import JSZip from "jszip";

import { badRequest } from "@/lib/api-error";
import {
  buildStaticFeedData,
  buildStaticImportResult,
  type CsvRow,
} from "@/services/gtfs/data-transfer";
import { replaceFeedStaticRows } from "@/services/repository";
import {
  getFeedOnestopId,
  getFeedVersion,
  type TransitlandFeed,
} from "@/services/transitland/client";

export type { StaticImportResult } from "@/services/gtfs/data-transfer";

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
  await replaceFeedStaticRows(feedOnestopId, data.rows);

  return buildStaticImportResult(
    feedOnestopId,
    sha1,
    "imported",
    started,
    data.counts,
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
