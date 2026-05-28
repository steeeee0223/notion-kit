import { z } from "zod/v4";

import {
  bboxSchema,
  isoTimestampSchema,
  optionalBooleanSchema,
  positiveIntegerQuerySchema,
  scopedIdSchema,
} from "@/lib/schemas";

export const replayVehiclesQuerySchema = z
  .object({
    start: isoTimestampSchema,
    end: isoTimestampSchema,
    step: positiveIntegerQuerySchema.default(30),
    bbox: bboxSchema.optional(),
    feed_onestop_id: z.string().optional(),
  })
  .refine((query) => Date.parse(query.end) > Date.parse(query.start), {
    message: "end must be after start",
  })
  .refine(
    (query) =>
      Date.parse(query.end) - Date.parse(query.start) <= 2 * 60 * 60 * 1000,
    { message: "Replay range cannot exceed 2 hours" },
  );

export const replaySnapshotQuerySchema = z.object({
  timestamp: isoTimestampSchema,
  bbox: bboxSchema.optional(),
  feed_onestop_id: z.string().optional(),
  trip_id: scopedIdSchema.optional(),
  route_id: scopedIdSchema.optional(),
  vehicle_id: z.string().optional(),
  include_stop_times: optionalBooleanSchema.transform(
    (value) => value ?? false,
  ),
  include_route: optionalBooleanSchema.transform((value) => value ?? false),
  tolerance_seconds: positiveIntegerQuerySchema.max(3600).default(60),
});
