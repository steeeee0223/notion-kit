import { notFound } from "@/lib/api-error";
import type { StaticFeedStatusCandidate } from "@/services/static-feed-status";

import type { TransportProviderAdapter } from "./types";

const PROVIDER_KEY = "simulator";
const SIM_FEED_ID = "sim-feed";
const SIM_TIMESTAMP = "2026-05-27T00:00:00.000Z";
const SIM_COUNTS = {
  stops: 3,
  routes: 1,
  trips: 1,
  stopTimes: 3,
};

const simulatorStops = [
  {
    id: `${SIM_FEED_ID}:stop-central`,
    provider_key: PROVIDER_KEY,
    stop_id: "central",
    stop_name: "Central Station",
    tts_stop_name: null,
    stop_desc: "Downtown simulator hub",
    stop_code: "CEN",
    stop_url: null,
    zone_id: null,
    parent_stop_id: null,
    stop_timezone: "Asia/Taipei",
    platform_code: "1",
    level_id: null,
    stop_access: null,
    lat: 25.0478,
    lon: 121.517,
    location_type: 0,
    wheelchair_boarding: 1,
    feed_onestop_id: SIM_FEED_ID,
    alerts: [],
  },
  {
    id: `${SIM_FEED_ID}:stop-riverside`,
    provider_key: PROVIDER_KEY,
    stop_id: "riverside",
    stop_name: "Riverside",
    tts_stop_name: null,
    stop_desc: null,
    stop_code: "RIV",
    stop_url: null,
    zone_id: null,
    parent_stop_id: null,
    stop_timezone: "Asia/Taipei",
    platform_code: "2",
    level_id: null,
    stop_access: null,
    lat: 25.052,
    lon: 121.526,
    location_type: 0,
    wheelchair_boarding: 1,
    feed_onestop_id: SIM_FEED_ID,
    alerts: [],
  },
  {
    id: `${SIM_FEED_ID}:stop-harbor`,
    provider_key: PROVIDER_KEY,
    stop_id: "harbor",
    stop_name: "Harbor Terminal",
    tts_stop_name: null,
    stop_desc: null,
    stop_code: "HAR",
    stop_url: null,
    zone_id: null,
    parent_stop_id: null,
    stop_timezone: "Asia/Taipei",
    platform_code: "3",
    level_id: null,
    stop_access: null,
    lat: 25.059,
    lon: 121.536,
    location_type: 0,
    wheelchair_boarding: 1,
    feed_onestop_id: SIM_FEED_ID,
    alerts: [],
  },
];

const centralStop = simulatorStops[0]!;

const simulatorRoute = {
  id: `${SIM_FEED_ID}:route-blue`,
  provider_key: PROVIDER_KEY,
  feed_onestop_id: SIM_FEED_ID,
  route_id: "route-blue",
  agency_id: `${SIM_FEED_ID}:agency-sim`,
  route_short_name: "BLUE",
  route_long_name: "Blue Line",
  route_desc: "Simulator loop route",
  route_type: 3,
  route_url: null,
  route_color: "0069D9",
  route_text_color: "FFFFFF",
  route_sort_order: 1,
  continuous_pickup: null,
  continuous_drop_off: null,
  network_id: null,
  cemv_support: null,
  agency_name: "Simulator Transit",
};

const simulatorTrip = {
  id: `${SIM_FEED_ID}:trip-blue-1`,
  provider_key: PROVIDER_KEY,
  trip_id: "trip-blue-1",
  route_id: simulatorRoute.id,
  service_id: `${SIM_FEED_ID}:service-weekday`,
  shape_id: `${SIM_FEED_ID}:shape-blue`,
  trip_headsign: "Harbor Terminal",
  trip_short_name: "BLUE-1",
  direction_id: 0,
  block_id: null,
  wheelchair_accessible: 1,
  bikes_allowed: 1,
  cars_allowed: null,
  safe_duration_factor: null,
  safe_duration_offset: null,
  first_departure_time: "08:00:00",
  last_departure_time: "08:20:00",
  matching_stop_times_count: 3,
};

