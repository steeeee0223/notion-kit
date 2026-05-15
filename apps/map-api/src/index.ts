import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import fastifyWebsocket from "@fastify/websocket";
import scalar from "@scalar/fastify-api-reference";
import fastify from "fastify";

import { env } from "@/env";
import { bkkProviderPlugin } from "@/providers/bkk/index.js";
import { wsRoutes } from "@/ws/routes.js";

const app = fastify({ logger: true });

async function main() {
  await app.register(cors, { origin: true });
  await app.register(fastifyWebsocket);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Notion Kit Map API",
        description: "Real-time transit API",
        version: "1.0.0",
      },
    },
  });

  await app.register(wsRoutes);
  await app.register(bkkProviderPlugin);

  await app.register(scalar, {
    routePrefix: "/reference",
    configuration: {
      theme: "purple",
      metaData: {
        title: "Map API Reference",
      },
    },
  });

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

await main();
