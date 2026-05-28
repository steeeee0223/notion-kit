import { z } from "zod/v4";

import {
  optionalBooleanSchema,
  scopedIdSchema,
  serviceDateSchema,
  todayServiceDate,
} from "@/lib/schemas";

export const tripParamsSchema = z.object({
  tripId: scopedIdSchema,
});

export const tripRouteQuerySchema = z.object({
  include_shape: optionalBooleanSchema.transform((value) => value ?? true),
  fallback_route_id: scopedIdSchema.optional(),
});

export const tripStopTimesQuerySchema = z.object({
  date: serviceDateSchema.default(todayServiceDate()),
  include_realtime: optionalBooleanSchema.transform((value) => value ?? true),
  include_geometry: optionalBooleanSchema.transform((value) => value ?? false),
  fallback_route_id: scopedIdSchema.optional(),
});