const simulatorShape = {
  shape_id: `${SIM_FEED_ID}:shape-blue`,
  geojson: {
    type: "LineString",
    coordinates: simulatorStops.map((stop) => [stop.lon, stop.lat]),
  },
  points: simulatorStops.map((stop, index) => ({
    shape_pt_lat: stop.lat,
    shape_pt_lon: stop.lon,
    shape_pt_sequence: index + 1,
    shape_dist_traveled: index * 1.4,
  })),
  generated: false,
};

const simulatorDepartures = [
  {
    provider_key: PROVIDER_KEY,
    trip_id: simulatorTrip.id,
    route_id: simulatorRoute.id,
    route_short_name: simulatorRoute.route_short_name,
    route_long_name: simulatorRoute.route_long_name,
    route_color: simulatorRoute.route_color,
    route_type: simulatorRoute.route_type,
    trip_headsign: simulatorTrip.trip_headsign,
    direction_id: simulatorTrip.direction_id,
    stop_sequence: 1,
    service_date: "2026-05-27",
    stop_id: centralStop.id,
    location_group_id: null,
    location_id: null,
    scheduled_arrival: "08:00:00",
    scheduled_departure: "08:00:00",
    start_pickup_drop_off_window: null,
    end_pickup_drop_off_window: null,
    pickup_type: 0,
    drop_off_type: 0,
    continuous_pickup: null,
    continuous_drop_off: null,
    shape_dist_traveled: 0,
    timepoint: 1,
    pickup_booking_rule_id: null,
    drop_off_booking_rule_id: null,
    realtime_arrival_delay: 0,
    realtime_departure_delay: 0,
    estimated_departure: "08:00:00",
    schedule_relationship: "SCHEDULED",
    is_realtime: true,
  },
];

const simulatorStopTimes = simulatorStops.map((stop, index) => ({
  stop_sequence: index + 1,
  stop_id: stop.id,
  location_group_id: null,
  location_id: null,
  stop_name: stop.stop_name,
  lat: stop.lat,
  lon: stop.lon,
  scheduled_arrival: `08:${String(index * 10).padStart(2, "0")}:00`,
  scheduled_departure: `08:${String(index * 10).padStart(2, "0")}:00`,
  stop_headsign: simulatorTrip.trip_headsign,
  start_pickup_drop_off_window: null,
  end_pickup_drop_off_window: null,
  pickup_type: 0,
  drop_off_type: 0,
  continuous_pickup: null,
  continuous_drop_off: null,
  shape_dist_traveled: index * 1.4,
  timepoint: 1,
  pickup_booking_rule_id: null,
  drop_off_booking_rule_id: null,
  realtime_arrival_delay: 0,
  realtime_departure_delay: 0,
  estimated_departure: `08:${String(index * 10).padStart(2, "0")}:00`,
  schedule_relationship: "SCHEDULED",
  is_timepoint: true,
  stop_status: index === 0 ? "CURRENT" : "UPCOMING",
}));

const simulatorVehicles = [
  {
    vehicle_id: "sim-vehicle-1",
    provider_key: PROVIDER_KEY,
    vehicle_label: "Simulator 1",
    trip_id: simulatorTrip.id,
    route_id: simulatorRoute.id,
    route_short_name: simulatorRoute.route_short_name,
    route_long_name: simulatorRoute.route_long_name,
    route_color: simulatorRoute.route_color,
    route_type: simulatorRoute.route_type,
    lat: 25.05,
    lon: 121.521,
    bearing: 88,
    speed: 9.5,
    current_stop_sequence: 1,
    current_status: "IN_TRANSIT_TO",
    occupancy_status: "MANY_SEATS_AVAILABLE",
    captured_at: SIM_TIMESTAMP,
  },
];

