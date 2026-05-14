import Fastify from "fastify";

import { toNodeHandler } from "@notion-kit/auth";

import { auth } from "./lib/auth";

const server = Fastify({ logger: true });
const authHandler = toNodeHandler(auth);

server.get("/api/auth/health", () => ({
  ok: true,
  service: "@notion-kit/auth-server",
}));

server.all("/api/auth/*", async (request, reply) => {
  reply.hijack();
  await authHandler(request.raw, reply.raw);
});

const port = Number(process.env.PORT ?? 3001);

await server.listen({ host: "0.0.0.0", port });
