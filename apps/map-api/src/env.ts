import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    TRANS_FUTAR_OPEN_DATA: z.string().min(1),
    PORT: z.coerce.number().default(3100),
  },
  runtimeEnv: {
    TRANS_FUTAR_OPEN_DATA: process.env.TRANS_FUTAR_OPEN_DATA,
    PORT: process.env.PORT,
  },
  emptyStringAsUndefined: true,
});
