import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export function createAuthEnv() {
  return createEnv({
    server: {
      POSTGRES_URL: z.string(),
      BETTER_AUTH_URL: z.string(),
      BETTER_AUTH_SECRET: z.string(),
      TRUSTED_ORIGIN: z.string().optional(),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
      GITHUB_CLIENT_ID: z.string(),
      GITHUB_CLIENT_SECRET: z.string(),
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    },
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export type AuthEnv = ReturnType<typeof createAuthEnv>;
