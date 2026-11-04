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
  include_shape: optionalBooleanSchema.default(true),
  fallback_route_id: scopedIdSchema.optional(),
});

export const tripStopTimesQuerySchema = z.object({
  date: serviceDateSchema.default(todayServiceDate()),
  include_realtime: optionalBooleanSchema.default(true),
  include_geometry: optionalBooleanSchema.default(false),
  fallback_route_id: scopedIdSchema.optional(),
});
