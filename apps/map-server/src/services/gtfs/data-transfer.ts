import { z } from "zod/v4";

import type {
  agencies,
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

import {
  agencyFileSchema,
  calendarDateFileSchema,
  calendarFileSchema,
  routeFileSchema,
  shapeFileSchema,
  stopFileSchema,
  stopTimeFileSchema,
  tripFileSchema,
  type AgencyCsvRow,
} from "./schemas";
import type {
  CalendarCsvRow,
  CalendarDateCsvRow,
  RouteCsvRow,
  ShapeCsvRow,
  StopCsvRow,
  StopTimeCsvRow,
  TripCsvRow,
} from "./schemas";

export interface CsvRow extends Record<string, string | undefined> {
  readonly __csvRowBrand?: never;
}

interface ShapePoint {
  lat: number;
  lon: number;
  sequence: number;
  shapeDistTraveled: number | null;
}

export interface StaticImportResult {
  feedOnestopId: string;
  sha1: string | null;
  status: "imported" | "updated" | "skipped" | "partial" | "error";
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

const feedMetadataRowsSchema = (input: {
  feedOnestopId: string;
  sha1: string | null;
}) =>
  z
    .custom<TransitlandFeed>()
    .transform<(typeof feeds.$inferInsert)[]>((feed) => {
      const feedVersion = getFeedVersion(feed);

      return [
        {
          onestopId: input.feedOnestopId,
          name: feed.name ?? null,
          spec: feed.spec ?? "gtfs",
          staticUrl: feedVersion?.url ?? getFeedUrl(feed, "static_current"),
          rtVehiclePositionsUrl: getFeedUrl(feed, "realtime_vehicle_positions"),
          rtTripUpdatesUrl: getFeedUrl(feed, "realtime_trip_updates"),
          rtAlertsUrl: getFeedUrl(feed, "realtime_alerts"),
          sha1Current: input.sha1,
          fetchedAt: feedVersion?.fetched_at
            ? new Date(feedVersion.fetched_at)
            : null,
          lastStaticSync: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

const agencyRowsSchema = (feedOnestopId: string) =>
  z.array(
    agencyFileSchema.transform<typeof agencies.$inferInsert>((agency) => ({
      id: scopedId(feedOnestopId, agency.agency_id ?? "agency-unknown"),
      feedOnestopId,
      agencyId: agency.agency_id,
      agencyName: agency.agency_name,
      agencyUrl: agency.agency_url,
      agencyTimezone: agency.agency_timezone,
      agencyLang: agency.agency_lang,
      agencyPhone: agency.agency_phone,
      agencyFareUrl: agency.agency_fare_url,
      agencyEmail: agency.agency_email,
      cemvSupport: agency.cemv_support,
    })),
  );
const stopRowsSchema = (feedOnestopId: string) =>
  z.array(
    stopFileSchema.transform<typeof stops.$inferInsert>((stop) => ({
      id: scopedId(feedOnestopId, stop.stop_id),
      feedOnestopId,
      stopId: stop.stop_id,
      stopName: stop.stop_name,
      ttsStopName: stop.tts_stop_name,
      stopDesc: stop.stop_desc,
      stopCode: stop.stop_code,
      stopUrl: stop.stop_url,
      stopTimezone: stop.stop_timezone,
      locationType: stop.location_type ?? 0,
      wheelchairBoarding: stop.wheelchair_boarding ?? 0,
      platformCode: stop.platform_code,
      zoneId: stop.zone_id,
      parentStopId: stop.parent_station
        ? scopedId(feedOnestopId, stop.parent_station)
        : null,
      levelId: stop.level_id,
      stopAccess: stop.stop_access,
      lat: stop.stop_lat,
      lon: stop.stop_lon,
    })),
  );

const routeRowsSchema = (feedOnestopId: string, agencies: AgencyCsvRow[]) =>
  z.array(routeFileSchema).transform<(typeof routes.$inferInsert)[]>((rows) => {
    const agencyById = new Map(
      agencies.flatMap((agency) =>
        agency.agency_id ? [[agency.agency_id, agency] as const] : [],
      ),
    );
    const defaultAgency = agencies.length === 1 ? agencies[0] : undefined;

    return rows.map((route) => {
      const agency = route.agency_id
        ? agencyById.get(route.agency_id)
        : defaultAgency;
      return {
        id: scopedId(feedOnestopId, route.route_id),
        feedOnestopId,
        routeId: route.route_id,
        agencyId: route.agency_id,
        routeShortName: route.route_short_name,
        routeLongName: route.route_long_name,
        routeDesc: route.route_desc,
        routeType: route.route_type,
        routeUrl: route.route_url,
        routeColor: normalizeColor(route.route_color),
        routeTextColor: normalizeColor(route.route_text_color),
        routeSortOrder: route.route_sort_order,
        continuousPickup: route.continuous_pickup,
        continuousDropOff: route.continuous_drop_off,
        networkId: route.network_id,
        cemvSupport: route.cemv_support,
        agencyName: agency?.agency_name ?? null,
      };
    });
  });

const shapeRowsSchema = (feedOnestopId: string) =>
  z.array(shapeFileSchema).transform<(typeof shapes.$inferInsert)[]>((rows) => {
    const grouped = new Map<string, ShapePoint[]>();
    for (const row of rows) {
      grouped.set(row.shape_id, [
        ...(grouped.get(row.shape_id) ?? []),
        {
          lat: row.shape_pt_lat,
          lon: row.shape_pt_lon,
          sequence: row.shape_pt_sequence,
          shapeDistTraveled: row.shape_dist_traveled,
        },
      ]);
    }

    return [...grouped.entries()].map(([shapeId, points]) => {
      const sorted = points.sort((a, b) => a.sequence - b.sequence);
      return {
        id: scopedId(feedOnestopId, shapeId),
        feedOnestopId,
        shapeId,
        geojson: {
          type: "LineString",
          coordinates: sorted.map((point) => [point.lon, point.lat]),
        },
        points: sorted.map((point) => ({
          shape_pt_lat: point.lat,
          shape_pt_lon: point.lon,
          shape_pt_sequence: point.sequence,
          shape_dist_traveled: point.shapeDistTraveled,
        })),
        generated: false,
      };
    });
  });

const tripRowsSchema = (feedOnestopId: string) =>
  z.array(
    tripFileSchema.transform<typeof trips.$inferInsert>((trip) => ({
      id: scopedId(feedOnestopId, trip.trip_id),
      feedOnestopId,
      tripId: trip.trip_id,
      routeId: scopedId(feedOnestopId, trip.route_id),
      shapeId: trip.shape_id ? scopedId(feedOnestopId, trip.shape_id) : null,
      serviceId: trip.service_id,
      tripHeadsign: trip.trip_headsign,
      tripShortName: trip.trip_short_name,
      directionId: trip.direction_id,
      blockId: trip.block_id,
      wheelchairAccessible: trip.wheelchair_accessible,
      bikesAllowed: trip.bikes_allowed,
      carsAllowed: trip.cars_allowed,
      safeDurationFactor: trip.safe_duration_factor,
      safeDurationOffset: trip.safe_duration_offset,
    })),
  );

const stopTimeRowsSchema = (feedOnestopId: string) =>
  z.array(
    stopTimeFileSchema.transform<typeof stopTimes.$inferInsert>((stopTime) => ({
      tripId: scopedId(feedOnestopId, stopTime.trip_id),
      stopId: stopTime.stop_id
        ? scopedId(feedOnestopId, stopTime.stop_id)
        : null,
      locationGroupId: stopTime.location_group_id,
      locationId: stopTime.location_id,
      stopSequence: stopTime.stop_sequence,
      arrivalTime: stopTime.arrival_time,
      departureTime: stopTime.departure_time,
      stopHeadsign: stopTime.stop_headsign,
      startPickupDropOffWindow: stopTime.start_pickup_drop_off_window,
      endPickupDropOffWindow: stopTime.end_pickup_drop_off_window,
      pickupType: stopTime.pickup_type ?? 0,
      dropOffType: stopTime.drop_off_type ?? 0,
      continuousPickup: stopTime.continuous_pickup,
      continuousDropOff: stopTime.continuous_drop_off,
      shapeDistTraveled: stopTime.shape_dist_traveled,
      timepoint: stopTime.timepoint,
      pickupBookingRuleId: stopTime.pickup_booking_rule_id,
      dropOffBookingRuleId: stopTime.drop_off_booking_rule_id,
      interpolated: stopTime.timepoint === 0,
    })),
  );

const calendarRowsSchema = (feedOnestopId: string) =>
  z.array(
    calendarFileSchema.transform<typeof calendar.$inferInsert>((row) => ({
      id: scopedId(feedOnestopId, row.service_id),
      feedOnestopId,
      serviceId: row.service_id,
      monday: row.monday,
      tuesday: row.tuesday,
      wednesday: row.wednesday,
      thursday: row.thursday,
      friday: row.friday,
      saturday: row.saturday,
      sunday: row.sunday,
      startDate: gtfsDate(row.start_date),
      endDate: gtfsDate(row.end_date),
    })),
  );

const calendarDateRowsSchema = (feedOnestopId: string) =>
  z.array(
    calendarDateFileSchema.transform<typeof calendarDates.$inferInsert>(
      (row) => ({
        feedOnestopId,
        serviceId: row.service_id,
        date: gtfsDate(row.date),
        exceptionType: row.exception_type,
      }),
    ),
  );

export function parseFeedMetadataRows(
  feed: TransitlandFeed,
  feedOnestopId: string,
  sha1: string | null,
) {
  return feedMetadataRowsSchema({ feedOnestopId, sha1 }).parse(feed);
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
  const parsed = parseStaticGtfsRows(input);

  return {
    rows: {
      feeds: parseFeedMetadataRows(input.feed, input.feedOnestopId, input.sha1),
      agencies: agencyRowsSchema(input.feedOnestopId).parse(parsed.agencies),
      stops: stopRowsSchema(input.feedOnestopId).parse(parsed.stops),
      routes: routeRowsSchema(input.feedOnestopId, parsed.agencies).parse(
        parsed.routes,
      ),
      shapes: shapeRowsSchema(input.feedOnestopId).parse(parsed.shapes),
      trips: tripRowsSchema(input.feedOnestopId).parse(parsed.trips),
      stopTimes: stopTimeRowsSchema(input.feedOnestopId).parse(
        parsed.stopTimes,
      ),
      calendar: calendarRowsSchema(input.feedOnestopId).parse(parsed.calendar),
      calendarDates: calendarDateRowsSchema(input.feedOnestopId).parse(
        parsed.calendarDates,
      ),
    },
    counts: {
      stops: parsed.stops.length,
      routes: parsed.routes.length,
      trips: parsed.trips.length,
      stopTimes: parsed.stopTimes.length,
    },
  };
}

export function buildStaticImportResult(
  feedOnestopId: string,
  sha1: string | null,
  status: StaticImportResult["status"],
  started: number,
  counts: StaticFeedCounts = {
    stops: 0,
    routes: 0,
    trips: 0,
    stopTimes: 0,
  },
  error?: string,
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
    ...(error ? { error } : {}),
  };
}

function parseStaticGtfsRows(input: {
  agencies: CsvRow[];
  stops: CsvRow[];
  routes: CsvRow[];
  trips: CsvRow[];
  stopTimes: CsvRow[];
  calendar: CsvRow[];
  calendarDates: CsvRow[];
  shapes: CsvRow[];
}) {
  const parsed = {
    agencies: parseFileRows("agency.txt", agencyFileSchema, input.agencies),
    stops: parseFileRows("stops.txt", stopFileSchema, input.stops),
    routes: parseFileRows("routes.txt", routeFileSchema, input.routes),
    trips: parseFileRows("trips.txt", tripFileSchema, input.trips),
    stopTimes: parseFileRows(
      "stop_times.txt",
      stopTimeFileSchema,
      input.stopTimes,
    ),
    calendar: parseFileRows("calendar.txt", calendarFileSchema, input.calendar),
    calendarDates: parseFileRows(
      "calendar_dates.txt",
      calendarDateFileSchema,
      input.calendarDates,
    ),
    shapes: parseFileRows("shapes.txt", shapeFileSchema, input.shapes),
  };

  validateStaticGtfsRelationships(parsed);
  return parsed;
}

function parseFileRows<T extends z.ZodType>(
  filename: string,
  schema: T,
  rows: CsvRow[],
) {
  const parsed: z.infer<T>[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const result = schema.safeParse(row);
    if (result.success) {
      parsed.push(result.data);
      return;
    }
    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path.join(".") : "row";
      errors.push(`${filename}:${index + 2} ${path}: ${issue.message}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(
      `Invalid GTFS static feed:\n${errors.slice(0, 50).join("\n")}`,
    );
  }

  return parsed;
}

function validateStaticGtfsRelationships(input: {
  agencies: AgencyCsvRow[];
  stops: StopCsvRow[];
  routes: RouteCsvRow[];
  trips: TripCsvRow[];
  stopTimes: StopTimeCsvRow[];
  calendar: CalendarCsvRow[];
  calendarDates: CalendarDateCsvRow[];
  shapes: ShapeCsvRow[];
}) {
  const errors: string[] = [];
  if (input.agencies.length === 0) errors.push("agency.txt is required");
  if (input.stops.length === 0) errors.push("stops.txt is required");
  if (input.routes.length === 0) errors.push("routes.txt is required");
  if (input.trips.length === 0) errors.push("trips.txt is required");
  if (input.stopTimes.length === 0) errors.push("stop_times.txt is required");
  if (input.calendar.length === 0 && input.calendarDates.length === 0) {
    errors.push("calendar.txt or calendar_dates.txt is required");
  }

  ensureUnique("agency.txt", input.agencies, agencyKey, errors);
  ensureUnique("stops.txt", input.stops, (row) => row.stop_id, errors);
  ensureUnique("routes.txt", input.routes, (row) => row.route_id, errors);
  ensureUnique("trips.txt", input.trips, (row) => row.trip_id, errors);
  ensureUnique("calendar.txt", input.calendar, (row) => row.service_id, errors);
  ensureUnique(
    "calendar_dates.txt",
    input.calendarDates,
    (row) => `${row.service_id}:${row.date}`,
    errors,
  );
  ensureUnique(
    "stop_times.txt",
    input.stopTimes,
    (row) => `${row.trip_id}:${row.stop_sequence}`,
    errors,
  );
  ensureUnique(
    "shapes.txt",
    input.shapes,
    (row) => `${row.shape_id}:${row.shape_pt_sequence}`,
    errors,
  );

  const agencyIds = new Set(
    input.agencies.flatMap((agency) =>
      agency.agency_id ? [agency.agency_id] : [],
    ),
  );
  if (input.agencies.length > 1) {
    for (const route of input.routes) {
      if (!route.agency_id) {
        errors.push(
          `routes.txt route_id=${route.route_id} requires agency_id because agency.txt has multiple agencies`,
        );
      } else if (!agencyIds.has(route.agency_id)) {
        errors.push(
          `routes.txt route_id=${route.route_id} references missing agency_id=${route.agency_id}`,
        );
      }
    }
  }

  for (const route of input.routes) {
    if (!route.route_short_name && !route.route_long_name) {
      errors.push(
        `routes.txt route_id=${route.route_id} requires route_short_name or route_long_name`,
      );
    }
  }

  const stopIds = new Set(input.stops.map((row) => row.stop_id));
  for (const stop of input.stops) {
    if (stop.parent_station && !stopIds.has(stop.parent_station)) {
      errors.push(
        `stops.txt stop_id=${stop.stop_id} references missing parent_station=${stop.parent_station}`,
      );
    }
  }

  const routeIds = new Set(input.routes.map((row) => row.route_id));
  const shapeIds = new Set(input.shapes.map((row) => row.shape_id));
  const serviceIds = new Set([
    ...input.calendar.map((row) => row.service_id),
    ...input.calendarDates.map((row) => row.service_id),
  ]);
  for (const trip of input.trips) {
    if (!routeIds.has(trip.route_id)) {
      errors.push(
        `trips.txt trip_id=${trip.trip_id} references missing route_id=${trip.route_id}`,
      );
    }
    if (!serviceIds.has(trip.service_id)) {
      errors.push(
        `trips.txt trip_id=${trip.trip_id} references missing service_id=${trip.service_id}`,
      );
    }
    if (
      trip.shape_id &&
      input.shapes.length > 0 &&
      !shapeIds.has(trip.shape_id)
    ) {
      errors.push(
        `trips.txt trip_id=${trip.trip_id} references missing shape_id=${trip.shape_id}`,
      );
    }
  }

  const tripIds = new Set(input.trips.map((row) => row.trip_id));
  for (const stopTime of input.stopTimes) {
    if (!tripIds.has(stopTime.trip_id)) {
      errors.push(
        `stop_times.txt trip_id=${stopTime.trip_id} is missing from trips.txt`,
      );
    }
    if (stopTime.stop_id && !stopIds.has(stopTime.stop_id)) {
      errors.push(
        `stop_times.txt trip_id=${stopTime.trip_id} stop_sequence=${stopTime.stop_sequence} references missing stop_id=${stopTime.stop_id}`,
      );
    }
    if (
      !stopTime.stop_id &&
      !stopTime.location_group_id &&
      !stopTime.location_id
    ) {
      errors.push(
        `stop_times.txt trip_id=${stopTime.trip_id} stop_sequence=${stopTime.stop_sequence} requires stop_id, location_group_id, or location_id`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid GTFS static feed relationships:\n${errors
        .slice(0, 50)
        .join("\n")}`,
    );
  }
}

function ensureUnique<T>(
  filename: string,
  rows: T[],
  keyFor: (row: T) => string,
  errors: string[],
) {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = keyFor(row);
    if (seen.has(key)) errors.push(`${filename} has duplicate key ${key}`);
    seen.add(key);
  }
}

function agencyKey(row: AgencyCsvRow) {
  return row.agency_id ?? "__single_agency__";
}

function scopedId(feedOnestopId: string, id: string) {
  return `${feedOnestopId}:${id}`;
}

function normalizeColor(value: string | null) {
  if (!value) return null;
  return `#${value.toUpperCase()}`;
}

function gtfsDate(value: string) {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
