import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import websocket from "@fastify/websocket";
import scalar from "@scalar/fastify-api-reference";
import Fastify from "fastify";

import { registerAdminConfigRoutes } from "@/controllers/admin-config/controller";
import { registerAdminRoutes } from "@/controllers/admin/controller";
import { registerMapRoutes } from "@/controllers/map/controller";
import { registerReplayRoutes } from "@/controllers/replay/controller";
import { registerStopRoutes } from "@/controllers/stops/controller";
import { registerTransportRoutes } from "@/controllers/transport/controller";
import { registerTripRoutes } from "@/controllers/trips/controller";
import { registerWsRoutes } from "@/controllers/ws/controller";
import { env } from "@/env";
import { openApi } from "@/openapi";
import { WsHub } from "@/services/ws-hub";

const app = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      keywords: ["example"],
    },
  },
});
const wsHub = new WsHub(env, app.log);

app.decorate("env", env);
app.decorate("wsHub", wsHub);

await app.register(cors, { origin: true });
await app.register(swagger, {
  openapi: {
    info: {
      title: "Transit Map Backend",
      version: "2.0.0",
      description:
        "Backend APIs for static GTFS, realtime GTFS-RT snapshots, map viewport data, stop departures, trip details, replay, and WebSocket subscriptions.",
    },
    tags: [
      { name: "System", description: "Service health and diagnostics." },
      { name: "Map", description: "Viewport-friendly map APIs." },
      { name: "Stops", description: "Stop detail and departure APIs." },
      { name: "Trips", description: "Trip, route, shape, and stop-time APIs." },
      { name: "Replay", description: "Historical vehicle replay APIs." },
      {
        name: "Admin / Sync",
        description: "Static sync, realtime polling, and retention jobs.",
      },
      {
        name: "Transport",
        description: "Provider-scoped normalized transportation APIs.",
      },
      {
        name: "Admin / Config",
        description: "Shared provider credential configuration.",
      },
      { name: "WebSocket", description: "Live push protocol documentation." },
    ],
    components: {
      securitySchemes: {
        adminBearer: {
          type: "http",
          scheme: "bearer",
          description:
            "Required only when MAP_ADMIN_TOKEN is configured on the server.",
        },
      },
    },
  },
});

await app.register(websocket);

app.get("/api/health", { schema: openApi.health }, () => ({
  ok: true,
  service: "@notion-kit/map-server",
}));

await app.register(registerMapRoutes);
await app.register(registerTransportRoutes);
await app.register(registerStopRoutes);
await app.register(registerTripRoutes);
await app.register(registerReplayRoutes);
await app.register(registerAdminConfigRoutes);
await app.register(registerAdminRoutes);
await app.register(registerWsRoutes);

await app.register(scalar, {
  routePrefix: "/reference",
  configuration: {
    metaData: {
      title: "Map API Reference",
    },
  },
});

await app.listen({ host: "0.0.0.0", port: env.PORT });
