import { and, eq, gt, gte, inArray, lt, lte, sql } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "@/db";
import {
  agencies,
  alertSnapshots,
  cache,
  calendar,
  calendarDates,
  feeds,
  routes,
  shapes,
  stops,
  stopTimes,
  trips,
  tripUpdateSnapshots,
  vehiclePositionSnapshots,
} from "@/db/schema";
import { notFound, upstreamError } from "@/lib/api-error";
import type { Bbox } from "@/lib/schemas";

type TableInsert = Record<string, unknown>;
type DbClient = Pick<typeof db, "delete" | "insert" | "select">;

export interface StaticFeedData {
  feeds: (typeof feeds.$inferInsert)[];
  agencies: (typeof agencies.$inferInsert)[];
  stops: (typeof stops.$inferInsert)[];
  routes: (typeof routes.$inferInsert)[];
  shapes: (typeof shapes.$inferInsert)[];
  trips: (typeof trips.$inferInsert)[];
  stopTimes: (typeof stopTimes.$inferInsert)[];
  calendar: (typeof calendar.$inferInsert)[];
  calendarDates: (typeof calendarDates.$inferInsert)[];
}

export interface RealtimeSnapshotData {
  vehiclePositions: (typeof vehiclePositionSnapshots.$inferInsert)[];
  tripUpdates: (typeof tripUpdateSnapshots.$inferInsert)[];
  alerts: (typeof alertSnapshots.$inferInsert)[];
}

export async function getCached<T>(key: string, schema: z.ZodType<T>) {
  const [row] = await db
    .select({ value: cache.value, expiresAt: cache.expiresAt })
    .from(cache)
    .where(and(eq(cache.key, key), gt(cache.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  return schema.parse(row.value);
}

export async function setCached(
  key: string,
  value: unknown,
  ttlSeconds: number,
) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await db
    .insert(cache)
    .values({ key, value: value as never, expiresAt })
    .onConflictDoUpdate({
      target: cache.key,
      set: { value: value as never, expiresAt },
    });
}

export async function getOrSetCached<T>(
  key: string,
  ttlSeconds: number,
  schema: z.ZodType<T>,
  fetcher: () => Promise<T>,
) {
  const cached = await getCached(key, schema);
  if (cached) return cached;
  const value = await fetcher();
  await setCached(key, value, ttlSeconds);
  return value;
}

export async function findStops(options: {
  bbox?: Bbox;
  limit: number;
  feedOnestopId?: string;
}) {
  const conditions = [];
  if (options.bbox) {
    const [minLon, minLat, maxLon, maxLat] = options.bbox;
    conditions.push(
      gte(stops.lat, minLat),
      lte(stops.lat, maxLat),
      gte(stops.lon, minLon),
      lte(stops.lon, maxLon),
    );
  }
  if (options.feedOnestopId) {
    conditions.push(eq(stops.feedOnestopId, options.feedOnestopId));
  }
  return db
    .select()
    .from(stops)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(options.limit);
}

export async function findRoutes(options: {
  feedOnestopId: string;
  routeType?: number;
  limit: number;
}) {
  const conditions = [eq(routes.feedOnestopId, options.feedOnestopId)];
  if (typeof options.routeType === "number") {
    conditions.push(eq(routes.routeType, options.routeType));
  }
  return db
    .select()
    .from(routes)
    .where(and(...conditions))
    .orderBy(
      sql`${routes.routeSortOrder} nulls last`,
      sql`${routes.routeShortName} nulls last`,
      sql`${routes.routeLongName} nulls last`,
      routes.id,
    )
    .limit(options.limit);
}

export async function getStop(stopId: string) {
  const [row] = await db
    .select()
    .from(stops)
    .where(eq(stops.id, stopId))
    .limit(1);
  if (!row) throw notFound("Stop not found", { stopId });
  return row;
}

export async function getRoutesByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, typeof routes.$inferSelect>();
  const rows = await db
    .select()
    .from(routes)
    .where(inArray(routes.id, [...new Set(ids)]));
  return new Map(rows.map((route) => [route.id, route]));
}

export async function getTripsByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, typeof trips.$inferSelect>();
  const rows = await db
    .select()
    .from(trips)
    .where(inArray(trips.id, [...new Set(ids)]));
  return new Map(rows.map((trip) => [trip.id, trip]));
}

