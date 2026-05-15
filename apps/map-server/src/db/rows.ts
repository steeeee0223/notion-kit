import { z } from "zod/v4";

const nullableString = z.string().nullable();
const nullableNumber = z.number().nullable();
const timestampString = z.string();

export const feedRowSchema = z.object({
  onestop_id: z.string(),
  name: nullableString,
  spec: nullableString,
  static_url: nullableString,
  rt_vehicle_positions_url: nullableString,
  rt_trip_updates_url: nullableString,
  rt_alerts_url: nullableString,
  sha1_current: nullableString,
  fetched_at: timestampString.nullable(),
  last_static_sync: timestampString.nullable(),
});

export const agencyRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  agency_id: nullableString,
  agency_name: z.string(),
  agency_url: z.string(),
  agency_timezone: z.string(),
  agency_lang: nullableString,
  agency_phone: nullableString,
  agency_fare_url: nullableString,
  agency_email: nullableString,
  cemv_support: nullableNumber,
});

export const stopRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  stop_id: z.string(),
  onestop_id: nullableString.optional(),
  stop_name: nullableString,
  tts_stop_name: nullableString.optional(),
  stop_desc: nullableString.optional(),
  stop_code: nullableString,
  stop_url: nullableString.optional(),
  stop_timezone: nullableString.optional(),
  location_type: z.number().nullable(),
  wheelchair_boarding: z.number().nullable(),
  platform_code: nullableString.optional(),
  zone_id: nullableString.optional(),
  parent_stop_id: nullableString.optional(),
  level_id: nullableString.optional(),
  stop_access: nullableNumber.optional(),
  lat: nullableNumber,
  lon: nullableNumber,
});

export const routeRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  route_id: z.string(),
  agency_id: nullableString.optional(),
  onestop_id: nullableString.optional(),
  route_short_name: nullableString,
  route_long_name: nullableString,
  route_desc: nullableString.optional(),
  route_type: nullableNumber,
  route_url: nullableString.optional(),
  route_color: nullableString,
  route_text_color: nullableString,
  route_sort_order: nullableNumber.optional(),
  continuous_pickup: nullableNumber.optional(),
  continuous_drop_off: nullableNumber.optional(),
  network_id: nullableString.optional(),
  cemv_support: nullableNumber.optional(),
  agency_name: nullableString,
});

export const shapeRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  shape_id: z.string(),
  geojson: z.unknown().nullable(),
  points: z.unknown().nullable().optional(),
  generated: z.boolean().nullable(),
});

export const tripRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  trip_id: z.string(),
  route_id: z.string(),
  shape_id: z.string().nullable(),
  service_id: z.string(),
  trip_headsign: nullableString,
  trip_short_name: nullableString.optional(),
  direction_id: nullableNumber,
  block_id: nullableString.optional(),
  wheelchair_accessible: nullableNumber,
  bikes_allowed: nullableNumber,
  cars_allowed: nullableNumber.optional(),
  safe_duration_factor: nullableNumber.optional(),
  safe_duration_offset: nullableNumber.optional(),
});

export const stopTimeRowSchema = z.object({
  id: z.number(),
  trip_id: z.string(),
  stop_id: nullableString,
  location_group_id: nullableString.optional(),
  location_id: nullableString.optional(),
  stop_sequence: z.number(),
  arrival_time: nullableString,
  departure_time: nullableString,
  stop_headsign: nullableString,
  start_pickup_drop_off_window: nullableString.optional(),
  end_pickup_drop_off_window: nullableString.optional(),
  pickup_type: nullableNumber,
  drop_off_type: nullableNumber,
  continuous_pickup: nullableNumber.optional(),
  continuous_drop_off: nullableNumber.optional(),
  shape_dist_traveled: nullableNumber.optional(),
  timepoint: nullableNumber.optional(),
  pickup_booking_rule_id: nullableString.optional(),
  drop_off_booking_rule_id: nullableString.optional(),
  interpolated: z.boolean().nullable(),
});

export const calendarRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  service_id: z.string(),
  monday: z.boolean(),
  tuesday: z.boolean(),
  wednesday: z.boolean(),
  thursday: z.boolean(),
  friday: z.boolean(),
  saturday: z.boolean(),
  sunday: z.boolean(),
  start_date: z.string(),
  end_date: z.string(),
});

export const calendarDateRowSchema = z.object({
  id: z.number(),
  feed_onestop_id: z.string(),
  service_id: z.string(),
  date: z.string(),
  exception_type: z.number(),
});

export const vehicleSnapshotRowSchema = z.object({
  id: z.number(),
  feed_onestop_id: z.string(),
  vehicle_id: z.string().nullable(),
  vehicle_label: nullableString,
  trip_id: nullableString,
  route_id: nullableString,
  lat: z.number(),
  lon: z.number(),
  bearing: nullableNumber,
  speed: nullableNumber,
  current_stop_sequence: nullableNumber,
  current_status: nullableString,
  occupancy_status: nullableString,
  vehicle_timestamp: timestampString.nullable(),
  captured_at: timestampString,
});

export const tripUpdateRowSchema = z.object({
  id: z.number(),
  feed_onestop_id: z.string(),
  trip_id: z.string(),
  route_id: nullableString,
  stop_id: nullableString,
  stop_sequence: nullableNumber,
  arrival_delay: nullableNumber,
  departure_delay: nullableNumber,
  schedule_relationship: nullableString,
  captured_at: timestampString,
});

export const alertRowSchema = z.object({
  id: z.number(),
  feed_onestop_id: z.string(),
  cause: nullableString,
  effect: nullableString,
  header_text: nullableString,
  description_text: nullableString,
  affected_routes: z.array(z.string()).nullable().catch(null),
  affected_stops: z.array(z.string()).nullable().catch(null),
  alert_start: timestampString.nullable(),
  alert_end: timestampString.nullable(),
  captured_at: timestampString,
});

export type FeedRow = z.infer<typeof feedRowSchema>;
export type AgencyRow = z.infer<typeof agencyRowSchema>;
export type StopRow = z.infer<typeof stopRowSchema>;
export type RouteRow = z.infer<typeof routeRowSchema>;
export type ShapeRow = z.infer<typeof shapeRowSchema>;
export type TripRow = z.infer<typeof tripRowSchema>;
export type StopTimeRow = z.infer<typeof stopTimeRowSchema>;
export type CalendarRow = z.infer<typeof calendarRowSchema>;
export type CalendarDateRow = z.infer<typeof calendarDateRowSchema>;
export type VehicleSnapshotRow = z.infer<typeof vehicleSnapshotRowSchema>;
export type TripUpdateRow = z.infer<typeof tripUpdateRowSchema>;
export type AlertRow = z.infer<typeof alertRowSchema>;
