import { z } from "zod/v4";

import {
  currentGtfsTime,
  gtfsTimeSchema,
  optionalBooleanSchema,
  positiveIntegerQuerySchema,
  scopedIdSchema,
  secondsToGtfsTime,
  serviceDateSchema,
  todayServiceDate,
} from "@/lib/schemas";

export const stopParamsSchema = z.object({
  stopId: scopedIdSchema,
});

export const departuresQuerySchema = z
  .object({
    date: serviceDateSchema.default(todayServiceDate()),
    start_time: gtfsTimeSchema.default(currentGtfsTime()),
    end_time: gtfsTimeSchema.optional(),
    next: z.coerce.number().int().positive().optional(),
    include_realtime: optionalBooleanSchema.transform((value) => value ?? true),
    include_alerts: optionalBooleanSchema.transform((value) => value ?? true),
    limit: positiveIntegerQuerySchema.max(200).default(30),
  })
  .transform((query) => ({
    ...query,
    end_time:
      query.end_time ??
      secondsToGtfsTime(
        timeToSeconds(query.start_time) + (query.next ?? 60 * 60),
      ),
  }));

function timeToSeconds(value: string) {
  const [hours, minutes, seconds] = value
    .split(":")
    .map((part) => Number(part));
  return (hours ?? 0) * 3600 + (minutes ?? 0) * 60 + (seconds ?? 0);
}