export async function getTrip(tripId: string) {
  const [row] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);
  if (!row) throw notFound("Trip not found", { tripId });
  return row;
}

export async function getTripsByRouteId(routeId: string, limitCount = 1) {
  return db
    .select()
    .from(trips)
    .where(eq(trips.routeId, routeId))
    .limit(limitCount);
}

export async function getShape(shapeId: string) {
  const [row] = await db
    .select()
    .from(shapes)
    .where(eq(shapes.id, shapeId))
    .limit(1);
  return row ?? null;
}

export async function getStopTimesByStop(
  stopId: string,
  startTime: string,
  endTime: string,
  limit: number,
) {
  return db
    .select()
    .from(stopTimes)
    .where(
      and(
        eq(stopTimes.stopId, stopId),
        gte(stopTimes.departureTime, startTime),
        lte(stopTimes.departureTime, endTime),
      ),
    )
    .orderBy(stopTimes.departureTime)
    .limit(limit * 3);
}

export async function getStopTimesByTrip(tripId: string) {
  return db
    .select()
    .from(stopTimes)
    .where(eq(stopTimes.tripId, tripId))
    .orderBy(stopTimes.stopSequence);
}

export async function getStopsByIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, typeof stops.$inferSelect>();
  const rows = await db
    .select()
    .from(stops)
    .where(inArray(stops.id, [...new Set(ids)]));
  return new Map(rows.map((stop) => [stop.id, stop]));
}

export async function getActiveServices(
  feedOnestopId: string,
  serviceDate: string,
) {
  const date = new Date(`${serviceDate}T00:00:00Z`);
  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ] as const;
  const weekday = weekdays[date.getUTCDay()] ?? "sunday";

  const calendarRows = await db
    .select()
    .from(calendar)
    .where(
      and(
        eq(calendar.feedOnestopId, feedOnestopId),
        lte(calendar.startDate, serviceDate),
        gte(calendar.endDate, serviceDate),
        eq(calendar[weekday], true),
      ),
    );

  const exceptionRows = await db
    .select()
    .from(calendarDates)
    .where(
      and(
        eq(calendarDates.feedOnestopId, feedOnestopId),
        eq(calendarDates.date, serviceDate),
      ),
    );

  const services = new Set(calendarRows.map((row) => row.serviceId));
  for (const exception of exceptionRows) {
    if (exception.exceptionType === 1) services.add(exception.serviceId);
    if (exception.exceptionType === 2) services.delete(exception.serviceId);
  }
  return services;
}

export async function getLatestVehicleSnapshots(options: {
  bbox?: Bbox;
  feedOnestopId?: string;
  routeId?: string;
  tripId?: string;
  vehicleId?: string;
  sinceSeconds?: number;
  limit?: number;
}) {
  const since = new Date(Date.now() - (options.sinceSeconds ?? 90) * 1000);
  const conditions = [gte(vehiclePositionSnapshots.capturedAt, since)];
  if (options.bbox) {
    const [minLon, minLat, maxLon, maxLat] = options.bbox;
    conditions.push(
      gte(vehiclePositionSnapshots.lat, minLat),
      lte(vehiclePositionSnapshots.lat, maxLat),
      gte(vehiclePositionSnapshots.lon, minLon),
      lte(vehiclePositionSnapshots.lon, maxLon),
    );
  }
  if (options.feedOnestopId)
    conditions.push(
      eq(vehiclePositionSnapshots.feedOnestopId, options.feedOnestopId),
    );
  if (options.routeId)
    conditions.push(eq(vehiclePositionSnapshots.routeId, options.routeId));
  if (options.tripId)
    conditions.push(eq(vehiclePositionSnapshots.tripId, options.tripId));
  if (options.vehicleId)
    conditions.push(eq(vehiclePositionSnapshots.vehicleId, options.vehicleId));

  const rows = await db
    .select()
    .from(vehiclePositionSnapshots)
    .where(and(...conditions))
    .orderBy(sql`${vehiclePositionSnapshots.capturedAt} desc`)
    .limit(options.limit ?? 5000);
  return uniqueLatestVehicles(rows);
}

