import type { MapServerEnv } from "@/env";
import type { WsHub } from "@/services/ws-hub";

declare module "fastify" {
  interface FastifyInstance {
    env: MapServerEnv;
    wsHub: WsHub;
  }
}
