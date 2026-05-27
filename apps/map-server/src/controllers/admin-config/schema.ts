import { z } from "zod/v4";

export const configUserParamsSchema = z.object({
  user: z.string().min(1),
});

export const patchCredentialsBodySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1).nullable(),
});

export const upsertCredentialsBodySchema = z.object({
  credentials: z.record(z.string(), z.string().nullable()),
});