export const simulatorAdapter: TransportProviderAdapter = {
  key: PROVIDER_KEY,
  displayName: "Simulator",
  kind: "simulator",
  capabilities: [
    "static_schedule",
    "realtime_vehicles",
    "trip_updates",
    "alerts",
    "departures",
  ],
  requiredCredentialKeys: [],
  healthCheck: () => Promise.resolve({ ok: true }),
  discoverStaticFeeds: () =>
    Promise.resolve({
      candidates: [buildSimulatorFeedCandidate()],
      meta: {
        provider: PROVIDER_KEY,
        total: 1,
        generated_at: SIM_TIMESTAMP,
      },
    }),
  syncStatic: (input) => {
    const feedIds = input.feedIds?.length ? input.feedIds : [SIM_FEED_ID];
    return Promise.resolve({
      synced: feedIds.map((feedOnestopId) => ({
        feedOnestopId,
        sha1: "simulator",
        status: "skipped",
        stopsCount: SIM_COUNTS.stops,
        routesCount: SIM_COUNTS.routes,
        tripsCount: SIM_COUNTS.trips,
        stopTimesCount: SIM_COUNTS.stopTimes,
        durationMs: 0,
      })),
      errors: [],
    });
  },
  syncRealtime: (input) => {
    const feedIds = input.feedIds?.length ? input.feedIds : [SIM_FEED_ID];
    return Promise.resolve({
      synced: feedIds.map((feedOnestopId) => ({
        feedOnestopId,
        vehiclesCount: simulatorVehicles.length,
      })),
      errors: [],
    });
  },
  findStops: (input) => {
    const stops = filterByFeed(simulatorStops, input.feedOnestopId).slice(
      0,
      input.limit,
    );
    return Promise.resolve({
      stops,
      meta: {
        total: stops.length,
        ...(input.bbox ? { bbox: input.bbox } : {}),
        ...(input.feedOnestopId
          ? {
              feed_onestop_id: input.feedOnestopId,
              static_feed: buildSimulatorStaticFeedMeta(input.feedOnestopId),
            }
          : {}),
      },
    });
  },
  findRoutes: (input) => {
    const routes =
      input.feedOnestopId === SIM_FEED_ID &&
      (typeof input.routeType !== "number" ||
        input.routeType === simulatorRoute.route_type)
        ? [simulatorRoute].slice(0, input.limit)
        : [];
    return Promise.resolve({
      routes,
      meta: {
        total: routes.length,
        feed_onestop_id: input.feedOnestopId,
        static_feed: buildSimulatorStaticFeedMeta(input.feedOnestopId),
      },
    });
  },
  findTrips: (input) => {
    const trips =
      input.routeId === simulatorRoute.id &&
      (typeof input.directionId !== "number" ||
        input.directionId === simulatorTrip.direction_id)
        ? [simulatorTrip].slice(0, input.limit)
        : [];
    return Promise.resolve({
      trips,
      meta: {
        total: trips.length,
        route_id: input.routeId,
        service_date: input.serviceDate,
        start_time: input.startTime,
        end_time: input.endTime,
      },
    });
  },
  findRouteShape: (input) => {
    if (input.routeId !== simulatorRoute.id) {
      return Promise.reject(
        notFound("Route not found", { routeId: input.routeId }),
      );
    }

    return Promise.resolve({
      trip: simulatorTrip,
      route: simulatorRoute,
      shape: input.includeShape ? simulatorShape : null,
    });
  },
  findDepartures: (input) => {
    const stop = simulatorStops.find((stop) => stop.id === input.stopId);
    if (!stop) {
      return Promise.reject(
        notFound("Stop not found", { stopId: input.stopId }),
      );
    }

    const departures =
      input.stopId === centralStop.id
        ? simulatorDepartures
            .slice(0, input.limit)
            .map((departure) =>
              buildSimulatorDeparture(
                departure,
                input.date,
                input.includeRealtime,
              ),
            )
        : [];
    return Promise.resolve({
      stop,
      departures,
      alerts: [],
      meta: {
        date: input.date,
        start_time: input.startTime,
        end_time: input.endTime,
        realtime_available: input.includeRealtime,
      },
    });
  },
  findVehicles: (input) => {
    const vehicles =
      (input.feedOnestopId && input.feedOnestopId !== SIM_FEED_ID) ||
      (typeof input.routeType === "number" &&
        input.routeType !== simulatorRoute.route_type)
        ? []
        : simulatorVehicles;
    return Promise.resolve({
      vehicles,
      meta: {
        snapshot_age_seconds: 0,
        snapshot_available: vehicles.length > 0,
      },
    });
  },
  findTripRoute: (input) => {
    if (input.tripId !== simulatorTrip.id) {
      return Promise.reject(
        notFound("Trip not found", { tripId: input.tripId }),
      );
    }
    return Promise.resolve({
      trip: simulatorTrip,
      route: simulatorRoute,
      shape: input.includeShape ? simulatorShape : null,
      alerts: [],
    });
  },
  findTripStopTimes: (input) => {
    if (input.tripId !== simulatorTrip.id) {
      return Promise.reject(
        notFound("Trip not found", { tripId: input.tripId }),
      );
    }
    return Promise.resolve({
      trip_id: simulatorTrip.id,
      route_short_name: simulatorRoute.route_short_name,
      service_date: input.date,
      stop_times: simulatorStopTimes.map((stopTime) =>
        input.includeRealtime
          ? stopTime
          : {
              ...stopTime,
              realtime_arrival_delay: null,
              realtime_departure_delay: null,
              schedule_relationship: "STATIC",
            },
      ),
    });
  },
};

