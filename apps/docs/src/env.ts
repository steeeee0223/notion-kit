import { z } from "zod";

export const env = z
  .object({
    VITE_STRIPE_PUBLISHABLE_KEY: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.string().startsWith("pk_").optional(),
    ),
  })
  .parse(import.meta.env);
