import { z } from "zod/v4";

import {
  bboxSchema,
  integerQuerySchema,
  optionalBooleanSchema,
  positiveIntegerQuerySchema,
} from "@/lib/schemas";

export const mapStopsQuerySchema = z
  .object({
    bbox: bboxSchema.optional(),
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
    radius: z.coerce.number().positive().max(10000).optional(),
    route_type: integerQuerySchema.optional(),
    include_alerts: optionalBooleanSchema.transform((value) => value ?? false),
    limit: positiveIntegerQuerySchema.max(500).default(200),
  })
  .refine(
    (query) => Boolean(query.bbox ?? (query.lat && query.lon && query.radius)),
    {
      message: "Provide bbox or lat+lon+radius",
    },
  )
  .transform((query) => ({
    ...query,
    bbox:
      query.bbox ??
      radiusToBbox(query.lat ?? 0, query.lon ?? 0, query.radius ?? 0),
  }));

export const mapVehiclesQuerySchema = z.object({
  bbox: bboxSchema.optional(),
  feed_onestop_id: z.string().optional(),
  route_type: integerQuerySchema.optional(),
});

function radiusToBbox(lat: number, lon: number, radiusMeters: number) {
  const latDelta = radiusMeters / 111_320;
  const lonDelta = radiusMeters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [
    lon - lonDelta,
    lat - latDelta,
    lon + lonDelta,
    lat + latDelta,
  ] as const;
}
