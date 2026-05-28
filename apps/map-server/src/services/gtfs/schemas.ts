import { z } from "zod/v4";

const emptyToUndefined = (value: unknown) =>
  value === null || (typeof value === "string" && value.trim() === "")
    ? undefined
    : value;

const requiredString = z.string().min(1);
const optionalString = z
  .preprocess(emptyToUndefined, z.string().min(1).optional())
  .transform((value) => value ?? null);

const integerString = z.union([
  z.number().int(),
  z
    .string()
    .regex(/^-?\d+$/)
    .transform(Number)
    .pipe(z.number().int()),
]);
const floatString = z.union([
  z.number(),
  z
    .string()
    .regex(/^-?(?:\d+|\d*\.\d+)$/)
    .transform(Number)
    .pipe(z.number()),
]);

const requiredInteger = integerString;

const optionalInteger = z
  .preprocess(emptyToUndefined, integerString.optional())
  .transform((value) => value ?? null);

const requiredFloat = floatString;

const optionalFloat = z
  .preprocess(emptyToUndefined, floatString.optional())
  .transform((value) => value ?? null);

const requiredGtfsDate = z.string().regex(/^\d{8}$/);
const requiredGtfsTime = z.string().regex(/^\d{1,3}:[0-5]\d:[0-5]\d$/);
const optionalGtfsTime = z
  .preprocess(emptyToUndefined, requiredGtfsTime.optional())
  .transform((value) => value ?? null);
const optionalColor = z
  .preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^[0-9A-Fa-f]{6}$/)
      .optional(),
  )
  .transform((value) => value ?? null);
const requiredServiceDay = z.union([
  z.boolean(),
  z
    .string()
    .regex(/^[01]$/)
    .transform((value) => value === "1"),
]);

export const agencyFileSchema = z.object({
  agency_id: optionalString,
  agency_name: requiredString,
  agency_url: requiredString,
  agency_timezone: requiredString,
  agency_lang: optionalString,
  agency_phone: optionalString,
  agency_fare_url: optionalString,
  agency_email: optionalString,
  cemv_support: optionalInteger,
});

export const stopFileSchema = z.object({
  stop_id: requiredString,
  stop_code: optionalString,
  stop_name: optionalString,
  tts_stop_name: optionalString,
  stop_desc: optionalString,
  stop_lat: optionalFloat,
  stop_lon: optionalFloat,
  zone_id: optionalString,
  stop_url: optionalString,
  location_type: optionalInteger,
  parent_station: optionalString,
  stop_timezone: optionalString,
  wheelchair_boarding: optionalInteger,
  level_id: optionalString,
  platform_code: optionalString,
  stop_access: optionalInteger,
});

export const routeFileSchema = z.object({
  route_id: requiredString,
  agency_id: optionalString,
  route_short_name: optionalString,
  route_long_name: optionalString,
  route_desc: optionalString,
  route_type: requiredInteger,
  route_url: optionalString,
  route_color: optionalColor,
  route_text_color: optionalColor,
  route_sort_order: optionalInteger,
  continuous_pickup: optionalInteger,
  continuous_drop_off: optionalInteger,
  network_id: optionalString,
  cemv_support: optionalInteger,
});

export const tripFileSchema = z.object({
  route_id: requiredString,
  service_id: requiredString,
  trip_id: requiredString,
  trip_headsign: optionalString,
  trip_short_name: optionalString,
  direction_id: optionalInteger,
  block_id: optionalString,
  shape_id: optionalString,
  wheelchair_accessible: optionalInteger,
  bikes_allowed: optionalInteger,
  cars_allowed: optionalInteger,
  safe_duration_factor: optionalFloat,
  safe_duration_offset: optionalInteger,
});

export const stopTimeFileSchema = z.object({
  trip_id: requiredString,
  arrival_time: optionalGtfsTime,
  departure_time: optionalGtfsTime,
  stop_id: optionalString,
  location_group_id: optionalString,
  location_id: optionalString,
  stop_sequence: requiredInteger,
  stop_headsign: optionalString,
  start_pickup_drop_off_window: optionalGtfsTime,
  end_pickup_drop_off_window: optionalGtfsTime,
  pickup_type: optionalInteger,
  drop_off_type: optionalInteger,
  continuous_pickup: optionalInteger,
  continuous_drop_off: optionalInteger,
  shape_dist_traveled: optionalFloat,
  timepoint: optionalInteger,
  pickup_booking_rule_id: optionalString,
  drop_off_booking_rule_id: optionalString,
});

export const calendarFileSchema = z.object({
  service_id: requiredString,
  monday: requiredServiceDay,
  tuesday: requiredServiceDay,
  wednesday: requiredServiceDay,
  thursday: requiredServiceDay,
  friday: requiredServiceDay,
  saturday: requiredServiceDay,
  sunday: requiredServiceDay,
  start_date: requiredGtfsDate,
  end_date: requiredGtfsDate,
});

export const calendarDateFileSchema = z.object({
  service_id: requiredString,
  date: requiredGtfsDate,
  exception_type: requiredInteger,
});

export const shapeFileSchema = z.object({
  shape_id: requiredString,
  shape_pt_lat: requiredFloat,
  shape_pt_lon: requiredFloat,
  shape_pt_sequence: requiredInteger,
  shape_dist_traveled: optionalFloat,
});

export type AgencyCsvRow = z.infer<typeof agencyFileSchema>;
export type StopCsvRow = z.infer<typeof stopFileSchema>;
export type RouteCsvRow = z.infer<typeof routeFileSchema>;
export type TripCsvRow = z.infer<typeof tripFileSchema>;
export type StopTimeCsvRow = z.infer<typeof stopTimeFileSchema>;
export type CalendarCsvRow = z.infer<typeof calendarFileSchema>;
export type CalendarDateCsvRow = z.infer<typeof calendarDateFileSchema>;
export type ShapeCsvRow = z.infer<typeof shapeFileSchema>;
