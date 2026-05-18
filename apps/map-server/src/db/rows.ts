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

export const stopRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  stop_id: z.string(),
  onestop_id: nullableString.optional(),
  stop_name: z.string(),
  stop_desc: nullableString.optional(),
  stop_code: nullableString,
  stop_timezone: nullableString.optional(),
  location_type: z.number().nullable(),
  wheelchair_boarding: z.number().nullable(),
  platform_code: nullableString.optional(),
  zone_id: nullableString.optional(),
  parent_stop_id: nullableString.optional(),
  lat: z.number(),
  lon: z.number(),
});

export const routeRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  route_id: z.string(),
  onestop_id: nullableString.optional(),
  route_short_name: nullableString,
  route_long_name: nullableString,
  route_type: nullableNumber,
  route_color: nullableString,
  route_text_color: nullableString,
  agency_name: nullableString,
});

export const shapeRowSchema = z.object({
  id: z.string(),
  feed_onestop_id: z.string(),
  shape_id: z.string(),
  geojson: z.unknown().nullable(),
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
  direction_id: nullableNumber,
  wheelchair_accessible: nullableNumber,
  bikes_allowed: nullableNumber,
});

export const stopTimeRowSchema = z.object({
  id: z.number(),
  trip_id: z.string(),
  stop_id: z.string(),
  stop_sequence: z.number(),
  arrival_time: nullableString,
  departure_time: nullableString,
  stop_headsign: nullableString,
  pickup_type: nullableNumber,
  drop_off_type: nullableNumber,
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