function buildSimulatorFeedCandidate(): StaticFeedStatusCandidate {
  return {
    feed_lookup_key: SIM_FEED_ID,
    feed_onestop_id: SIM_FEED_ID,
    name: "Simulator Transit",
    spec: "gtfs",
    status: "current",
    is_strong_match: true,
    version: {
      sha1: "simulator",
      fetched_at: SIM_TIMESTAMP,
    },
    local: {
      exists: true,
      sha1: "simulator",
      fetched_at: SIM_TIMESTAMP,
      last_static_sync: SIM_TIMESTAMP,
      counts: SIM_COUNTS,
    },
  };
}

function buildSimulatorStaticFeedMeta(feedOnestopId: string) {
  return {
    feed_onestop_id: feedOnestopId,
    status: feedOnestopId === SIM_FEED_ID ? "current" : "missing",
    sha1: feedOnestopId === SIM_FEED_ID ? "simulator" : null,
    fetched_at: feedOnestopId === SIM_FEED_ID ? SIM_TIMESTAMP : null,
    last_static_sync: feedOnestopId === SIM_FEED_ID ? SIM_TIMESTAMP : null,
    counts: feedOnestopId === SIM_FEED_ID ? SIM_COUNTS : emptyCounts(),
  };
}

function emptyCounts() {
  return {
    stops: 0,
    routes: 0,
    trips: 0,
    stopTimes: 0,
  };
}

function filterByFeed<T extends { feed_onestop_id: string }>(
  records: T[],
  feedOnestopId?: string,
) {
  if (!feedOnestopId) return records;
  return records.filter((record) => record.feed_onestop_id === feedOnestopId);
}

function buildSimulatorDeparture(
  departure: (typeof simulatorDepartures)[number],
  serviceDate: string,
  includeRealtime: boolean,
) {
  return {
    ...departure,
    service_date: serviceDate,
    ...(includeRealtime
      ? {}
      : {
          realtime_arrival_delay: null,
          realtime_departure_delay: null,
          schedule_relationship: "STATIC",
          is_realtime: false,
        }),
  };
}
