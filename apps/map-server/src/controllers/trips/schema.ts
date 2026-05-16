import { z } from "zod/v4";

import {
  optionalBooleanSchema,
  serviceDateSchema,
  todayServiceDate,
} from "@/lib/schemas";

export const tripParamsSchema = z.object({
  tripId: z.string().min(1),
});

export const tripRouteQuerySchema = z.object({
  include_shape: optionalBooleanSchema.transform((value) => value ?? true),
});

export const tripStopTimesQuerySchema = z.object({
  date: serviceDateSchema.default(todayServiceDate()),
  include_realtime: optionalBooleanSchema.transform((value) => value ?? true),
  include_geometry: optionalBooleanSchema.transform((value) => value ?? false),
});
