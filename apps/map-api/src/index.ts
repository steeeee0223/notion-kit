import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import fastify from "fastify";

import { env } from "@/env";
import { bkkProviderPlugin } from "@/providers/bkk/index.js";
import { wsRoutes } from "@/ws/routes.js";

const app = fastify({ logger: true });

async function main() {
  await app.register(cors, { origin: true });
  await app.register(fastifyWebsocket);

  await app.register(wsRoutes);
  await app.register(bkkProviderPlugin);

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

await main();
