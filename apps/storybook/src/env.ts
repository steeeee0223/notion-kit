import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "STORYBOOK_",
  extends: [],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {
    // STRIPE
    STORYBOOK_STRIPE_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    STORYBOOK_STRIPE_PUBLISHABLE_KEY:
      process.env.STORYBOOK_STRIPE_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.CI || process.env.NODE_ENV === "test",
});
