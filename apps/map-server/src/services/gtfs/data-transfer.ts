import type {
  calendar,
  calendarDates,
  feeds,
  routes,
  shapes,
  stops,
  stopTimes,
  trips,
} from "@/db/schema";
import type { StaticFeedData } from "@/services/repository";
import {
  getFeedUrl,
  getFeedVersion,
  type TransitlandFeed,
} from "@/services/transitland/client";

export interface CsvRow extends Record<string, string | undefined> {
  readonly __csvRowBrand?: never;
}

interface ShapePoint {
  lat: number;
  lon: number;
  sequence: number;
}

export interface StaticImportResult {
  feedOnestopId: string;
  sha1: string | null;
  status: "imported" | "skipped" | "error";
  stopsCount: number;
  routesCount: number;
  tripsCount: number;
  stopTimesCount: number;
  durationMs: number;
  error?: string;
}

export interface StaticFeedCounts {
  stops: number;
  routes: number;
  trips: number;
  stopTimes: number;
}

export function buildStaticFeedData(input: {
  feed: TransitlandFeed;
  feedOnestopId: string;
  sha1: string | null;
  agencies: CsvRow[];
  stops: CsvRow[];
  routes: CsvRow[];
  trips: CsvRow[];
  stopTimes: CsvRow[];
  calendar: CsvRow[];
  calendarDates: CsvRow[];
  shapes: CsvRow[];
}): { rows: StaticFeedData; counts: StaticFeedCounts } {
  const agencyName = input.agencies[0]?.agency_name ?? null;

  return {
    rows: {
      feeds: buildFeedRows(input.feed, input.feedOnestopId, input.sha1),
      stops: buildStopRows(input.feedOnestopId, input.stops),
      routes: buildRouteRows(input.feedOnestopId, input.routes, agencyName),
      shapes: buildShapeRows(input.feedOnestopId, input.shapes),
      trips: buildTripRows(input.feedOnestopId, input.trips),
      stopTimes: buildStopTimeRows(input.feedOnestopId, input.stopTimes),
      calendar: buildCalendarRows(input.feedOnestopId, input.calendar),
      calendarDates: buildCalendarDateRows(
        input.feedOnestopId,
        input.calendarDates,
      ),
    },
    counts: {
      stops: input.stops.length,
      routes: input.routes.length,
      trips: input.trips.length,
      stopTimes: input.stopTimes.length,
    },
  };
}

export function buildStaticImportResult(
  feedOnestopId: string,
  sha1: string | null,
  status: "imported" | "skipped" | "error",
  started: number,
  counts: StaticFeedCounts = {
    stops: 0,
    routes: 0,
    trips: 0,
    stopTimes: 0,
  },
): StaticImportResult {
  return {
    feedOnestopId,
    sha1,
    status,
    stopsCount: counts.stops,
    routesCount: counts.routes,
    tripsCount: counts.trips,
    stopTimesCount: counts.stopTimes,
    durationMs: Date.now() - started,
  };
}

function buildFeedRows(
  feed: TransitlandFeed,
  feedOnestopId: string,
  sha1: string | null,
): (typeof feeds.$inferInsert)[] {
  const feedVersion = getFeedVersion(feed);

  return [
    {
      onestopId: feedOnestopId,
      name: feed.name ?? null,
      spec: feed.spec ?? "gtfs",
      staticUrl: feedVersion?.url ?? getFeedUrl(feed, "static_current"),
      rtVehiclePositionsUrl: getFeedUrl(feed, "realtime_vehicle_positions"),
      rtTripUpdatesUrl: getFeedUrl(feed, "realtime_trip_updates"),
      rtAlertsUrl: getFeedUrl(feed, "realtime_alerts"),
      sha1Current: sha1,
      fetchedAt: feedVersion?.fetched_at
        ? new Date(feedVersion.fetched_at)
        : null,
      lastStaticSync: new Date(),
      updatedAt: new Date(),
    },
  ];
}

function buildStopRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof stops.$inferInsert)[] {
  return rows.flatMap((stop) => {
    const stopId = stop.stop_id;
    const lat = numberOrNull(stop.stop_lat);
    const lon = numberOrNull(stop.stop_lon);
    if (!stopId || lat === null || lon === null) return [];
    return [
      {
        id: scopedId(feedOnestopId, stopId),
        feedOnestopId,
        stopId: stopId,
        stopName: stop.stop_name ?? "",
        stopDesc: stop.stop_desc ?? null,
        stopCode: stop.stop_code ?? null,
        stopTimezone: stop.stop_timezone ?? null,
        locationType: integerOrDefault(stop.location_type, 0),
        wheelchairBoarding: integerOrDefault(stop.wheelchair_boarding, 0),
        platformCode: stop.platform_code ?? null,
        zoneId: stop.zone_id ?? null,
        parentStopId: stop.parent_station
          ? scopedId(feedOnestopId, stop.parent_station)
          : null,
        lat,
        lon,
      },
    ];
  });
}

