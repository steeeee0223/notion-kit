import { z } from "zod/v4";

export const configAdminTokenParamsSchema = z.object({
  adminToken: z.string().min(1),
});

export const patchCredentialsBodySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1).nullable(),
});

export const upsertCredentialsBodySchema = z.object({
  credentials: z.record(z.string(), z.string().nullable()),
});
