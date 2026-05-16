import { z } from "zod/v4";

export const bboxSchema = z.string().transform((value, ctx) => {
  const parts = value.split(",").map((part) => Number(part.trim()));
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    ctx.addIssue({
      code: "custom",
      message: "bbox must be min_lon,min_lat,max_lon,max_lat",
    });
    return z.NEVER;
  }
  const [minLon, minLat, maxLon, maxLat] = parts as [
    number,
    number,
    number,
    number,
  ];
  if (minLon >= maxLon || minLat >= maxLat) {
    ctx.addIssue({
      code: "custom",
      message: "bbox minimums must be less than maximums",
    });
    return z.NEVER;
  }
  return [minLon, minLat, maxLon, maxLat] as const;
});

export const optionalBooleanSchema = z
  .union([z.boolean(), z.string(), z.undefined()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return ["true", "1", "yes"].includes(value.toLowerCase());
    }
    return undefined;
  });

export const integerQuerySchema = z.coerce.number().int();
export const positiveIntegerQuerySchema = integerQuerySchema.positive();
export const isoTimestampSchema = z.iso.datetime({ offset: true });
export const serviceDateSchema = z.iso.date();
export const gtfsTimeSchema = z
  .string()
  .regex(/^\d{2,3}:[0-5]\d:[0-5]\d$/, "Expected HH:MM:SS");

export type Bbox = z.infer<typeof bboxSchema>;

export function secondsToGtfsTime(totalSeconds: number) {
  const normalized = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(normalized / 3600);
  const minutes = Math.floor((normalized % 3600) / 60);
  const seconds = normalized % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

export function gtfsTimeToSeconds(value: string) {
  const [hours, minutes, seconds] = value
    .split(":")
    .map((part) => Number(part));
  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}

export function addSecondsToGtfsTime(value: string | null, seconds: number) {
  if (!value) return null;
  return secondsToGtfsTime(gtfsTimeToSeconds(value) + seconds);
}

export function todayServiceDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function currentGtfsTime(now = new Date()) {
  return secondsToGtfsTime(
    now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds(),
  );
}

export function withinBbox(point: { lat: number; lon: number }, bbox?: Bbox) {
  if (!bbox) return true;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return (
    point.lon >= minLon &&
    point.lon <= maxLon &&
    point.lat >= minLat &&
    point.lat <= maxLat
  );
}

export function quantizeBbox(bbox: Bbox) {
  return bbox.map((value) => value.toFixed(2)).join(",");
}
