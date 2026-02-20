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
  /**
   * In Vite, env vars from `.env` files are only available via `import.meta.env`,
   * NOT `process.env`. We must use `import.meta.env` here for the values to resolve.
   */
  runtimeEnv: {
    NODE_ENV: import.meta.env.MODE,
    STORYBOOK_STRIPE_PUBLISHABLE_KEY: import.meta.env
      .STORYBOOK_STRIPE_PUBLISHABLE_KEY,
  },
  skipValidation: !!import.meta.env.CI || import.meta.env.MODE === "test",
});
