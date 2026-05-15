import type { FastifyPluginAsync } from "fastify";

import type { VehiclesForLocationMethodResponse } from "@/providers/bkk/api";
import { fetchBKK } from "@/providers/bkk/client";
import { transferVehiclesForLocation } from "@/providers/bkk/data-transfer";
import { wsManager } from "@/ws/manager";
import { updateLatestVehiclesCache } from "@/ws/routes";

const POLLING_INTERVAL_MS = 10000; // 10 seconds

// eslint-disable-next-line @typescript-eslint/require-await
export const bkkVehiclesPlugin: FastifyPluginAsync = async (app) => {
  let timer: NodeJS.Timeout | null = null;

  const pollVehicles = async () => {
    if (wsManager.connectedCount === 0) {
      // Skip polling if no one is listening
      return;
    }

    try {
      const params: Record<string, string | number | boolean> = {
        lat: 47.4973,
        lon: 19.0408,
        radius: 15000,
        includeReferences: true,
      };

      const json = await fetchBKK<VehiclesForLocationMethodResponse>(
        "/vehicles-for-location",
        params,
      );

      if (!json) {
        // No changes since last modified (304) or error
        return;
      }

      const normalized = transferVehiclesForLocation(json.data);

      // Update cache
      updateLatestVehiclesCache(normalized);

      // Broadcast
      wsManager.broadcast({ type: "transit:vehicles", data: normalized });
    } catch (err) {
      app.log.error(err, "Failed to poll BKK vehicles");
    }
  };

  app.addHook("onReady", () => {
    // Start polling loop
    timer = setInterval(() => {
      void pollVehicles();
    }, POLLING_INTERVAL_MS);
    // Initial fetch
    void pollVehicles();
  });

  app.addHook("onClose", () => {
    if (timer) {
      clearInterval(timer);
    }
  });
};
