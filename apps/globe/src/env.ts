import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_MAP_API_BASE_URL: z.url().prefault("http://localhost:3002"),
    VITE_MAP_WS_URL: z.url().optional(),
    VITE_MAP_ADMIN_TOKEN: z.string().min(1),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
