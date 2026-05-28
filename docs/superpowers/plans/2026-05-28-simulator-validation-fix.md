# Simulator Provider Parameter Validation Fix & E2E Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the Fastify validation 500 error on concrete transport provider endpoints (`routes`, `stops`, `vehicles`, and `validate`) and establish integration test coverage.

**Architecture:** Destructure the `params` property out of the endpoint schemas in `openapi.ts`. If the `params` object becomes empty after stripping `provider`, omit it entirely from the generated Fastify endpoint schema. Add integration tests using Fastify's native light-weight request `inject()` utility to verify routes return 200 OK.

**Tech Stack:** TypeScript, Fastify, Zod, Vitest.

---

### Task 1: Fix Schema Helpers in openapi.ts

**Files:**
- Modify: `apps/map-server/src/openapi.ts:1206-1275`

- [ ] **Step 1: Update withProviderTag helper to drop empty params**
Update `withProviderTag` to destructure `params` off the schema and only include a stripped params object if it has other path parameters.
```typescript
function withProviderTag<
  T extends {
    readonly params?: {
      readonly properties?: Record<string, unknown>;
      readonly required?: readonly string[];
    };
    readonly summary?: string;
    readonly tags?: readonly string[];
  },
>(provider: string, schema: T) {
  const { params: originalParams, ...rest } = schema;
  let params = undefined;
  if (originalParams) {
    const { provider: _, ...remainingProperties } =
      originalParams.properties ?? {};
    const remainingRequired = (originalParams.required ?? []).filter(
      (r: string) => r !== "provider",
    );
    if (Object.keys(remainingProperties).length > 0) {
      params = {
        ...originalParams,
        required: remainingRequired,
        properties: remainingProperties,
      };
    }
  }
  return {
    ...rest,
    ...(params ? { params } : {}),
    tags: [
      `Transport / ${provider === "transit" ? "Transitland" : "Simulator"}`,
    ],
    summary: `${schema.summary} (${provider === "transit" ? "Transitland" : "Simulator"})`,
  };
}
```

- [ ] **Step 2: Update withAdminProviderTag helper to drop empty params**
Apply the identical destructuring logic to `withAdminProviderTag`.
```typescript
function withAdminProviderTag<
  T extends {
    readonly params?: {
      readonly properties?: Record<string, unknown>;
      readonly required?: readonly string[];
    };
    readonly summary?: string;
    readonly tags?: readonly string[];
  },
>(provider: string, schema: T) {
  const { params: originalParams, ...rest } = schema;
  let params = undefined;
  if (originalParams) {
    const { provider: _, ...remainingProperties } =
      originalParams.properties ?? {};
    const remainingRequired = (originalParams.required ?? []).filter(
      (r: string) => r !== "provider",
    );
    if (Object.keys(remainingProperties).length > 0) {
      params = {
        ...originalParams,
        required: remainingRequired,
        properties: remainingProperties,
      };
    }
  }
  return {
    ...rest,
    ...(params ? { params } : {}),
    tags: [
      `Admin / Sync / ${provider === "transit" ? "Transitland" : "Simulator"}`,
    ],
    summary: `${schema.summary} (${provider === "transit" ? "Transitland" : "Simulator"})`,
  };
}
```

- [ ] **Step 3: Commit the schema changes**
```bash
git add apps/map-server/src/openapi.ts
git commit -m "feat: drop empty path params in provider schema helpers"
```

---

### Task 2: Create Integration/E2E Test Suite

**Files:**
- Create: `apps/map-server/src/routes.test.ts`

- [ ] **Step 1: Write integration tests for the four affected endpoints using Fastify inject**
Create `apps/map-server/src/routes.test.ts` to mock the database and run HTTP assertions using Fastify `app.inject()`.
```typescript
import swagger from "@fastify/swagger";
import Fastify from "fastify";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Simulator Route Integration Tests", () => {
  let app: any;

  beforeAll(async () => {
    vi.stubEnv("MAP_POSTGRES_URL", "postgres://example.test/db");
    const { registerTransportRoutes } = await import(
      "@/controllers/transport/controller"
    );
    const { registerAdminRoutes } = await import(
      "@/controllers/admin/controller"
    );

    app = Fastify();
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
    const data = response.json();
    expect(data.stops).toBeDefined();
    expect(data.stops.length).toBe(3);
    expect(data.stops[0].stop_name).toBe("Central Station");
  });

  it("GET /api/transport/simulator/routes returns 200 and routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/transport/simulator/routes?feed_onestop_id=sim-feed&limit=500",
    });
    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.routes).toBeDefined();
    expect(data.routes.length).toBe(1);
    expect(data.routes[0].route_long_name).toBe("Blue Line");
  });

  it("GET /api/transport/simulator/vehicles returns 200 and vehicles", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/transport/simulator/vehicles?feed_onestop_id=sim-feed",
    });
    expect(response.statusCode).toBe(200);
    const data = response.json();
    expect(data.vehicles).toBeDefined();
    expect(data.vehicles.length).toBe(1);
    expect(data.vehicles[0].vehicle_label).toBe("Simulator 1");
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
    const data = response.json();
    expect(data.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test suite and verify they pass**
Run: `pnpm --filter @notion-kit/map-server test`
Expected: All tests pass, including the new integration tests.

- [ ] **Step 3: Commit the test suite**
```bash
git add apps/map-server/src/routes.test.ts
git commit -m "test: add E2E integration tests for simulator routes"
```

---

### Task 3: Quality Assurance & Type Check

- [ ] **Step 1: Run full typecheck and linter**
Run: `pnpm --filter @notion-kit/map-server typecheck`
Run: `pnpm --filter @notion-kit/map-server lint`
Run: `pnpm --filter @notion-kit/map-server format`
Expected: Clean output without errors.

- [ ] **Step 2: Commit any minor cleanup**
If any formatting or cleanups are needed, stage and commit them.
