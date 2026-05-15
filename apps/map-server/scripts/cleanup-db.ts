import { sql } from "drizzle-orm";

import { db } from "@/db";

async function main() {
  console.log("Cleaning up database tables...");

  try {
    await db.execute(sql`
      TRUNCATE TABLE 
        stops, 
        routes, 
        trips, 
        shapes, 
        stop_times, 
        calendar, 
        calendar_dates, 
        vehicle_position_snapshots, 
        trip_update_snapshots, 
        alert_snapshots, 
        cache,
        feeds
      CASCADE;
    `);
    console.log("Database cleanup successful.");
    process.exit(0);
  } catch (err) {
    console.error("Database cleanup failed:", err);
    process.exit(1);
  }
}

await main();
