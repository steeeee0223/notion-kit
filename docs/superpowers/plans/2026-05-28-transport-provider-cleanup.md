# Transport Provider Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the map-server migration to provider-scoped transport APIs with exact admin-token config lookup, provider-specific OpenAPI groups, simulator parity, and `apps/globe` consuming only provider-scoped transport routes.

**Architecture:** Keep the transport adapter registry as the single dispatch boundary. Rename config identity to `admin_token`, expose concrete `transit` and `simulator` routes that call shared handler helpers, move trip detail reads into provider adapters, then remove legacy unscoped map/sync/trip routes from registration and OpenAPI.

**Tech Stack:** TypeScript, Fastify, Drizzle ORM, Zod v4, Vitest, React Query, Vite, `@better-fetch/fetch`.

---

## File Structure

- `apps/map-server/drizzle/0001_rename_config_user_to_admin_token.sql`: migrate existing `config.user` data to `config.admin_token`.
- `apps/map-server/src/db/schema.ts`: rename the Drizzle config column.
- `apps/map-server/src/services/config.ts`: exact-token config lookup and credential mutation helpers.
- `apps/map-server/src/services/config.test.ts`: unit coverage for exact token lookup helper and credential redaction.
- `apps/map-server/src/controllers/admin-config/schema.ts`: rename route param schema from user to admin token.
- `apps/map-server/src/controllers/admin-config/controller.ts`: return redacted active config by admin token.
- `apps/map-server/src/services/transport/types.ts`: add trip detail provider methods.
- `apps/map-server/src/services/transport/registry.ts`: map public provider slug `transit` to the Transitland adapter.
- `apps/map-server/src/services/transport/transitland-adapter.ts`: expose provider key `transit`, reuse existing repository-backed trip detail builders, and keep Transitland API key lookup through provider context.
- `apps/map-server/src/services/transport/simulator-adapter.ts`: add deterministic trip route and trip stop-times responses.
- `apps/map-server/src/services/transport/simulator-adapter.test.ts`: adapter coverage for simulator trip detail methods.
- `apps/map-server/src/controllers/transport/schema.ts`: add provider trip params and trip detail query schemas.
- `apps/map-server/src/controllers/transport/controller.ts`: register concrete provider routes and shared handler helpers for transport reads.
- `apps/map-server/src/controllers/admin/controller.ts`: register concrete provider admin routes and remove legacy Transitland-default sync routes.
- `apps/map-server/src/controllers/map/controller.ts`: keep exported builder functions for Transitland adapter reuse, but stop registering `/api/map/...`.
- `apps/map-server/src/controllers/trips/controller.ts`: keep exported builder functions for Transitland adapter reuse, but stop registering `/api/trips/:tripId/...`.
- `apps/map-server/src/index.ts`: stop registering removed legacy route groups if no registered routes remain.
- `apps/map-server/src/openapi.ts`: remove legacy schemas, add provider-specific operation schemas and tags.
- `apps/map-server/docs/data-sources.md` and `apps/map-server/docs/use-cases.md`: update docs to provider-scoped paths.
- `apps/globe/src/lib/transport-provider.ts`: rename frontend provider id from `transitland` to `transit`.
- `apps/globe/src/lib/api-client.ts`: default sync calls to `transit`.
- `apps/globe/src/adapters/index.ts`: map active source state to `transit`.
- `apps/globe/src/adapters/transitland/use-route-shapes.ts`: call provider-scoped trip route endpoint for every provider.
- `apps/globe/src/adapters/transitland/use-route-stops.ts`: call provider-scoped trip stop-times endpoint for every provider.
- `apps/globe/src/components/layer-sidebar.tsx`, `apps/globe/src/plugins/routes/routes-panel.tsx`, and `apps/globe/src/plugins/vehicles/vehicles-panel.tsx`: update labels and provider ids without changing visible behavior.

Before starting implementation, run `git status --short`. The current branch already has uncommitted edits in `apps/map-server/src/env.ts`, `apps/map-server/src/services/transitland/client.ts`, and `turbo.json`; preserve them unless the task explicitly extends the same change.

### Task 1: Rename Config Identity To Admin Token

**Files:**
- Create: `apps/map-server/drizzle/0001_rename_config_user_to_admin_token.sql`
- Modify: `apps/map-server/src/db/schema.ts`
- Modify: `apps/map-server/src/services/config.ts`
- Modify: `apps/map-server/src/services/config.test.ts`
- Modify: `apps/map-server/src/controllers/admin-config/schema.ts`
- Modify: `apps/map-server/src/controllers/admin-config/controller.ts`
- Modify: `apps/map-server/src/openapi.ts`

- [ ] **Step 1: Write failing config service tests**

Replace the prefix parsing tests in `apps/map-server/src/services/config.test.ts` with exact admin-token helper tests:

```ts
import { describe, expect, it } from "vitest";

import {
  getConfigAdminToken,
  redactCredentials,
  validateCredentialKey,
} from "./config";

describe("config service helpers", () => {
  it("uses the full configured admin token as the config row id", () => {
    expect(getConfigAdminToken("local.secret-value")).toBe(
      "local.secret-value",
    );
    expect(getConfigAdminToken("ci.abc.def")).toBe("ci.abc.def");
    expect(getConfigAdminToken("production.token")).toBe("production.token");
  });

  it("falls back to admin only when the server has no admin token", () => {
    expect(getConfigAdminToken(undefined)).toBe("admin");
  });

  it("rejects invalid credential keys", () => {
    expect(() => validateCredentialKey("tdx_api_key")).not.toThrow();
    expect(() => validateCredentialKey("TDX_API_KEY")).toThrow(
      "Credential keys must use lowercase snake_case",
    );
    expect(() => validateCredentialKey("__proto__")).toThrow(
      "Credential key is not allowed",
    );
  });

  it("redacts credential values and reports presence", () => {
    expect(
      redactCredentials({
        transit_api_key: "abc123",
        tdx_api_key: "",
        bkk_api_key: null,
      }),
    ).toEqual({
      transit_api_key: { present: true },
      tdx_api_key: { present: false },
      bkk_api_key: { present: false },
    });
  });
});
```

- [ ] **Step 2: Run the focused failing test**

Run: `pnpm --filter @notion-kit/map-server test src/services/config.test.ts`

Expected: FAIL because `getConfigAdminToken` is not exported yet.

- [ ] **Step 3: Add the database migration**

Create `apps/map-server/drizzle/0001_rename_config_user_to_admin_token.sql`:

