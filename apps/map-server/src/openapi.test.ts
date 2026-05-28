import swagger from "@fastify/swagger";
import Fastify from "fastify";
import { beforeAll, describe, expect, it, vi } from "vitest";

import * as openApiModule from "./openapi";

vi.mock("@/db", () => ({ db: {} }));

const providerPaths = [
  "/api/transport/transit/routes",
  "/api/transport/simulator/routes",
  "/api/admin/transport/transit/sync/static",
  "/api/admin/transport/simulator/sync/static",
];

const genericProviderPaths = [
  "/api/transport/{provider}/static-feeds/status",
  "/api/transport/{provider}/routes",
  "/api/transport/{provider}/stops",
  "/api/transport/{provider}/trips",
  "/api/transport/{provider}/route-shape",
  "/api/transport/{provider}/stops/{stopId}/departures",
  "/api/transport/{provider}/vehicles",
  "/api/admin/transport/{provider}/validate",
  "/api/admin/transport/{provider}/sync/static",
  "/api/admin/transport/{provider}/sync/realtime",
];

describe("OpenAPI transport provider cleanup", () => {
  beforeAll(() => {
    vi.stubEnv("MAP_POSTGRES_URL", "postgres://example.test/db");
  });

  it("publishes provider-specific tags without legacy route groups", () => {
    const { openApiTags } = openApiModule as {
      openApiTags?: { name: string }[];
    };

    expect(openApiTags?.map((tag) => tag.name)).toEqual([
      "System",
      "Transport / Transitland",
      "Transport / Simulator",
      "Replay",
      "Admin / Sync / Transitland",
      "Admin / Sync / Simulator",
      "Admin / Config",
      "WebSocket",
    ]);
  });

  it("documents concrete provider paths and hides generic compatibility routes", async () => {
    const spec = await buildOpenApiSpec();
    const paths = Object.keys(spec.paths ?? {});

    expect(paths).toEqual(expect.arrayContaining(providerPaths));
    expect(paths).not.toEqual(expect.arrayContaining(genericProviderPaths));
  });

  it("groups admin config credential writes under Admin / Config", async () => {
    const spec = await buildOpenApiSpec();
    const credentialPath =
      spec.paths?.["/api/admin/config/{adminToken}/credentials"];

    expect(credentialPath?.put?.tags).toEqual(["Admin / Config"]);
    expect(credentialPath?.patch?.tags).toEqual(["Admin / Config"]);
  });
});

async function buildOpenApiSpec() {
  const { registerTransportRoutes } = await import(
    "@/controllers/transport/controller"
  );
  const { registerAdminConfigRoutes } = await import(
    "@/controllers/admin-config/controller"
  );
  const { registerAdminRoutes } = await import(
    "@/controllers/admin/controller"
  );
  const { openApiTags } = openApiModule as {
    openApiTags?: { name: string; description?: string }[];
  };
  const app = Fastify({
    ajv: {
      customOptions: {
        keywords: ["example"],
      },
    },
  });

  app.decorate("env", {
    MAP_ADMIN_TOKEN: "local.secret",
    MAP_REPLAY_FRAME_SECONDS: 30,
    MAP_RT_POLL_TIMEOUT_MS: 10_000,
    NODE_ENV: "test",
    PORT: 3002,
    MAP_POSTGRES_URL: "postgres://example.test/db",
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Transit Map Backend",
        version: "2.0.0",
      },
      tags: openApiTags ?? [],
      components: {
        securitySchemes: {
          adminBearer: {
            type: "http",
            scheme: "bearer",
          },
        },
      },
    },
  });

  await app.register(registerTransportRoutes);
  await app.register(registerAdminConfigRoutes);
  await app.register(registerAdminRoutes);
  await app.ready();

  const spec = app.swagger();
  await app.close();
  return spec;
}
