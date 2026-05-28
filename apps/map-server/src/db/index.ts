import { createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import * as schema from "@/db/schema";
import { env } from "@/env";

const pool = createPool({ connectionString: env.MAP_POSTGRES_URL });

export const db = drizzle({
  client: pool,
  schema,
});