```sql
ALTER TABLE "config" RENAME COLUMN "user" TO "admin_token";
```

- [ ] **Step 4: Update the Drizzle schema**

In `apps/map-server/src/db/schema.ts`, replace the config table definition with:

```ts
export const config = pgTable("config", {
  adminToken: text("admin_token").primaryKey(),
  credentials: jsonb("credentials")
    .$type<Record<string, string | null>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 5: Update config service helpers**

Replace `apps/map-server/src/services/config.ts` with:

```ts
import { eq, sql } from "drizzle-orm";

import { config } from "../db/schema";
import { badRequest, notFound } from "../lib/api-error";

export type CredentialMap = Record<string, string | null>;

const INVALID_CREDENTIAL_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
]);
const CREDENTIAL_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export function getConfigAdminToken(token: string | undefined): string {
  return token ?? "admin";
}

export function validateCredentialKey(key: string): void {
  if (INVALID_CREDENTIAL_KEYS.has(key)) {
    throw badRequest("Credential key is not allowed", { key });
  }
  if (!CREDENTIAL_KEY_PATTERN.test(key)) {
    throw badRequest("Credential keys must use lowercase snake_case", { key });
  }
}

export function redactCredentials(
  credentials: CredentialMap,
): Record<string, { present: boolean }> {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      { present: typeof value === "string" && value.length > 0 },
    ]),
  );
}

export async function getConfigForAdminToken(adminToken: string) {
  const { db } = await import("../db");
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.adminToken, adminToken))
    .limit(1);
  if (!row) throw notFound("Config admin token not found");
  return row;
}

export async function getActiveConfig(adminToken: string | undefined) {
  return getConfigForAdminToken(getConfigAdminToken(adminToken));
}

