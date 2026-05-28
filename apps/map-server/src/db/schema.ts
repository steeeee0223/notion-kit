import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const feeds = pgTable("feeds", {
  onestopId: text("onestop_id").primaryKey(),
  name: text("name"),
  spec: text("spec"),
  staticUrl: text("static_url"),
  rtVehiclePositionsUrl: text("rt_vehicle_positions_url"),
  rtTripUpdatesUrl: text("rt_trip_updates_url"),
  rtAlertsUrl: text("rt_alerts_url"),
  sha1Current: text("sha1_current"),
  fetchedAt: timestamp("fetched_at"),
  lastStaticSync: timestamp("last_static_sync"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const agencies = pgTable(
  "agencies",
  {
    id: text("id").primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    agencyId: text("agency_id"),
    agencyName: text("agency_name").notNull(),
    agencyUrl: text("agency_url").notNull(),
    agencyTimezone: text("agency_timezone").notNull(),
    agencyLang: text("agency_lang"),
    agencyPhone: text("agency_phone"),
    agencyFareUrl: text("agency_fare_url"),
    agencyEmail: text("agency_email"),
    cemvSupport: integer("cemv_support"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("agencies_feed_idx").on(table.feedOnestopId)],
);

export const stops = pgTable(
  "stops",
  {
    id: text("id").primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    stopId: text("stop_id").notNull(),
    onestopId: text("onestop_id"),
    stopName: text("stop_name"),
    ttsStopName: text("tts_stop_name"),
    stopDesc: text("stop_desc"),
    stopCode: text("stop_code"),
    stopUrl: text("stop_url"),
    stopTimezone: text("stop_timezone"),
    locationType: integer("location_type").default(0),
    wheelchairBoarding: integer("wheelchair_boarding").default(0),
    platformCode: text("platform_code"),
    zoneId: text("zone_id"),
    parentStopId: text("parent_stop_id"),
    levelId: text("level_id"),
    stopAccess: integer("stop_access"),
    lat: real("lat"),
    lon: real("lon"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("stops_lat_lon_idx").on(table.lat, table.lon),
    index("stops_feed_idx").on(table.feedOnestopId),
  ],
);

export const routes = pgTable(
  "routes",
  {
    id: text("id").primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    routeId: text("route_id").notNull(),
    agencyId: text("agency_id"),
    onestopId: text("onestop_id"),
    routeShortName: text("route_short_name"),
    routeLongName: text("route_long_name"),
    routeDesc: text("route_desc"),
    routeType: integer("route_type"),
    routeUrl: text("route_url"),
    routeColor: text("route_color"),
    routeTextColor: text("route_text_color"),
    routeSortOrder: integer("route_sort_order"),
    continuousPickup: integer("continuous_pickup"),
    continuousDropOff: integer("continuous_drop_off"),
    networkId: text("network_id"),
    cemvSupport: integer("cemv_support"),
    agencyName: text("agency_name"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("routes_feed_idx").on(table.feedOnestopId),
    index("routes_route_id_idx").on(table.routeId),
  ],
);

export const shapes = pgTable("shapes", {
  id: text("id").primaryKey(),
  feedOnestopId: text("feed_onestop_id")
    .notNull()
    .references(() => feeds.onestopId),
  shapeId: text("shape_id").notNull(),
  geojson: jsonb("geojson"),
  points: jsonb("points"),
  generated: boolean("generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trips = pgTable(
  "trips",
  {
    id: text("id").primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    tripId: text("trip_id").notNull(),
    routeId: text("route_id").notNull(),
    shapeId: text("shape_id"),
    serviceId: text("service_id").notNull(),
    tripHeadsign: text("trip_headsign"),
    tripShortName: text("trip_short_name"),
    directionId: integer("direction_id"),
    blockId: text("block_id"),
    wheelchairAccessible: integer("wheelchair_accessible"),
    bikesAllowed: integer("bikes_allowed"),
    carsAllowed: integer("cars_allowed"),
    safeDurationFactor: real("safe_duration_factor"),
    safeDurationOffset: integer("safe_duration_offset"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("trips_route_idx").on(table.routeId),
    index("trips_service_idx").on(table.serviceId),
    index("trips_trip_id_idx").on(table.tripId),
  ],
);

export const stopTimes = pgTable(
  "stop_times",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    tripId: text("trip_id").notNull(),
    stopId: text("stop_id"),
    locationGroupId: text("location_group_id"),
    locationId: text("location_id"),
    stopSequence: integer("stop_sequence").notNull(),
    arrivalTime: text("arrival_time"),
    departureTime: text("departure_time"),
    stopHeadsign: text("stop_headsign"),
    startPickupDropOffWindow: text("start_pickup_drop_off_window"),
    endPickupDropOffWindow: text("end_pickup_drop_off_window"),
    pickupType: integer("pickup_type").default(0),
    dropOffType: integer("drop_off_type").default(0),
    continuousPickup: integer("continuous_pickup"),
    continuousDropOff: integer("continuous_drop_off"),
    shapeDistTraveled: real("shape_dist_traveled"),
    timepoint: integer("timepoint"),
    pickupBookingRuleId: text("pickup_booking_rule_id"),
    dropOffBookingRuleId: text("drop_off_booking_rule_id"),
    interpolated: boolean("interpolated").default(false),
  },
  (table) => [
    index("stop_times_trip_idx").on(table.tripId),
    index("stop_times_stop_idx").on(table.stopId),
    index("stop_times_trip_seq_idx").on(table.tripId, table.stopSequence),
  ],
);

export const calendar = pgTable(
  "calendar",
  {
    id: text("id").primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    serviceId: text("service_id").notNull(),
    monday: boolean("monday").notNull(),
    tuesday: boolean("tuesday").notNull(),
    wednesday: boolean("wednesday").notNull(),
    thursday: boolean("thursday").notNull(),
    friday: boolean("friday").notNull(),
    saturday: boolean("saturday").notNull(),
    sunday: boolean("sunday").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
  },
  (table) => [index("calendar_service_idx").on(table.serviceId)],
);

export const calendarDates = pgTable(
  "calendar_dates",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    feedOnestopId: text("feed_onestop_id")
      .notNull()
      .references(() => feeds.onestopId),
    serviceId: text("service_id").notNull(),
    date: date("date").notNull(),
    exceptionType: integer("exception_type").notNull(),
  },
  (table) => [
    index("cal_dates_service_date_idx").on(table.serviceId, table.date),
  ],
);

export const vehiclePositionSnapshots = pgTable(
  "vehicle_position_snapshots",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    feedOnestopId: text("feed_onestop_id").notNull(),
    vehicleId: text("vehicle_id"),
    vehicleLabel: text("vehicle_label"),
    tripId: text("trip_id"),
    routeId: text("route_id"),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    bearing: real("bearing"),
    speed: real("speed"),
    currentStopSequence: integer("current_stop_sequence"),
    currentStatus: text("current_status"),
    occupancyStatus: text("occupancy_status"),
    vehicleTimestamp: timestamp("vehicle_timestamp"),
    capturedAt: timestamp("captured_at").notNull(),
  },
  (table) => [
    index("vps_captured_at_idx").on(table.capturedAt),
    index("vps_trip_idx").on(table.tripId),
    index("vps_feed_time_idx").on(table.feedOnestopId, table.capturedAt),
    index("vps_lat_lon_time_idx").on(table.lat, table.lon, table.capturedAt),
  ],
);

export const tripUpdateSnapshots = pgTable(
  "trip_update_snapshots",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    feedOnestopId: text("feed_onestop_id").notNull(),
    tripId: text("trip_id").notNull(),
    routeId: text("route_id"),
    stopId: text("stop_id"),
    stopSequence: integer("stop_sequence"),
    arrivalDelay: integer("arrival_delay"),
    departureDelay: integer("departure_delay"),
    scheduleRelationship: text("schedule_relationship"),
    capturedAt: timestamp("captured_at").notNull(),
  },
  (table) => [
    index("tus_captured_at_idx").on(table.capturedAt),
    index("tus_trip_stop_idx").on(table.tripId, table.stopId),
  ],
);

export const alertSnapshots = pgTable(
  "alert_snapshots",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    feedOnestopId: text("feed_onestop_id").notNull(),
    cause: text("cause"),
    effect: text("effect"),
    headerText: text("header_text"),
    descriptionText: text("description_text"),
    affectedRoutes: jsonb("affected_routes"),
    affectedStops: jsonb("affected_stops"),
    alertStart: timestamp("alert_start"),
    alertEnd: timestamp("alert_end"),
    capturedAt: timestamp("captured_at").notNull(),
  },
  (table) => [index("as_captured_at_idx").on(table.capturedAt)],
);

export const cache = pgTable(
  "cache",
  {
    key: text("key").primaryKey(),
    value: jsonb("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("cache_expires_idx").on(table.expiresAt)],
);

export const config = pgTable("config", {
  adminToken: text("admin_token").primaryKey(),
  credentials: jsonb("credentials")
    .$type<Record<string, string | null>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
