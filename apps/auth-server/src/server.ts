import cors from "@fastify/cors";
import Fastify from "fastify";

interface ServerOptions {
  handler: (request: Request) => Response | Promise<Response>;
  baseURL: string;
  trustedOrigins: string[];
  trustedProxies?: string[];
}

export function createServer({
  handler,
  baseURL,
  trustedOrigins,
  trustedProxies,
}: ServerOptions) {
  const server = Fastify({
    trustProxy: trustedProxies ?? false,
    bodyLimit: 7 * 1024 * 1024,
  });

  server.addHook("onRequest", async (request, reply) => {
    const origin = request.headers.origin;
    if (origin !== undefined && !trustedOrigins.includes(origin)) {
      return reply.status(403).send({ code: "UNTRUSTED_ORIGIN" });
    }
  });
  void server.register(cors, {
    origin: trustedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Keep the signed webhook payload intact; Better Auth parses its own body.
  server.removeAllContentTypeParsers();
  server.addContentTypeParser(
    "*",
    { parseAs: "buffer" },
    (_request, body, done) => {
      done(null, body);
    },
  );

  server.all<{ Body: Buffer | undefined }>(
    "/api/auth/*",
    async (request, reply) => {
      const headers = new Headers();
      for (const [name, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) {
          for (const entry of value) headers.append(name, entry);
        } else if (value !== undefined) {
          headers.set(name, value);
        }
      }
      headers.set("x-auth-client-ip", request.ip);
      const response = await handler(
        new Request(new URL(request.url, baseURL), {
          method: request.method,
          headers,
          body:
            request.method === "GET" || request.method === "HEAD"
              ? undefined
              : request.body,
        }),
      );
      reply.status(response.status);
      response.headers.forEach((value, name) => {
        if (name !== "set-cookie") reply.header(name, value);
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header("set-cookie", cookies);
      return reply.send(Buffer.from(await response.arrayBuffer()));
    },
  );
  return server;
}
