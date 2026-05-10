import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

const commaSeparatedList = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return [];
    return val
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  });

export function createAuthEnv() {
  return createEnv({
    clientPrefix: "NEXT_PUBLIC_",
    client: {},
    server: {
      POSTGRES_URL: z.string(),
      BETTER_AUTH_URL: z.string(),
      BETTER_AUTH_ALLOWED_HOSTS: commaSeparatedList,
      BETTER_AUTH_SECRET: z.string(),
      TRUSTED_ORIGINS: commaSeparatedList,
      APP_URL: z.string().optional(),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
      GITHUB_CLIENT_ID: z.string(),
      GITHUB_CLIENT_SECRET: z.string(),
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .prefault("development"),
      MAILTRAP_API_KEY: z.string(),
      MAILTRAP_INBOX_ID: z.string().optional(),
      STRIPE_SECRET_KEY: z.string().optional(),
      STRIPE_WEBHOOK_SECRET: z.string().optional(),
      SUPABASE_URL: z.string().optional(),
      SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
    },
    runtimeEnv: {
      POSTGRES_URL: process.env.POSTGRES_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      BETTER_AUTH_ALLOWED_HOSTS: process.env.BETTER_AUTH_ALLOWED_HOSTS,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
      APP_URL: process.env.APP_URL ?? process.env.VIEWER_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      MAILTRAP_API_KEY: process.env.MAILTRAP_API_KEY,
      MAILTRAP_INBOX_ID: process.env.MAILTRAP_INBOX_ID,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export type AuthEnv = ReturnType<typeof createAuthEnv>;