export async function getReplayVehicleRows(options: {
  start: string;
  end: string;
  bbox?: Bbox;
  feedOnestopId?: string;
  limit?: number;
}) {
  const conditions = [
    gte(vehiclePositionSnapshots.capturedAt, new Date(options.start)),
    lte(vehiclePositionSnapshots.capturedAt, new Date(options.end)),
  ];
  if (options.bbox) {
    const [minLon, minLat, maxLon, maxLat] = options.bbox;
    conditions.push(
      gte(vehiclePositionSnapshots.lat, minLat),
      lte(vehiclePositionSnapshots.lat, maxLat),
      gte(vehiclePositionSnapshots.lon, minLon),
      lte(vehiclePositionSnapshots.lon, maxLon),
    );
  }
  if (options.feedOnestopId) {
    conditions.push(
      eq(vehiclePositionSnapshots.feedOnestopId, options.feedOnestopId),
    );
  }
  return db
    .select()
    .from(vehiclePositionSnapshots)
    .where(and(...conditions))
    .orderBy(vehiclePositionSnapshots.capturedAt)
    .limit(options.limit ?? 100000);
}

export async function getVehicleSnapshotAt(options: {
  timestamp: string;
  toleranceSeconds: number;
  bbox?: Bbox;
  feedOnestopId?: string;
  routeId?: string;
  tripId?: string;
  vehicleId?: string;
}) {
  const target = Date.parse(options.timestamp);
  const start = new Date(target - options.toleranceSeconds * 1000);
  const end = new Date(target + 5000);

  const conditions = [
    gte(vehiclePositionSnapshots.capturedAt, start),
    lte(vehiclePositionSnapshots.capturedAt, end),
  ];
  if (options.bbox) {
    const [minLon, minLat, maxLon, maxLat] = options.bbox;
    conditions.push(
      gte(vehiclePositionSnapshots.lat, minLat),
      lte(vehiclePositionSnapshots.lat, maxLat),
      gte(vehiclePositionSnapshots.lon, minLon),
      lte(vehiclePositionSnapshots.lon, maxLon),
    );
  }
  if (options.feedOnestopId)
    conditions.push(
      eq(vehiclePositionSnapshots.feedOnestopId, options.feedOnestopId),
    );
  if (options.routeId)
    conditions.push(eq(vehiclePositionSnapshots.routeId, options.routeId));
  if (options.tripId)
    conditions.push(eq(vehiclePositionSnapshots.tripId, options.tripId));
  if (options.vehicleId)
    conditions.push(eq(vehiclePositionSnapshots.vehicleId, options.vehicleId));

  const rows = await db
    .select()
    .from(vehiclePositionSnapshots)
    .where(and(...conditions))
    .orderBy(sql`${vehiclePositionSnapshots.capturedAt} desc`)
    .limit(5000);

  const sorted = rows.sort(
    (a, b) =>
      Math.abs(a.capturedAt.getTime() - target) -
      Math.abs(b.capturedAt.getTime() - target),
  );
  return uniqueLatestVehicles(sorted);
}

