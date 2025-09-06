import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export function createAuthEnv() {
  return createEnv({
    server: {
      POSTGRES_URL: z.string(),
      BETTER_AUTH_URL: z.string(),
      BETTER_AUTH_SECRET: z.string(),
      TRUSTED_ORIGIN: z
        .string()
        .optional()
        .transform((val) => {
          if (!val) return [];
          return val.split(",").map((url) => url.trim());
        }),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
      GITHUB_CLIENT_ID: z.string(),
      GITHUB_CLIENT_SECRET: z.string(),
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .prefault("development"),
      MAILTRAP_API_KEY: z.string(),
      MAILTRAP_INBOX_ID: z.string().optional(),
    },
    experimental__runtimeEnv: {},
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export type AuthEnv = ReturnType<typeof createAuthEnv>;
