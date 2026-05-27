import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  clientPrefix: "PUBLIC_",
  client: {},
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .prefault("development"),
    PORT: z.coerce.number().int().positive().prefault(3002),
    TRANS_TRANSITLAND: z.string().optional(),
    MAP_POSTGRES_URL: z.string().min(1),
    MAP_ADMIN_TOKEN: z.union([z.string().min(1), z.undefined()]),
    MAP_RT_POLL_TIMEOUT_MS: z.coerce.number().int().positive().prefault(10000),
    MAP_REPLAY_FRAME_SECONDS: z.coerce.number().int().positive().prefault(30),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    TRANS_TRANSITLAND: process.env.TRANS_TRANSITLAND,
    MAP_POSTGRES_URL: process.env.MAP_POSTGRES_URL,
    MAP_ADMIN_TOKEN: process.env.MAP_ADMIN_TOKEN,
    MAP_RT_POLL_TIMEOUT_MS: "10000",
    MAP_REPLAY_FRAME_SECONDS: "30",
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  emptyStringAsUndefined: true,
});

export type MapServerEnv = typeof env;
