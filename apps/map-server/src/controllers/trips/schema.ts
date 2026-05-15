import { z } from "zod/v4";

import {
  optionalBooleanSchema,
  serviceDateSchema,
  todayServiceDate,
} from "@/lib/schemas";

export const tripParamsSchema = z.object({
  tripId: z.string().min(1).transform(decodeRepeatedly),
});

export const tripRouteQuerySchema = z.object({
  include_shape: optionalBooleanSchema.transform((value) => value ?? true),
  fallback_route_id: z.string().optional(),
});

export const tripStopTimesQuerySchema = z.object({
  date: serviceDateSchema.default(todayServiceDate()),
  include_realtime: optionalBooleanSchema.transform((value) => value ?? true),
  include_geometry: optionalBooleanSchema.transform((value) => value ?? false),
  fallback_route_id: z.string().optional(),
});

function decodeRepeatedly(value: string) {
  let decoded = value;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}