function buildRouteRows(
  feedOnestopId: string,
  rows: CsvRow[],
  agencyName: string | null,
): (typeof routes.$inferInsert)[] {
  return rows.flatMap((route) => {
    const routeId = route.route_id;
    if (!routeId) return [];
    return [
      {
        id: scopedId(feedOnestopId, routeId),
        feedOnestopId,
        routeId,
        routeShortName: route.route_short_name ?? null,
        routeLongName: route.route_long_name ?? null,
        routeType: integerOrNull(route.route_type),
        routeColor: normalizeColor(route.route_color),
        routeTextColor: normalizeColor(route.route_text_color),
        agencyName: agencyName,
      },
    ];
  });
}

function buildShapeRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof shapes.$inferInsert)[] {
  const grouped = new Map<string, ShapePoint[]>();
  for (const row of rows) {
    if (!row.shape_id) continue;
    const lat = numberOrNull(row.shape_pt_lat);
    const lon = numberOrNull(row.shape_pt_lon);
    const sequence = integerOrNull(row.shape_pt_sequence);
    if (lat === null || lon === null || sequence === null) continue;
    grouped.set(row.shape_id, [
      ...(grouped.get(row.shape_id) ?? []),
      { lat, lon, sequence },
    ]);
  }
  return [...grouped.entries()].map(([shapeId, points]) => ({
    id: scopedId(feedOnestopId, shapeId),
    feedOnestopId,
    shapeId: shapeId,
    geojson: {
      type: "LineString",
      coordinates: points
        .sort((a, b) => a.sequence - b.sequence)
        .map((point) => [point.lon, point.lat]),
    },
    generated: false,
  }));
}

function buildTripRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof trips.$inferInsert)[] {
  return rows.flatMap((trip) => {
    const tripId = trip.trip_id;
    const routeId = trip.route_id;
    const serviceId = trip.service_id;
    if (!tripId || !routeId || !serviceId) return [];
    return [
      {
        id: scopedId(feedOnestopId, tripId),
        feedOnestopId,
        tripId,
        routeId: scopedId(feedOnestopId, routeId),
        shapeId: trip.shape_id ? scopedId(feedOnestopId, trip.shape_id) : null,
        serviceId: serviceId,
        tripHeadsign: trip.trip_headsign ?? null,
        directionId: integerOrNull(trip.direction_id),
        wheelchairAccessible: integerOrNull(trip.wheelchair_accessible),
        bikesAllowed: integerOrNull(trip.bikes_allowed),
      },
    ];
  });
}

function buildStopTimeRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof stopTimes.$inferInsert)[] {
  return rows.flatMap((stopTime) => {
    if (!stopTime.trip_id || !stopTime.stop_id || !stopTime.stop_sequence) {
      return [];
    }
    return [
      {
        tripId: scopedId(feedOnestopId, stopTime.trip_id),
        stopId: scopedId(feedOnestopId, stopTime.stop_id),
        stopSequence: integerOrDefault(stopTime.stop_sequence, 0),
        arrivalTime: stopTime.arrival_time ?? null,
        departureTime: stopTime.departure_time ?? null,
        stopHeadsign: stopTime.stop_headsign ?? null,
        pickupType: integerOrDefault(stopTime.pickup_type, 0),
        dropOffType: integerOrDefault(stopTime.drop_off_type, 0),
        interpolated: false,
      },
    ];
  });
}

function buildCalendarRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof calendar.$inferInsert)[] {
  return rows.flatMap((row) => {
    if (!row.service_id || !row.start_date || !row.end_date) return [];
    return [
      {
        id: scopedId(feedOnestopId, row.service_id),
        feedOnestopId,
        serviceId: row.service_id,
        monday: row.monday === "1",
        tuesday: row.tuesday === "1",
        wednesday: row.wednesday === "1",
        thursday: row.thursday === "1",
        friday: row.friday === "1",
        saturday: row.saturday === "1",
        sunday: row.sunday === "1",
        startDate: gtfsDate(row.start_date),
        endDate: gtfsDate(row.end_date),
      },
    ];
  });
}

function buildCalendarDateRows(
  feedOnestopId: string,
  rows: CsvRow[],
): (typeof calendarDates.$inferInsert)[] {
  return rows.flatMap((row) => {
    if (!row.service_id || !row.date || !row.exception_type) return [];
    return [
      {
        feedOnestopId,
        serviceId: row.service_id,
        date: gtfsDate(row.date),
        exceptionType: integerOrDefault(row.exception_type, 0),
      },
    ];
  });
}

function scopedId(feedOnestopId: string, id: string) {
  return `${feedOnestopId}:${id}`;
}

function numberOrNull(value: string | undefined) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value: string | undefined) {
  const number = numberOrNull(value);
  return number === null ? null : Math.trunc(number);
}

function integerOrDefault(value: string | undefined, fallback: number) {
  return integerOrNull(value) ?? fallback;
}

function normalizeColor(value: string | undefined) {
  if (!value) return null;
  return value.startsWith("#") ? value : `#${value}`;
}

function gtfsDate(value: string) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
