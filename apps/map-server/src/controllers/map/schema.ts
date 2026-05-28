import { z } from "zod/v4";

import {
  bboxSchema,
  gtfsTimeSchema,
  integerQuerySchema,
  optionalBooleanSchema,
  positiveIntegerQuerySchema,
  scopedIdSchema,
  serviceDateSchema,
  todayServiceDate,
} from "@/lib/schemas";

export const mapStopsQuerySchema = z
  .object({
    feed_onestop_id: z.string().min(1).optional(),
    bbox: bboxSchema.optional(),
    lat: z.coerce.number().optional(),
    lon: z.coerce.number().optional(),
    radius: z.coerce.number().positive().max(10000).optional(),
    route_type: integerQuerySchema.optional(),
    include_alerts: optionalBooleanSchema.transform((value) => value ?? false),
    limit: positiveIntegerQuerySchema.max(500).default(200),
  })
  .refine(
    (query) =>
      Boolean(
        query.feed_onestop_id ??
          query.bbox ??
          (query.lat !== undefined &&
            query.lon !== undefined &&
            query.radius !== undefined),
      ),
    {
      message: "Provide feed_onestop_id, bbox, or lat+lon+radius",
    },
  )
  .transform((query) => ({
    ...query,
    bbox:
      query.bbox ??
      (query.lat !== undefined &&
      query.lon !== undefined &&
      query.radius !== undefined
        ? radiusToBbox(query.lat, query.lon, query.radius)
        : undefined),
  }));

export const mapRoutesQuerySchema = z.object({
  feed_onestop_id: z.string().min(1),
  route_type: integerQuerySchema.optional(),
  limit: positiveIntegerQuerySchema.max(500).default(200),
});

export const mapTripsQuerySchema = z
  .object({
    route_id: scopedIdSchema,
    service_date: serviceDateSchema.default(todayServiceDate()),
    start_time: gtfsTimeSchema.default("00:00:00"),
    end_time: gtfsTimeSchema.default("29:59:59"),
    direction_id: integerQuerySchema.optional(),
    limit: positiveIntegerQuerySchema.max(500).default(100),
  })
  .refine((query) => query.end_time > query.start_time, {
    message: "end_time must be after start_time",
  });

export const mapRouteShapeQuerySchema = z.object({
  route_id: scopedIdSchema,
  include_shape: optionalBooleanSchema.transform((value) => value ?? true),
});

export const staticFeedsStatusQuerySchema = z.object({
  bbox: bboxSchema,
});

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
