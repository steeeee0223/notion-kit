import type { FastifyPluginAsync } from "fastify";

import { wsManager } from "@/ws/manager";

// We'll cache the latest data here so new clients get it immediately
export let latestVehiclesCache: unknown[] = [];

export function updateLatestVehiclesCache(data: unknown[]) {
  latestVehiclesCache = data;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const wsRoutes: FastifyPluginAsync = async (app) => {
  app.get("/ws", { websocket: true }, (socket, _req) => {
    wsManager.addClient(socket);

    // Send latest cached data immediately upon connection
    if (latestVehiclesCache.length > 0) {
      socket.send(
        JSON.stringify({ type: "transit:vehicles", data: latestVehiclesCache }),
      );
    }
  });
};