export async function upsertCredentials(
  adminToken: string,
  credentials: CredentialMap,
) {
  for (const key of Object.keys(credentials)) validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .insert(config)
    .values({ adminToken, credentials, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: config.adminToken,
      set: {
        credentials: sql`excluded.credentials`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();

  return row;
}

export async function patchCredential(
  adminToken: string,
  key: string,
  value: string | null,
) {
  validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .insert(config)
    .values({
      adminToken,
      credentials: { [key]: value },
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: config.adminToken,
      set: {
        credentials: sql`${config.credentials} || excluded.credentials`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();

  return row;
}

export async function removeCredential(adminToken: string, key: string) {
  validateCredentialKey(key);

  const { db } = await import("../db");
  const [row] = await db
    .update(config)
    .set({
      credentials: sql`${config.credentials} - ${key}`,
      updatedAt: new Date(),
    })
    .where(eq(config.adminToken, adminToken))
    .returning();

  if (!row) throw notFound("Config admin token not found");

  return row;
}
```

- [ ] **Step 6: Update admin config params and controller response names**

Replace `apps/map-server/src/controllers/admin-config/schema.ts` with:

```ts
import { z } from "zod/v4";

export const configAdminTokenParamsSchema = z.object({
  adminToken: z.string().min(1),
});

export const patchCredentialsBodySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1).nullable(),
});

export const upsertCredentialsBodySchema = z.object({
  credentials: z.record(z.string(), z.string().nullable()),
});
```

In `apps/map-server/src/controllers/admin-config/controller.ts`, update imports and route bodies to use `adminToken`:

```ts
import {
  getActiveConfig,
  getConfigForAdminToken,
  patchCredential,
  redactCredentials,
  upsertCredentials,
} from "@/services/config";

import {
  configAdminTokenParamsSchema,
  patchCredentialsBodySchema,
  upsertCredentialsBodySchema,
} from "./schema";
```

Then replace every response object currently returning `user: row.user` with:

```ts
{
  admin_token: row.adminToken,
  credentials: redactCredentials(row.credentials),
}
```

Rename the explicit config routes:

```ts
app.get("/api/admin/config/:adminToken", async (request, reply) => {
  const params = configAdminTokenParamsSchema.parse(request.params);
  const row = await getConfigForAdminToken(params.adminToken);
  return reply.send({
    admin_token: row.adminToken,
    credentials: redactCredentials(row.credentials),
  });
});

app.put(
  "/api/admin/config/:adminToken/credentials",
  async (request, reply) => {
    const params = configAdminTokenParamsSchema.parse(request.params);
    const body = upsertCredentialsBodySchema.parse(request.body ?? {});
    const row = await upsertCredentials(params.adminToken, body.credentials);
    assertConfigRow(row);
    return reply.send({
      admin_token: row.adminToken,
      credentials: redactCredentials(row.credentials),
    });
  },
);

app.patch(
  "/api/admin/config/:adminToken/credentials",
  async (request, reply) => {
    const params = configAdminTokenParamsSchema.parse(request.params);
    const body = patchCredentialsBodySchema.parse(request.body ?? {});
    const row = await patchCredential(
      params.adminToken,
      body.key,
      body.value,
    );
    assertConfigRow(row);
    return reply.send({
      admin_token: row.adminToken,
      credentials: redactCredentials(row.credentials),
    });
  },
);
```

- [ ] **Step 7: Replace config-user fallback imports**

In `apps/map-server/src/controllers/transport/controller.ts` and `apps/map-server/src/controllers/admin/controller.ts`, replace `getConfigUserFromToken` with `getConfigAdminToken`. Any fallback context should become:

```ts
{
  configUser: getConfigAdminToken(app.env.MAP_ADMIN_TOKEN),
  credentials: {},
  log: app.log,
}
```

Task 2 will rename `ProviderContext.configUser` to `configAdminToken` after the config lookup behavior is passing.

- [ ] **Step 8: Update OpenAPI admin config schema**

In `apps/map-server/src/openapi.ts`, change `openApi.adminConfig.response.200.properties.user` to:

```ts
admin_token: { type: "string", example: "local.secret" },
```

- [ ] **Step 9: Run tests and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/config.test.ts
pnpm --filter @notion-kit/map-server typecheck
```

Expected: both PASS.

Commit:

```bash
git add apps/map-server/drizzle/0001_rename_config_user_to_admin_token.sql apps/map-server/src/db/schema.ts apps/map-server/src/services/config.ts apps/map-server/src/services/config.test.ts apps/map-server/src/controllers/admin-config/schema.ts apps/map-server/src/controllers/admin-config/controller.ts apps/map-server/src/openapi.ts apps/map-server/src/controllers/admin/controller.ts apps/map-server/src/controllers/transport/controller.ts
git commit -m "feat(map-server): use admin token config identity"
```

### Task 2: Rename Provider Context And Transit Provider Slug

**Files:**
- Modify: `apps/map-server/src/services/transport/types.ts`
- Modify: `apps/map-server/src/services/transport/registry.ts`
- Modify: `apps/map-server/src/services/transport/registry.test.ts`
- Modify: `apps/map-server/src/services/transport/transitland-adapter.ts`
- Modify: `apps/map-server/src/services/transport/simulator-adapter.test.ts`
- Modify: `apps/map-server/src/controllers/transport/schema.ts`
- Modify: `apps/globe/src/lib/transport-provider.ts`
- Modify: `apps/globe/src/lib/api-client.ts`
- Modify: `apps/globe/src/adapters/index.ts`
- Modify: `apps/globe/src/components/layer-sidebar.tsx`
- Modify: `apps/globe/src/plugins/routes/routes-panel.tsx`
- Modify: `apps/globe/src/plugins/vehicles/vehicles-panel.tsx`

- [ ] **Step 1: Write failing registry tests for `transit` slug**

Update `apps/map-server/src/services/transport/registry.test.ts` so the Transitland mock key is `transit` and add this test:

```ts
it("uses transit as the public Transitland-backed provider slug", () => {
  const registry = createTransportProviderRegistry([adapters.transitland]);
  expect(registry.get("transit")).toBe(adapters.transitland);
});
```

Expected current failure before implementation: `Provider not found` or mock key mismatch.

- [ ] **Step 2: Run failing registry test**

Run: `pnpm --filter @notion-kit/map-server test src/services/transport/registry.test.ts`

Expected: FAIL until adapter key and mocks are updated.

- [ ] **Step 3: Update provider context type**

In `apps/map-server/src/services/transport/types.ts`, replace:

```ts
export interface ProviderContext {
  configUser: string;
  credentials: CredentialMap;
  log: FastifyBaseLogger;
}
```

with:

```ts
export interface ProviderContext {
  configAdminToken: string;
  credentials: CredentialMap;
  log: FastifyBaseLogger;
}
```

- [ ] **Step 4: Update context builders after the type rename**

In `apps/map-server/src/controllers/transport/controller.ts` and `apps/map-server/src/controllers/admin/controller.ts`, replace fallback context objects with:

```ts
{
  configAdminToken: getConfigAdminToken(app.env.MAP_ADMIN_TOKEN),
  credentials: {},
  log: app.log,
}
```

Replace active config context objects with:

```ts
{
  configAdminToken: activeConfig.adminToken,
  credentials: activeConfig.credentials,
  log: app.log,
}
```

- [ ] **Step 5: Rename Transitland public provider key**

In `apps/map-server/src/services/transport/transitland-adapter.ts`, set:

```ts
const PROVIDER_KEY = "transit";
```

Keep the file name and display name as Transitland.

- [ ] **Step 6: Update registry tests and simulator test context**

In `apps/map-server/src/services/transport/registry.test.ts`, update the mocked adapter shape:

```ts
transitland: {
  key: "transit",
  displayName: "Transitland",
  kind: "gtfs",
  capabilities: ["static_schedule"],
  requiredCredentialKeys: ["transit_api_key"],
  healthCheck: vi.fn(),
},
```

In `apps/map-server/src/services/transport/simulator-adapter.test.ts`, update the shared context:

```ts
const context: ProviderContext = {
  configAdminToken: "test",
  credentials: {},
  log: console as unknown as FastifyBaseLogger,
};
```

- [ ] **Step 7: Update frontend provider id helper**

Replace `apps/globe/src/lib/transport-provider.ts` with:

```ts
export type MapServerTransportProviderId = "transit" | "simulator";

export function isMapServerTransportProvider(
  value: string,
): value is MapServerTransportProviderId {
  return value === "transit" || value === "simulator";
}

export function transportProviderPath(
  provider: MapServerTransportProviderId,
  path: `/${string}`,
) {
  return `/api/transport/${provider}${path}`;
}

export function adminTransportProviderPath(
  provider: MapServerTransportProviderId,
  path: `/${string}`,
) {
  return `/api/admin/transport/${provider}${path}`;
}
```

- [ ] **Step 8: Update frontend defaults from `transitland` to `transit`**

Apply these exact replacements:

```txt
apps/globe/src/lib/api-client.ts:
input.provider ?? "transitland" -> input.provider ?? "transit"

apps/globe/src/adapters/index.ts:
activeAdapter: "transitland" -> activeAdapter: "transit"
: "transitland" -> : "transit"

apps/globe/src/components/layer-sidebar.tsx:
transitland: -> transit:

apps/globe/src/plugins/routes/routes-panel.tsx:
activeAdapter === "simulator" ? "Simulator" : "Transitland"
```

Keep the visible label `"Transitland"` for the `transit` source.

- [ ] **Step 9: Update remaining provider id references**

Run:

```bash
rg -n '"transitland"|activeAdapter === "transitland"|provider !== "transitland"|provider === "transitland"' apps/globe/src apps/map-server/src/services/transport apps/map-server/src/controllers
```

Replace provider-id comparisons with `transit`, while keeping import paths and filenames under `adapters/transitland` unchanged.

- [ ] **Step 10: Run tests and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/registry.test.ts src/services/transport/simulator-adapter.test.ts
pnpm --filter @notion-kit/map-server typecheck
pnpm --filter @notion-kit/globe typecheck
```

Expected: all PASS.

Commit:

```bash
git add apps/map-server/src/services/transport/types.ts apps/map-server/src/services/transport/registry.ts apps/map-server/src/services/transport/registry.test.ts apps/map-server/src/services/transport/transitland-adapter.ts apps/map-server/src/services/transport/simulator-adapter.test.ts apps/map-server/src/controllers/transport/schema.ts apps/globe/src/lib/transport-provider.ts apps/globe/src/lib/api-client.ts apps/globe/src/adapters/index.ts apps/globe/src/components/layer-sidebar.tsx apps/globe/src/plugins/routes/routes-panel.tsx apps/globe/src/plugins/vehicles/vehicles-panel.tsx
git commit -m "feat(transport): use transit provider slug"
```

### Task 3: Add Provider-Scoped Trip Detail Adapter Methods

**Files:**
- Modify: `apps/map-server/src/services/transport/types.ts`
- Modify: `apps/map-server/src/controllers/trips/controller.ts`
- Modify: `apps/map-server/src/services/transport/transitland-adapter.ts`
- Modify: `apps/map-server/src/services/transport/simulator-adapter.ts`
- Modify: `apps/map-server/src/services/transport/simulator-adapter.test.ts`

- [ ] **Step 1: Write failing simulator trip detail tests**

Add tests to `apps/map-server/src/services/transport/simulator-adapter.test.ts`:

```ts
it("returns deterministic simulator trip route details", async () => {
  const response = (await simulatorAdapter.findTripRoute?.(
    {
      tripId: "sim-feed:trip-blue-1",
      includeShape: true,
    },
    context,
  )) as {
    trip: Record<string, unknown>;
    route: Record<string, unknown>;
    shape: Record<string, unknown> | null;
    alerts: unknown[];
  };

  expect(response.trip).toMatchObject({
    id: "sim-feed:trip-blue-1",
    route_id: "sim-feed:route-blue",
  });
  expect(response.route).toMatchObject({
    id: "sim-feed:route-blue",
    provider_key: "simulator",
  });
  expect(response.shape).toMatchObject({
    shape_id: "sim-feed:shape-blue",
  });
  expect(response.alerts).toEqual([]);
});

it("returns deterministic simulator trip stop times", async () => {
  const response = (await simulatorAdapter.findTripStopTimes?.(
    {
      tripId: "sim-feed:trip-blue-1",
      date: "2026-05-27",
      includeRealtime: true,
      includeGeometry: true,
    },
    context,
  )) as {
    trip_id: string;
    route_short_name: string | null;
    service_date: string;
    stop_times: Array<Record<string, unknown>>;
  };

  expect(response.trip_id).toBe("sim-feed:trip-blue-1");
  expect(response.route_short_name).toBe("BLUE");
  expect(response.stop_times).toHaveLength(3);
  expect(response.stop_times[0]).toMatchObject({
    stop_id: "sim-feed:stop-central",
    stop_name: "Central Station",
    stop_sequence: 1,
    is_timepoint: true,
  });
});
```

- [ ] **Step 2: Run failing simulator tests**

Run: `pnpm --filter @notion-kit/map-server test src/services/transport/simulator-adapter.test.ts`

Expected: FAIL because `findTripRoute` and `findTripStopTimes` are not defined.

- [ ] **Step 3: Add trip detail query types**

In `apps/map-server/src/services/transport/types.ts`, add:

```ts
export interface TripRouteQuery {
  tripId: string;
  includeShape: boolean;
  fallbackRouteId?: string;
}

export interface TripStopTimesQuery {
  tripId: string;
  date: string;
  includeRealtime: boolean;
  includeGeometry: boolean;
  fallbackRouteId?: string;
}
```

Add optional adapter methods:

```ts
findTripRoute?: (
  input: TripRouteQuery,
  context: ProviderContext,
) => Promise<unknown>;
findTripStopTimes?: (
  input: TripStopTimesQuery,
  context: ProviderContext,
) => Promise<unknown>;
```

- [ ] **Step 4: Export repository-backed trip detail builders**

In `apps/map-server/src/controllers/trips/controller.ts`, extract the body of each route into exported functions:

```ts
export async function buildTripRouteResponse(query: {
  tripId: string;
  includeShape: boolean;
  fallbackRouteId?: string;
}) {
  const cacheKey = [
    "trip",
    query.tripId,
    "route",
    query.includeShape,
    query.fallbackRouteId ?? "none",
    "v3",
  ].join(":");
  return getOrSetCached(cacheKey, 24 * 60 * 60, tripRouteResponseSchema, async () => {
    try {
      const trip = await getTrip(query.tripId);
      const routeMap = await getRoutesByIds([trip.routeId]);
      const route = routeMap.get(trip.routeId);
      const shape = await getShapeResponseForTrip(trip, query.includeShape);
      const alerts = await getAlerts({
        feedOnestopIds: [trip.feedOnestopId],
        routeIds: [trip.routeId],
      });
      return {
        trip: toTripResponse(trip),
        route: route ? toRouteResponse(route) : null,
        shape,
        alerts: alerts.map(toAlertResponse),
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        let fallbackRouteId = query.fallbackRouteId;
        if (!fallbackRouteId) {
          const [vehicle] = await getLatestVehicleSnapshots({
            tripId: query.tripId,
            limit: 1,
          });
          if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
        }
        let route = null;
        let alerts: AlertRows = [];
        let shape = null;
        if (fallbackRouteId) {
          const routeMap = await getRoutesByIds([fallbackRouteId]);
          route = routeMap.get(fallbackRouteId) ?? null;
          alerts = await getAlerts({ routeIds: [fallbackRouteId] });
          const fallbackTrips = await getTripsByRouteId(fallbackRouteId, 1);
          if (fallbackTrips[0]) {
            shape = await getShapeResponseForTrip(
              fallbackTrips[0],
              query.includeShape,
            );
          }
        }
        return {
          trip: null,
          route: route ? toRouteResponse(route) : null,
          shape,
          alerts: alerts.map(toAlertResponse),
        };
      }
      throw error;
    }
  });
}
```

Add the stop-times builder:

```ts
export async function buildTripStopTimesResponse(query: {
  tripId: string;
  date: string;
  includeRealtime: boolean;
  includeGeometry: boolean;
  fallbackRouteId?: string;
}) {
  const cacheKey = `trip:${query.tripId}:stoptimes:${query.date}:${query.includeRealtime}:${query.includeGeometry}:v3`;
  const ttl = query.includeRealtime ? 20 : 60 * 60;
  return getOrSetCached(
    cacheKey,
    ttl,
    tripStopTimesResponseSchema,
    async () => {
      try {
        const trip = await getTrip(query.tripId);
        const routeMap = await getRoutesByIds([trip.routeId]);
        const route = routeMap.get(trip.routeId);
        const stopTimeRows = await getStopTimesByTrip(trip.id);
        const stopMap = await getStopsByIds(
          stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
        );
        const updates = query.includeRealtime
          ? await getTripUpdates({ tripIds: [trip.id] })
          : [];
        const updateByStop = new Map(
          updates.map((update) => [update.stopId ?? "", update]),
        );
        return {
          trip_id: trip.id,
          route_short_name: route?.routeShortName ?? null,
          service_date: query.date,
          stop_times: stopTimeRows.map((st) =>
            toTripStopTimeResponse(
              st,
              st.stopId ? stopMap.get(st.stopId) : undefined,
              updateByStop.get(st.stopId ?? ""),
              query.includeGeometry,
            ),
          ),
        };
      } catch (error) {
        if (isNotFoundError(error)) {
          let fallbackRouteId = query.fallbackRouteId;
          if (!fallbackRouteId) {
            const [vehicle] = await getLatestVehicleSnapshots({
              tripId: query.tripId,
              limit: 1,
            });
            if (vehicle?.routeId) fallbackRouteId = vehicle.routeId;
          }
          let stopTimeRows: StopTimeRows = [];
          let stopMap: StopMap = new Map();
          if (fallbackRouteId) {
            const fallbackTrips = await getTripsByRouteId(fallbackRouteId, 1);
            if (fallbackTrips[0]) {
              stopTimeRows = await getStopTimesByTrip(fallbackTrips[0].id);
              stopMap = await getStopsByIds(
                stopTimeRows.flatMap((st) => (st.stopId ? [st.stopId] : [])),
              );
            }
          }
          return {
            trip_id: query.tripId,
            route_short_name: null,
            service_date: query.date,
            stop_times: stopTimeRows.map((st) =>
              toTripStopTimeResponse(
                st,
                st.stopId ? stopMap.get(st.stopId) : undefined,
                undefined,
                query.includeGeometry,
              ),
            ),
          };
        }
        throw error;
      }
    },
  );
}

function isNotFoundError(error: unknown) {
  return (
    error &&
    typeof error === "object" &&
    "statusCode" in error &&
    (error as { statusCode?: number }).statusCode === 404
  );
}
```

Then update existing route handlers to call these builders until Task 7 removes route registration.

- [ ] **Step 5: Wire Transitland adapter trip detail methods**

In `apps/map-server/src/services/transport/transitland-adapter.ts`, import:

```ts
import {
  buildTripRouteResponse,
  buildTripStopTimesResponse,
} from "@/controllers/trips/controller";
```

Add adapter methods:

```ts
findTripRoute: async (input) => {
  return buildTripRouteResponse({
    tripId: input.tripId,
    includeShape: input.includeShape,
    fallbackRouteId: input.fallbackRouteId,
  });
},
findTripStopTimes: async (input) => {
  return buildTripStopTimesResponse({
    tripId: input.tripId,
    date: input.date,
    includeRealtime: input.includeRealtime,
    includeGeometry: input.includeGeometry,
    fallbackRouteId: input.fallbackRouteId,
  });
},
```

- [ ] **Step 6: Add simulator trip detail data**

In `apps/map-server/src/services/transport/simulator-adapter.ts`, add `simulatorStopTimes` after `simulatorDepartures`:

```ts
const simulatorStopTimes = simulatorStops.map((stop, index) => ({
  stop_sequence: index + 1,
  stop_id: stop.id,
  location_group_id: null,
  location_id: null,
  stop_name: stop.stop_name,
  lat: stop.lat,
  lon: stop.lon,
  scheduled_arrival: `08:${String(index * 10).padStart(2, "0")}:00`,
  scheduled_departure: `08:${String(index * 10).padStart(2, "0")}:00`,
  stop_headsign: simulatorTrip.trip_headsign,
  start_pickup_drop_off_window: null,
  end_pickup_drop_off_window: null,
  pickup_type: 0,
  drop_off_type: 0,
  continuous_pickup: null,
  continuous_drop_off: null,
  shape_dist_traveled: index * 1.4,
  timepoint: 1,
  pickup_booking_rule_id: null,
  drop_off_booking_rule_id: null,
  realtime_arrival_delay: 0,
  realtime_departure_delay: 0,
  estimated_departure: `08:${String(index * 10).padStart(2, "0")}:00`,
  schedule_relationship: "SCHEDULED",
  is_timepoint: true,
  stop_status: index === 0 ? "CURRENT" : "UPCOMING",
}));
```

Add adapter methods:

```ts
findTripRoute: async (input) => {
  if (input.tripId !== simulatorTrip.id) {
    throw notFound("Trip not found", { tripId: input.tripId });
  }
  return {
    trip: simulatorTrip,
    route: simulatorRoute,
    shape: input.includeShape ? simulatorShape : null,
    alerts: [],
  };
},
findTripStopTimes: async (input) => {
  if (input.tripId !== simulatorTrip.id) {
    throw notFound("Trip not found", { tripId: input.tripId });
  }
  return {
    trip_id: simulatorTrip.id,
    route_short_name: simulatorRoute.route_short_name,
    service_date: input.date,
    stop_times: simulatorStopTimes.map((stopTime) =>
      input.includeRealtime
        ? stopTime
        : {
            ...stopTime,
            realtime_arrival_delay: null,
            realtime_departure_delay: null,
            schedule_relationship: "STATIC",
          },
    ),
  };
},
```

- [ ] **Step 7: Run tests and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/simulator-adapter.test.ts
pnpm --filter @notion-kit/map-server typecheck
```

Expected: both PASS.

Commit:

```bash
git add apps/map-server/src/services/transport/types.ts apps/map-server/src/controllers/trips/controller.ts apps/map-server/src/services/transport/transitland-adapter.ts apps/map-server/src/services/transport/simulator-adapter.ts apps/map-server/src/services/transport/simulator-adapter.test.ts
git commit -m "feat(transport): add provider trip detail methods"
```

### Task 4: Register Concrete Provider Routes

**Files:**
- Modify: `apps/map-server/src/controllers/transport/schema.ts`
- Modify: `apps/map-server/src/controllers/transport/controller.ts`
- Modify: `apps/map-server/src/controllers/admin/controller.ts`

- [ ] **Step 1: Add transport schema exports**

In `apps/map-server/src/controllers/transport/schema.ts`, add:

```ts
export const providerTripParamsSchema = z.object({
  provider: z.string().min(1),
  tripId: scopedIdSchema,
});
```

Re-export trip query schemas:

```ts
export {
  tripRouteQuerySchema,
  tripStopTimesQuerySchema,
} from "@/controllers/trips/schema";
```

- [ ] **Step 2: Refactor transport read handlers into shared helpers**

In `apps/map-server/src/controllers/transport/controller.ts`, add a concrete provider registration list:

```ts
const documentedProviders = ["transit", "simulator"] as const;
type DocumentedProvider = (typeof documentedProviders)[number];
```

Inside `registerTransportRoutes`, register concrete route paths first:

```ts
for (const provider of documentedProviders) {
  app.get(
    `/api/transport/${provider}/static-feeds/status`,
    { schema: openApi.transportStaticFeedsStatus[provider] },
    (request, reply) => handleStaticFeedsStatus(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/routes`,
    { schema: openApi.transportRoutes[provider] },
    (request, reply) => handleRoutes(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/stops`,
    { schema: openApi.transportStops[provider] },
    (request, reply) => handleStops(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/trips`,
    { schema: openApi.transportTrips[provider] },
    (request, reply) => handleTrips(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/route-shape`,
    { schema: openApi.transportRouteShape[provider] },
    (request, reply) => handleRouteShape(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/stops/:stopId/departures`,
    { schema: openApi.transportStopDepartures[provider] },
    (request, reply) => handleDepartures(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/vehicles`,
    { schema: openApi.transportVehicles[provider] },
    (request, reply) => handleVehicles(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/trips/:tripId/route`,
    { schema: openApi.transportTripRoute[provider] },
    (request, reply) => handleTripRoute(app, provider, request, reply),
  );
  app.get(
    `/api/transport/${provider}/trips/:tripId/stop-times`,
    { schema: openApi.transportTripStopTimes[provider] },
    (request, reply) => handleTripStopTimes(app, provider, request, reply),
  );
}
```

Then keep the existing `:provider` routes only if implementation needs temporary compatibility, but omit schemas from generic routes:

```ts
app.get("/api/transport/:provider/routes", (request, reply) => {
  const { provider } = providerParamsSchema.parse(request.params);
  return handleRoutes(app, provider, request, reply);
});
```

- [ ] **Step 3: Add trip detail handlers**

Add helper functions to `apps/map-server/src/controllers/transport/controller.ts`:

```ts
async function handleTripRoute(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = providerTripParamsSchema.parse({
      provider,
      ...(request.params ?? {}),
    });
    const query = tripRouteQuerySchema.parse(request.query);
    const adapter = transportProviderRegistry.get(params.provider);
    assertProviderMethod(adapter, "static_schedule", "findTripRoute");
    const context = await buildProviderContext(app);
    return reply.send(
      await adapter.findTripRoute(
        {
          tripId: params.tripId,
          includeShape: query.include_shape,
          fallbackRouteId: query.fallback_route_id,
        },
        context,
      ),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}

async function handleTripStopTimes(
  app: FastifyInstance,
  provider: string,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const params = providerTripParamsSchema.parse({
      provider,
      ...(request.params ?? {}),
    });
    const query = tripStopTimesQuerySchema.parse(request.query);
    const adapter = transportProviderRegistry.get(params.provider);
    assertProviderMethod(adapter, "static_schedule", "findTripStopTimes");
    const context = await buildProviderContext(app);
    return reply.send(
      await adapter.findTripStopTimes(
        {
          tripId: params.tripId,
          date: query.date,
          includeRealtime: query.include_realtime,
          includeGeometry: query.include_geometry,
          fallbackRouteId: query.fallback_route_id,
        },
        context,
      ),
    );
  } catch (error) {
    return sendError(reply, error);
  }
}
```

Also import Fastify request/reply types:

```ts
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
```

- [ ] **Step 4: Extend TransportReadMethod**

Update the `TransportReadMethod` union to include:

```ts
| "findTripRoute"
| "findTripStopTimes"
```

- [ ] **Step 5: Register concrete admin transport routes**

In `apps/map-server/src/controllers/admin/controller.ts`, add the same provider list and register:

```ts
for (const provider of documentedProviders) {
  app.post(
    `/api/admin/transport/${provider}/validate`,
    { schema: openApi.adminTransportValidate[provider] },
    (request, reply) => handleValidate(app, provider, request, reply),
  );
  app.post(
    `/api/admin/transport/${provider}/sync/static`,
    { schema: openApi.adminTransportStaticSync[provider] },
    (request, reply) => handleStaticSync(app, provider, request, reply),
  );
  app.post(
    `/api/admin/transport/${provider}/sync/realtime`,
    { schema: openApi.adminTransportRealtimeSync[provider] },
    (request, reply) => handleRealtimeSync(app, provider, request, reply),
  );
}
```

Extract the current provider admin route bodies into `handleValidate`, `handleStaticSync`, and `handleRealtimeSync` helpers using the provider argument instead of parsing `request.params.provider`.

- [ ] **Step 6: Run typecheck and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: PASS.

Commit:

```bash
git add apps/map-server/src/controllers/transport/schema.ts apps/map-server/src/controllers/transport/controller.ts apps/map-server/src/controllers/admin/controller.ts
git commit -m "feat(map-server): register provider-scoped transport routes"
```

### Task 5: Update OpenAPI To Provider-Specific Groups

**Files:**
- Modify: `apps/map-server/src/openapi.ts`
- Modify: `apps/map-server/src/index.ts`

- [ ] **Step 1: Add provider-specific schema builder helpers**

In `apps/map-server/src/openapi.ts`, replace the single `providerParams` schema with concrete operation builders:

```ts
const providerLabels = {
  transit: "Transit",
  simulator: "Simulator",
} as const;

type DocumentedProvider = keyof typeof providerLabels;

function providerTag(provider: DocumentedProvider) {
  return `Transport / ${providerLabels[provider]}`;
}

function adminProviderTag(provider: DocumentedProvider) {
  return `Admin / Transport / ${providerLabels[provider]}`;
}

function withProviderTag<T extends Record<string, unknown>>(
  provider: DocumentedProvider,
  schema: T,
) {
  return {
    ...schema,
    tags: [providerTag(provider)],
  };
}

function withAdminProviderTag<T extends Record<string, unknown>>(
  provider: DocumentedProvider,
  schema: T,
) {
  return {
    ...schema,
    tags: [adminProviderTag(provider)],
    security: [{ adminBearer: [] }],
  };
}
```

- [ ] **Step 2: Convert transport schemas into provider maps**

First extract shared constants from the existing `transportRoutes` operation:

```ts
const transportRoutesQuerystring = {
  type: "object",
  required: ["feed_onestop_id"],
  properties: {
    feed_onestop_id: { type: "string", example: examples.feedOnestopId },
    route_type: { type: "integer", example: 3 },
    limit: { type: "integer", example: 200 },
  },
} as const;

const transportRoutesResponse = {
  200: {
    type: "object",
    properties: {
      routes: { type: "array", items: route },
      meta: { type: "object", additionalProperties: true },
    },
  },
  ...standardErrors,
} as const;
```

Then change the `transportRoutes` entry from a single operation:

```ts
transportRoutes: {
  tags: ["Transport"],
  summary: "List normalized routes for a transport provider",
  params: providerParams,
  querystring: transportRoutesQuerystring,
  response: transportRoutesResponse,
}
```

to:

```ts
transportRoutes: {
  transit: withProviderTag("transit", {
    summary: "List Transitland-backed normalized routes",
    querystring: transportRoutesQuerystring,
    response: transportRoutesResponse,
  }),
  simulator: withProviderTag("simulator", {
    summary: "List simulator normalized routes",
    querystring: transportRoutesQuerystring,
    response: transportRoutesResponse,
  }),
},
```

Extract equivalent shared `querystring`, `params`, `body`, and `response` constants from the current operation objects and convert each of these entries into `{ transit, simulator }` or provider-specific admin maps:

```ts
transportStaticFeedsStatus
transportStops
transportTrips
transportRouteShape
transportStopDepartures
transportVehicles
transportTripRoute
transportTripStopTimes
adminTransportValidate
adminTransportStaticSync
adminTransportRealtimeSync
```

The concrete route schemas should not include a `provider` path param because the provider is already in the literal path.

- [ ] **Step 3: Add provider tags in Fastify swagger registration**

In `apps/map-server/src/index.ts`, replace the single Transport tag:

```ts
{
  name: "Transport",
  description: "Provider-scoped normalized transportation APIs.",
},
```

with:

```ts
{
  name: "Transport / Transit",
  description: "Transitland-backed normalized transportation APIs.",
},
{
  name: "Transport / Simulator",
  description: "Deterministic simulator transportation APIs.",
},
{
  name: "Admin / Transport / Transit",
  description: "Transit provider validation and sync jobs.",
},
{
  name: "Admin / Transport / Simulator",
  description: "Simulator provider validation and sync jobs.",
},
```

- [ ] **Step 4: Remove legacy OpenAPI entries**

Keep legacy OpenAPI entries in this task so current route registrations keep compiling. Task 7 removes these entries after the legacy route registrations are removed:

```txt
mapStaticFeedsStatus
mapRoutes
mapTrips
mapRouteShape
mapStops
mapVehicles
tripRoute
tripStopTimes
adminStaticSync
adminRealtimeSync
```

- [ ] **Step 5: Run typecheck and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: PASS.

Commit:

```bash
git add apps/map-server/src/openapi.ts apps/map-server/src/index.ts
git commit -m "docs(map-server): group transport openapi by provider"
```

### Task 6: Migrate Globe Trip Detail URLs

**Files:**
- Modify: `apps/globe/src/adapters/transitland/use-route-shapes.ts`
- Modify: `apps/globe/src/adapters/transitland/use-route-stops.ts`
- Modify: `apps/globe/src/lib/query-key.ts`

- [ ] **Step 1: Update route-shape hook to use provider-scoped trip route**

In `apps/globe/src/adapters/transitland/use-route-shapes.ts`, replace the query branch with:

```ts
const path =
  tripId
    ? transportProviderPath(
        provider,
        `/trips/${encodeURIComponent(tripId)}/route`,
      )
    : transportProviderPath(provider, "/route-shape");

const query =
  tripId
    ? {
        include_shape: true,
        ...(fallbackRouteId ? { fallback_route_id: fallbackRouteId } : {}),
      }
    : {
        route_id: fallbackRouteId ?? tripId!,
        include_shape: true,
      };

const { data, error } = await mapApiClient<TripRouteResponse>(path, {
  query,
});
```

Then remove the direct `/api/trips/...` call.

- [ ] **Step 2: Update route-stops hook to use provider-scoped trip stop-times**

In `apps/globe/src/adapters/transitland/use-route-stops.ts`, replace:

```ts
const { data, error } = await mapApiClient<TripStopTimesResponse>(
  `/api/trips/${encodeURIComponent(id)}/stop-times`,
  { query },
);
```

with:

```ts
const { data, error } = await mapApiClient<TripStopTimesResponse>(
  transportProviderPath(provider, `/trips/${encodeURIComponent(id)}/stop-times`),
  { query },
);
```

Keep the existing simulator fallback route-stops branch for route-only selection until simulator trip selection is verified. The provider-scoped simulator trip stop-times endpoint will be used when a simulator trip id is present.

- [ ] **Step 3: Confirm no unscoped trip URLs remain**

Run:

```bash
rg -n '"/api/trips|`/api/trips|/api/trips' apps/globe/src
```

Expected: no matches.

- [ ] **Step 4: Run globe typecheck and commit**

Run:

```bash
pnpm --filter @notion-kit/globe typecheck
```

Expected: PASS.

Commit:

```bash
git add apps/globe/src/adapters/transitland/use-route-shapes.ts apps/globe/src/adapters/transitland/use-route-stops.ts apps/globe/src/lib/query-key.ts
git commit -m "feat(globe): use provider-scoped trip detail routes"
```

### Task 7: Remove Legacy Route Registrations And No-Arg Transitland Clients

**Files:**
- Modify: `apps/map-server/src/controllers/map/controller.ts`
- Modify: `apps/map-server/src/controllers/admin/controller.ts`
- Modify: `apps/map-server/src/controllers/trips/controller.ts`
- Modify: `apps/map-server/src/index.ts`
- Modify: `apps/map-server/src/openapi.ts`

- [ ] **Step 1: Remove legacy `/api/map` route registration**

In `apps/map-server/src/controllers/map/controller.ts`, delete the `registerMapRoutes` function body or remove the exported function entirely if no imports remain. Keep the existing exported builder functions used by `transitland-adapter.ts`: `buildRoutesResponse`, `buildTripsResponse`, `buildRouteShapeResponse`, `buildVehiclesResponse`, and `buildStopsResponse`.

Delete the direct `new TransitlandClient()` static-feed status route with the rest of the registration.

- [ ] **Step 2: Remove legacy `/api/admin/sync` routes**

In `apps/map-server/src/controllers/admin/controller.ts`, delete route registrations for:

```txt
POST /api/admin/sync/static
POST /api/admin/sync/realtime
```

After deleting them, remove imports used only by those handlers:

```ts
badRequest
buildStaticImportResult
importGtfsStaticFeed
syncRealtimeFeeds
getFeedsByIds
getStaticFeedCounts
runRetention if unused by retained retention route remains used
getFeedOnestopId
getFeedVersion
TransitlandClient
```

Keep `/api/admin/retention` if still required.

- [ ] **Step 3: Remove unscoped `/api/trips` route registration**

In `apps/map-server/src/controllers/trips/controller.ts`, remove `registerTripRoutes` or make it no-op. Keep exported `buildTripRouteResponse` and `buildTripStopTimesResponse`.

- [ ] **Step 4: Stop registering removed route groups**

In `apps/map-server/src/index.ts`, remove imports and registration calls if the functions were deleted:

```ts
import { registerMapRoutes } from "@/controllers/map/controller";
import { registerTripRoutes } from "@/controllers/trips/controller";

await app.register(registerMapRoutes);
await app.register(registerTripRoutes);
```

- [ ] **Step 5: Remove legacy OpenAPI schemas**

In `apps/map-server/src/openapi.ts`, remove the legacy entries listed in Task 5 Step 4 after no code references them.

- [ ] **Step 6: Verify no no-arg Transitland client remains**

Run:

```bash
rg -n 'new TransitlandClient\\(\\)' apps/map-server/src
```

Expected: no matches.

- [ ] **Step 7: Verify no removed route strings remain in server registration**

Run:

```bash
rg -n '"/api/map|`/api/map|"/api/admin/sync|`/api/admin/sync|"/api/trips|`/api/trips' apps/map-server/src
```

Expected: no route registration matches. String examples in comments should be removed or changed to provider-scoped examples.

- [ ] **Step 8: Run typecheck and commit**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: PASS.

Commit:

```bash
git add apps/map-server/src/controllers/map/controller.ts apps/map-server/src/controllers/admin/controller.ts apps/map-server/src/controllers/trips/controller.ts apps/map-server/src/index.ts apps/map-server/src/openapi.ts
git commit -m "refactor(map-server): remove legacy transit default routes"
```

### Task 8: Update Documentation

**Files:**
- Modify: `apps/map-server/docs/data-sources.md`
- Modify: `apps/map-server/docs/use-cases.md`
- Modify: `docs/superpowers/specs/2026-05-27-transport-data-sources-design.md`

- [ ] **Step 1: Update data-sources docs**

In `apps/map-server/docs/data-sources.md`, replace the provider endpoint section with:

````md
## Provider-scoped endpoints

Provider-scoped endpoints make source selection explicit while preserving normalized responses:

```txt
GET /api/transport/transit/static-feeds/status
GET /api/transport/transit/routes
GET /api/transport/transit/stops
GET /api/transport/transit/route-shape
GET /api/transport/transit/trips
GET /api/transport/transit/trips/:tripId/route
GET /api/transport/transit/trips/:tripId/stop-times
GET /api/transport/transit/stops/:stopId/departures
GET /api/transport/transit/vehicles

GET /api/transport/simulator/static-feeds/status
GET /api/transport/simulator/routes
GET /api/transport/simulator/stops
GET /api/transport/simulator/route-shape
GET /api/transport/simulator/trips
GET /api/transport/simulator/trips/:tripId/route
GET /api/transport/simulator/trips/:tripId/stop-times
GET /api/transport/simulator/stops/:stopId/departures
GET /api/transport/simulator/vehicles

POST /api/admin/transport/transit/sync/static
POST /api/admin/transport/transit/sync/realtime
POST /api/admin/transport/transit/validate

POST /api/admin/transport/simulator/sync/static
POST /api/admin/transport/simulator/sync/realtime
POST /api/admin/transport/simulator/validate
```
````

Also update the shared config table section to use:

```md
config {
  admin_token: string;
  credentials: jsonb;
}
```

- [ ] **Step 2: Update use-cases endpoint examples**

In `apps/map-server/docs/use-cases.md`, replace examples as follows:

```txt
/api/map/static-feeds/status -> /api/transport/transit/static-feeds/status
/api/map/routes -> /api/transport/transit/routes
/api/map/stops -> /api/transport/transit/stops
/api/map/route-shape -> /api/transport/transit/route-shape
/api/map/trips -> /api/transport/transit/trips
/api/admin/sync/static -> /api/admin/transport/transit/sync/static
/api/admin/sync/realtime -> /api/admin/transport/transit/sync/realtime
/api/trips/:tripId/route -> /api/transport/transit/trips/:tripId/route
/api/trips/:tripId/stop-times -> /api/transport/transit/trips/:tripId/stop-times
```

- [ ] **Step 3: Update old superpowers spec if it remains referenced**

In `docs/superpowers/specs/2026-05-27-transport-data-sources-design.md`, update the config section and endpoint examples to match `admin_token` and concrete `transit`/`simulator` paths. Add a short note:

```md
The follow-up cleanup spec on 2026-05-28 supersedes the temporary `/api/transport/:provider` and `/api/map/...` migration language.
```

- [ ] **Step 4: Verify old endpoint docs are gone**

Run:

```bash
rg -n '/api/map|/api/admin/sync|/api/trips/' apps/map-server/docs docs/superpowers/specs
```

Expected: no matches except historical notes that explicitly say the endpoints were removed.

- [ ] **Step 5: Commit docs**

Run:

```bash
git add apps/map-server/docs/data-sources.md apps/map-server/docs/use-cases.md docs/superpowers/specs/2026-05-27-transport-data-sources-design.md
git commit -m "docs(map-server): document provider-scoped transport APIs"
```

### Task 9: Final Verification

**Files:**
- No source edits expected.

- [ ] **Step 1: Run targeted map-server tests**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/config.test.ts src/services/transport/registry.test.ts src/services/transport/simulator-adapter.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run map-server typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: PASS.

- [ ] **Step 3: Run globe typecheck**

Run:

```bash
pnpm --filter @notion-kit/globe typecheck
```

Expected: PASS.

- [ ] **Step 4: Verify migration grep checks**

Run:

```bash
rg -n 'new TransitlandClient\\(\\)' apps/map-server/src
rg -n '"/api/map|`/api/map|"/api/admin/sync|`/api/admin/sync|"/api/trips|`/api/trips' apps/map-server/src apps/globe/src
rg -n '"transitland"|activeAdapter === "transitland"|provider !== "transitland"|provider === "transitland"' apps/globe/src apps/map-server/src
```

Expected: no matches for removed route registrations or old provider ids. File paths such as `adapters/transitland` and class names such as `TransitlandClient` may remain.

- [ ] **Step 5: Build map-server**

Run:

```bash
pnpm --filter @notion-kit/map-server build
```

Expected: PASS.

- [ ] **Step 6: Build globe**

Run:

```bash
pnpm --filter @notion-kit/globe build
```

Expected: PASS.

- [ ] **Step 7: Final status check**

Run:

```bash
git status --short
```

Expected: no unstaged implementation changes except any intentionally preserved user edits that predated this plan.
