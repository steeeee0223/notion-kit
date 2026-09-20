import { afterEach, describe, expect, it } from "vitest";

import { createAuth } from "@notion-kit/auth";

import { createServer } from "./server";

const servers: ReturnType<typeof createServer>[] = [];
const trustedOrigins = [
  "https://notes.example.com",
  "https://tasks.example.org",
];

function serverWith(
  handler: (request: Request) => Response | Promise<Response>,
) {
  const server = createServer({
    handler,
    baseURL: "https://auth.example.com",
    trustedOrigins,
  });
  servers.push(server);
  return server;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
});

describe("AuthHttpBoundary", () => {
  it("overwrites spoofed client IP headers with the socket address", async () => {
    const server = serverWith((request) =>
      Response.json({ ip: request.headers.get("x-auth-client-ip") }),
    );
    const response = await server.inject({
      url: "/api/auth/ok",
      remoteAddress: "198.51.100.7",
      headers: {
        "x-auth-client-ip": "203.0.113.8",
        "x-forwarded-for": "203.0.113.9",
      },
    });
    expect(response.json()).toEqual({ ip: "198.51.100.7" });
  });
  it("accepts an image payload within the plugin's 5 MiB decoded limit", async () => {
    const server = serverWith(() => Response.json({ ok: true }));
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/file-upload/upload",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        imageBase64: Buffer.alloc(2 * 1024 * 1024).toString("base64"),
      }),
    });
    expect(response.statusCode).toBe(200);
  });

  it("serves the official Better Auth health endpoint", async () => {
    const auth = createAuth({
      POSTGRES_URL: "postgresql://test:test@localhost:5432/test",
      BETTER_AUTH_URL: "https://auth.example.com",
      BETTER_AUTH_SECRET: "test-secret-with-at-least-32-characters",
      BETTER_AUTH_API_KEY: "test-email-key",
      TRUSTED_ORIGINS: trustedOrigins,
      GOOGLE_CLIENT_ID: "test",
      GOOGLE_CLIENT_SECRET: "test",
      GITHUB_CLIENT_ID: "test",
      GITHUB_CLIENT_SECRET: "test",
      NODE_ENV: "test",
    });
    const response = await serverWith(auth.handler).inject({
      url: "/api/auth/ok",
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it.each(trustedOrigins)(
    "allows credentialed preflight from %s",
    async (origin) => {
      const server = serverWith(() => new Response(null, { status: 500 }));
      const response = await server.inject({
        method: "OPTIONS",
        url: "/api/auth/sign-in/email",
        headers: {
          origin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      });
      expect(response.statusCode).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    },
  );

  it.each([
    "https://evil.example.com",
    "https://notes.example.com.evil.org",
    "null",
  ])("rejects requests from unconfigured origin %s", async (origin) => {
    const server = serverWith(() => new Response("must not run"));
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/sign-out",
      headers: { origin },
    });
    expect(response.statusCode).toBe(403);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it.each([
    ["application/json", '{ "email" : "person@example.com", "n": 1.00 }\n'],
    [
      "application/x-www-form-urlencoded",
      "email=person%40example.com&name=A+B",
    ],
    [
      "application/json",
      '{\n "id": "evt_test", "data": {"object": "測試"}\n}\n',
    ],
  ])("preserves the exact %s request bytes", async (contentType, payload) => {
    const server = serverWith(
      async (request) =>
        new Response(await request.arrayBuffer(), {
          headers: { "content-type": "application/octet-stream" },
        }),
    );
    const response = await server.inject({
      method: "POST",
      url: "/api/auth/stripe/webhook",
      headers: { "content-type": contentType },
      payload: Buffer.from(payload),
    });
    expect(response.statusCode).toBe(200);
    expect(response.rawPayload).toEqual(Buffer.from(payload));
  });

  it("uses the configured public URL instead of untrusted host and proxy headers", async () => {
    const server = serverWith((request) => new Response(request.url));
    const response = await server.inject({
      url: "/api/auth/get-session?test=1",
      headers: {
        host: "evil.example.org",
        "x-forwarded-host": "evil.example.org",
        "x-forwarded-proto": "http",
      },
    });
    expect(response.body).toBe(
      "https://auth.example.com/api/auth/get-session?test=1",
    );
  });

  it("preserves redirects and separate cookies including expiry commas", async () => {
    const server = serverWith(() => {
      const headers = new Headers({
        location: "https://notes.example.com/home",
      });
      headers.append("set-cookie", "session=abc; Path=/; HttpOnly; Secure");
      headers.append(
        "set-cookie",
        "state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      );
      return new Response(null, { status: 302, headers });
    });
    const response = await server.inject({ url: "/api/auth/callback/google" });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("https://notes.example.com/home");
    expect(response.headers["set-cookie"]).toEqual([
      "session=abc; Path=/; HttpOnly; Secure",
      "state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ]);
  });

  it("preserves auth errors and CORS headers", async () => {
    const server = serverWith(() =>
      Response.json({ code: "INVALID_PASSWORD" }, { status: 401 }),
    );
    const response = await server.inject({
      url: "/api/auth/get-session",
      headers: { origin: "https://tasks.example.org" },
    });
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "INVALID_PASSWORD" });
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://tasks.example.org",
    );
  });
});