export async function getTripUpdates(options: {
  tripIds: string[];
  stopIds?: string[];
  sinceSeconds?: number;
}) {
  if (options.tripIds.length === 0) return [];
  const since = new Date(Date.now() - (options.sinceSeconds ?? 3600) * 1000);
  const conditions = [
    inArray(tripUpdateSnapshots.tripId, [...new Set(options.tripIds)]),
    gte(tripUpdateSnapshots.capturedAt, since),
  ];
  if (options.stopIds?.length) {
    conditions.push(
      inArray(tripUpdateSnapshots.stopId, [...new Set(options.stopIds)]),
    );
  }
  const rows = await db
    .select()
    .from(tripUpdateSnapshots)
    .where(and(...conditions))
    .orderBy(sql`${tripUpdateSnapshots.capturedAt} desc`)
    .limit(5000);
  return uniqueLatestTripUpdates(rows);
}

export async function getAlerts(
  options: {
    feedOnestopIds?: string[];
    stopIds?: string[];
    routeIds?: string[];
    timestamp?: string;
  } = {},
) {
  const conditions = [];
  if (options.feedOnestopIds?.length) {
    conditions.push(
      inArray(alertSnapshots.feedOnestopId, [
        ...new Set(options.feedOnestopIds),
      ]),
    );
  }
  const rows = await db
    .select()
    .from(alertSnapshots)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(sql`${alertSnapshots.capturedAt} desc`)
    .limit(500);

  return rows.filter((alert) => {
    const ts = options.timestamp ? Date.parse(options.timestamp) : Date.now();
    const startsBefore = !alert.alertStart || alert.alertStart.getTime() <= ts;
    const endsAfter = !alert.alertEnd || alert.alertEnd.getTime() >= ts;
    const affectedStopsArr = alert.affectedStops as string[] | null;
    const affectedRoutesArr = alert.affectedRoutes as string[] | null;
    const affectsStop =
      !options.stopIds?.length ||
      options.stopIds.some((id) => affectedStopsArr?.includes(id));
    const affectsRoute =
      !options.routeIds?.length ||
      options.routeIds.some((id) => affectedRoutesArr?.includes(id));
    return startsBefore && endsAfter && affectsStop && affectsRoute;
  });
}

export async function listFeedsForRealtime(feedIds?: string[]) {
  const conditions = [sql`${feeds.rtVehiclePositionsUrl} is not null`];
  if (feedIds?.length) {
    conditions.push(inArray(feeds.onestopId, feedIds));
  }
  return db
    .select()
    .from(feeds)
    .where(and(...conditions));
}

export async function getFeedsByIds(feedIds: string[]) {
  if (feedIds.length === 0) return new Map<string, typeof feeds.$inferSelect>();
  const rows = await db
    .select()
    .from(feeds)
    .where(inArray(feeds.onestopId, [...new Set(feedIds)]));
  return new Map(rows.map((feed) => [feed.onestopId, feed]));
}

export async function getStaticFeedCounts(feedOnestopId: string) {
  const [stopsCount, routesCount, tripsCount, stopTimesCount] =
    await Promise.all([
      countRows(stops, eq(stops.feedOnestopId, feedOnestopId)),
      countRows(routes, eq(routes.feedOnestopId, feedOnestopId)),
      countRows(trips, eq(trips.feedOnestopId, feedOnestopId)),
      countRows(
        stopTimes,
        sql`${stopTimes.tripId} like ${`${feedOnestopId}:%`}`,
      ),
    ]);
  return {
    stops: stopsCount,
    routes: routesCount,
    trips: tripsCount,
    stopTimes: stopTimesCount,
  };
}

export async function upsertRows(table: string, rows: TableInsert[]) {
  await upsertRowsWithClient(db, table, rows);
}

async function countRows(
  table: typeof stops | typeof routes | typeof trips | typeof stopTimes,
  where: ReturnType<typeof sql>,
) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(table)
    .where(where);
  return Number(row?.count ?? 0);
}

