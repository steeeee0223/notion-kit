import { z } from "zod";

export const env = z
  .object({
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  })
  .parse(import.meta.env);
