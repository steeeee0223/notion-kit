import type { FastifyInstance } from "fastify";

import { openApi } from "@/openapi";

export function registerWsRoutes(app: FastifyInstance) {
  app.get("/ws", { websocket: true, schema: openApi.websocket }, (socket) => {
    app.wsHub.add(socket);
  });
}
