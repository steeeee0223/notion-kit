import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schemas";

export function createDatabase(connectionString: string) {
  return drizzle({
    client: new Pool({ connectionString }),
    schema,
    casing: "snake_case",
  });
}
export type DB = ReturnType<typeof createDatabase>;