async function upsertRowsWithClient(
  client: DbClient,
  table: string,
  rows: TableInsert[],
) {
  if (rows.length === 0) return;
  if (table !== "feeds")
    throw upstreamError(`upsertRows: unsupported table '${table}'`);
  for (let start = 0; start < rows.length; start += 1000) {
    const chunk = rows.slice(
      start,
      start + 1000,
    ) as (typeof feeds.$inferInsert)[];
    await client
      .insert(feeds)
      .values(chunk)
      .onConflictDoUpdate({
        target: feeds.onestopId,
        set: {
          name: sql`excluded.name`,
          spec: sql`excluded.spec`,
          staticUrl: sql`excluded.static_url`,
          rtVehiclePositionsUrl: sql`excluded.rt_vehicle_positions_url`,
          rtTripUpdatesUrl: sql`excluded.rt_trip_updates_url`,
          rtAlertsUrl: sql`excluded.rt_alerts_url`,
          sha1Current: sql`excluded.sha1_current`,
          fetchedAt: sql`excluded.fetched_at`,
          lastStaticSync: sql`excluded.last_static_sync`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }
}

export async function insertRows(table: string, rows: TableInsert[]) {
  await insertRowsWithClient(db, table, rows);
}

async function insertRowsWithClient(
  client: DbClient,
  table: string,
  rows: TableInsert[],
) {
  if (rows.length === 0) return;
  const tableMap = getTable(table);
  const chunkSize = getInsertChunkSize(table);
  for (let start = 0; start < rows.length; start += chunkSize) {
    const chunk = rows.slice(start, start + chunkSize);
    await client.insert(tableMap).values(chunk as never);
  }
}

function getInsertChunkSize(table: string) {
  if (table === "shapes") return 10;
  return 1000;
}

export async function deleteFeedStaticRows(feedOnestopId: string) {
  await db.transaction(async (tx) => {
    await deleteFeedStaticRowsWithClient(tx, feedOnestopId);
  });
}

export async function replaceFeedStaticRows(
  feedOnestopId: string,
  rows: StaticFeedData,
) {
  await db.transaction(async (tx) => {
    await deleteFeedStaticRowsWithClient(tx, feedOnestopId);
    await insertStaticRowsWithClient(tx, rows, { includeStopTimes: true });
  });
}

export async function replaceFeedStaticCoreRows(
  feedOnestopId: string,
  rows: StaticFeedData,
) {
  await db.transaction(async (tx) => {
    await deleteFeedStaticRowsWithClient(tx, feedOnestopId);
    await insertStaticRowsWithClient(tx, rows, { includeStopTimes: false });
  });
}

async function insertStaticRowsWithClient(
  client: DbClient,
  rows: StaticFeedData,
  options: { includeStopTimes: boolean },
) {
  await upsertRowsWithClient(client, "feeds", rows.feeds);
  await insertRowsWithClient(client, "agencies", rows.agencies);
  await insertRowsWithClient(client, "stops", rows.stops);
  await insertRowsWithClient(client, "routes", rows.routes);
  await insertRowsWithClient(client, "shapes", rows.shapes);
  await insertRowsWithClient(client, "trips", rows.trips);
  if (options.includeStopTimes) {
    await insertRowsWithClient(client, "stop_times", rows.stopTimes);
  }
  await insertRowsWithClient(client, "calendar", rows.calendar);
  await insertRowsWithClient(client, "calendar_dates", rows.calendarDates);
}

export async function insertRealtimeSnapshotRows(rows: RealtimeSnapshotData) {
  await db.transaction(async (tx) => {
    await insertRowsWithClient(
      tx,
      "vehicle_position_snapshots",
      rows.vehiclePositions,
    );
    await insertRowsWithClient(tx, "trip_update_snapshots", rows.tripUpdates);
    await insertRowsWithClient(tx, "alert_snapshots", rows.alerts);
  });
}

async function deleteFeedStaticRowsWithClient(
  client: DbClient,
  feedOnestopId: string,
) {
  const tripRows = await client
    .select({ id: trips.id })
    .from(trips)
    .where(eq(trips.feedOnestopId, feedOnestopId));
  const tripIds = tripRows.map((row) => row.id);

  for (let start = 0; start < tripIds.length; start += 1000) {
    const chunk = tripIds.slice(start, start + 1000);
    await client.delete(stopTimes).where(inArray(stopTimes.tripId, chunk));
  }

  await client.delete(stops).where(eq(stops.feedOnestopId, feedOnestopId));
  await client.delete(trips).where(eq(trips.feedOnestopId, feedOnestopId));
  await client.delete(shapes).where(eq(shapes.feedOnestopId, feedOnestopId));
  await client.delete(routes).where(eq(routes.feedOnestopId, feedOnestopId));
  await client
    .delete(agencies)
    .where(eq(agencies.feedOnestopId, feedOnestopId));
  await client
    .delete(calendar)
    .where(eq(calendar.feedOnestopId, feedOnestopId));
  await client
    .delete(calendarDates)
    .where(eq(calendarDates.feedOnestopId, feedOnestopId));
}

export async function runRetention(now = new Date()) {
  const vehicleCutoff = new Date(now.getTime() - 3 * 86400 * 1000);
  const alertCutoff = new Date(now.getTime() - 7 * 86400 * 1000);

  await db.transaction(async (tx) => {
    await tx
      .delete(vehiclePositionSnapshots)
      .where(lt(vehiclePositionSnapshots.capturedAt, vehicleCutoff));
    await tx
      .delete(tripUpdateSnapshots)
      .where(lt(tripUpdateSnapshots.capturedAt, vehicleCutoff));
    await tx
      .delete(alertSnapshots)
      .where(lt(alertSnapshots.capturedAt, alertCutoff));
    await tx.delete(cache).where(lt(cache.expiresAt, now));
  });
}

// ── helpers ──────────────────────────────────────────────────────────────────

type DrizzleTable = Parameters<typeof db.insert>[0];

function getTable(table: string): DrizzleTable {
  const map: Record<string, DrizzleTable> = {
    agencies,
    feeds,
    stops,
    routes,
    shapes,
    trips,
    stop_times: stopTimes,
    calendar,
    calendar_dates: calendarDates,
    vehicle_position_snapshots: vehiclePositionSnapshots,
    trip_update_snapshots: tripUpdateSnapshots,
    alert_snapshots: alertSnapshots,
    cache,
  };
  const t = map[table];
  if (!t) throw upstreamError(`Unknown table: ${table}`);
  return t;
}

function uniqueLatestVehicles(
  rows: (typeof vehiclePositionSnapshots.$inferSelect)[],
) {
  const byVehicle = new Map<
    string,
    typeof vehiclePositionSnapshots.$inferSelect
  >();
  for (const row of rows) {
    const key = row.vehicleId ?? `${row.tripId ?? "unknown"}:${row.id}`;
    if (!byVehicle.has(key)) byVehicle.set(key, row);
  }
  return [...byVehicle.values()];
}

function uniqueLatestTripUpdates(
  rows: (typeof tripUpdateSnapshots.$inferSelect)[],
) {
  const byTripStop = new Map<string, typeof tripUpdateSnapshots.$inferSelect>();
  for (const row of rows) {
    const key = `${row.tripId}:${row.stopId ?? row.stopSequence ?? ""}`;
    if (!byTripStop.has(key)) byTripStop.set(key, row);
  }
  return [...byTripStop.values()];
}

export type RepositoryRow =
  | typeof agencies.$inferSelect
  | typeof alertSnapshots.$inferSelect
  | typeof calendarDates.$inferSelect
  | typeof calendar.$inferSelect
  | typeof feeds.$inferSelect
  | typeof routes.$inferSelect
  | typeof shapes.$inferSelect
  | typeof stops.$inferSelect
  | typeof stopTimes.$inferSelect
  | typeof trips.$inferSelect
  | typeof tripUpdateSnapshots.$inferSelect
  | typeof vehiclePositionSnapshots.$inferSelect;
