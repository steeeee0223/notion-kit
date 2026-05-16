import { z } from "zod/v4";

import { bboxSchema } from "@/lib/schemas";

export const staticSyncBodySchema = z
  .object({
    bbox: bboxSchema.optional(),
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
    feedIds: z.array(z.string().min(1)).optional(),
    feed_ids: z.array(z.string().min(1)).optional(),
  })
  .transform((body) => ({
    feedIds: body.feedIds ?? body.feed_ids,
  }));
