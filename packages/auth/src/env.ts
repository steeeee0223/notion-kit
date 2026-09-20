import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const stringListSchema = z
  .union([z.string(), z.array(z.string()), z.undefined()])
  .transform((val) => {
    if (Array.isArray(val)) {
      return val.map((item) => item.trim()).filter(Boolean);
    }
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
      BETTER_AUTH_URL: z.url(),
      BETTER_AUTH_SECRET: z.string().min(32),
      TRUSTED_ORIGINS: stringListSchema.pipe(
        z.array(z.url().transform((url) => new URL(url).origin)),
      ),
      TRUSTED_PROXY_IPS: stringListSchema.optional(),
      PASSKEY_RP_ID: z.hostname().optional(),
      APP_URL: z.url().optional(),
      GOOGLE_CLIENT_ID: z.string(),
      GOOGLE_CLIENT_SECRET: z.string(),
      GITHUB_CLIENT_ID: z.string(),
      GITHUB_CLIENT_SECRET: z.string(),
      NODE_ENV: z
        .enum(["development", "production", "test"])
        .prefault("development"),
      BETTER_AUTH_API_KEY: z.string().min(1),
      BETTER_AUTH_API_URL: z.url().optional(),
      STRIPE_PLANS: z
        .string()
        .transform((value, ctx) => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            ctx.addIssue({
              code: "custom",
              message: "STRIPE_PLANS must be JSON",
            });
            return z.NEVER;
          }
        })
        .pipe(
          z.array(
            z.object({
              name: z.enum(["education", "plus", "business", "enterprise"]),
              priceId: z.string().startsWith("price_"),
              annualDiscountPriceId: z.string().startsWith("price_").optional(),
            }),
          ),
        )
        .optional(),
      STRIPE_SECRET_KEY: z.string().optional(),
      STRIPE_WEBHOOK_SECRET: z.string().optional(),
      SUPABASE_URL: z.string().optional(),
      SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
    },
    runtimeEnv: {
      POSTGRES_URL: process.env.POSTGRES_URL,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
      PASSKEY_RP_ID: process.env.PASSKEY_RP_ID,
      TRUSTED_PROXY_IPS: process.env.TRUSTED_PROXY_IPS,
      APP_URL: process.env.APP_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      BETTER_AUTH_API_KEY: process.env.BETTER_AUTH_API_KEY,
      BETTER_AUTH_API_URL: process.env.BETTER_AUTH_API_URL,
      STRIPE_PLANS: process.env.STRIPE_PLANS,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    },
  });
}

export type AuthEnv = ReturnType<typeof createAuthEnv>;
