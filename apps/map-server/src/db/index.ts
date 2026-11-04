import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";
import { env } from "@/env";

const pool = new Pool({ connectionString: env.MAP_POSTGRES_URL });

export const db = drizzle({
  client: pool,
  schema,
});
