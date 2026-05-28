import { z } from "zod/v4";

import { bboxSchema } from "@/lib/schemas";

const bboxBodySchema = z.union([
  bboxSchema,
  z
    .tuple([z.number(), z.number(), z.number(), z.number()])
    .refine(
      ([minLon, minLat, maxLon, maxLat]) => minLon < maxLon && minLat < maxLat,
      {
        message: "bbox minimums must be less than maximums",
      },
    ),
]);

export const staticSyncBodySchema = z
  .object({
    bbox: bboxBodySchema.optional(),
    feedIds: z.array(z.string().min(1)).optional(),
    feed_ids: z.array(z.string().min(1)).optional(),
    force: z.boolean().default(false),
  })
  .transform((body) => ({
    bbox: body.bbox,
    feedIds: body.feedIds ?? body.feed_ids,
    force: body.force,
  }))
  .refine((body) => Boolean(body.bbox ?? body.feedIds?.length), {
    message: "Provide bbox or feedIds",
  });

export const realtimeSyncBodySchema = z
  .object({
    bbox: bboxBodySchema.optional(),
    feedIds: z.array(z.string().min(1)).optional(),
    feed_ids: z.array(z.string().min(1)).optional(),
  })
  .transform((body) => ({
    bbox: body.bbox,
    feedIds: body.feedIds ?? body.feed_ids,
  }));
