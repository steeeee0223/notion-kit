import swagger from "@fastify/swagger";
import Fastify, { type FastifyInstance } from "fastify";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => {
  const mockQuery = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  };
  return {
    db: {
      select: vi.fn().mockReturnValue(mockQuery),
    },
  };
});

interface StopsResponse {
  stops: { stop_name: string }[];
}

interface RoutesResponse {
  routes: { route_long_name: string }[];
}

interface VehiclesResponse {
  vehicles: { vehicle_label: string }[];
}

interface ValidateResponse {
  ok: boolean;
}

describe("Simulator Route Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    vi.stubEnv("MAP_POSTGRES_URL", "postgres://example.test/db");
    const { registerTransportRoutes } = await import(
      "@/controllers/transport/controller"
    );
    const { registerAdminRoutes } = await import(
      "@/controllers/admin/controller"
    );

    app = Fastify({
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
        info: { title: "Transit Map Backend", version: "2.0.0" },
      },
    });

    await app.register(registerTransportRoutes);
    await app.register(registerAdminRoutes);
    await app.ready();
  });

  it("GET /api/transport/simulator/stops returns 200 and stops", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/transport/simulator/stops?feed_onestop_id=sim-feed&limit=500",
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<StopsResponse>();
    expect(data.stops).toBeDefined();
    expect(data.stops.length).toBe(3);
    expect(data.stops[0]?.stop_name).toBe("Central Station");
  });

  it("GET /api/transport/simulator/routes returns 200 and routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/transport/simulator/routes?feed_onestop_id=sim-feed&limit=500",
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<RoutesResponse>();
    expect(data.routes).toBeDefined();
    expect(data.routes.length).toBe(1);
    expect(data.routes[0]?.route_long_name).toBe("Blue Line");
  });

  it("GET /api/transport/simulator/vehicles returns 200 and vehicles", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/transport/simulator/vehicles?feed_onestop_id=sim-feed",
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<VehiclesResponse>();
    expect(data.vehicles).toBeDefined();
    expect(data.vehicles.length).toBe(1);
    expect(data.vehicles[0]?.vehicle_label).toBe("Simulator 1");
  });

  it("POST /api/admin/transport/simulator/validate returns 200 with Authorization", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/transport/simulator/validate",
      headers: {
        authorization: "Bearer local.secret",
      },
    });
    expect(response.statusCode).toBe(200);
    const data = response.json<ValidateResponse>();
    expect(data.ok).toBe(true);
  });
});
