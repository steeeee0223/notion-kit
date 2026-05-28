# Transport Data Sources Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V1 transport data-source foundation for GTFS-compatible providers with DB-backed shared credentials, provider adapters, provider-scoped endpoints, and a simulator provider.

**Architecture:** Add a small transport-provider layer beside the existing Transitland and GTFS services. Keep current `/api/map/...` and `/api/admin/sync/...` behavior working, then expose `/api/transport/:provider/...` and `/api/admin/transport/:provider/...` routes that call adapters returning the existing normalized response DTOs.

**Tech Stack:** TypeScript, Fastify, Zod v4, Drizzle ORM, Vercel Postgres, Vitest, existing map-server repository/service patterns.

---

## File Structure

- Modify `apps/map-server/src/db/schema.ts`: add the `config` table.
- Modify `apps/map-server/src/env.ts`: make `TRANS_TRANSITLAND` optional at bootstrap once credentials can come from DB.
- Create `apps/map-server/src/services/config.ts`: resolve active config user from `MAP_ADMIN_TOKEN`, read/write credential JSON, redact secret values.
- Create `apps/map-server/src/services/config.test.ts`: unit tests for config-user parsing and secret redaction.
- Create `apps/map-server/src/services/transport/errors.ts`: typed provider errors.
- Create `apps/map-server/src/services/transport/types.ts`: adapter interfaces and shared transport capability types.
- Create `apps/map-server/src/services/transport/registry.ts`: provider registry and capability checks.
- Create `apps/map-server/src/services/transport/transitland-adapter.ts`: wrapper around existing Transitland/static/realtime services.
- Create `apps/map-server/src/services/transport/simulator-adapter.ts`: deterministic no-credential provider.
- Create `apps/map-server/src/services/transport/registry.test.ts`: provider lookup and capability tests.
- Create `apps/map-server/src/services/transport/simulator-adapter.test.ts`: simulator contract tests.
- Create `apps/map-server/src/controllers/transport/schema.ts`: provider params and shared query schemas.
- Create `apps/map-server/src/controllers/transport/controller.ts`: provider-scoped read routes.
- Create `apps/map-server/src/controllers/admin-config/schema.ts`: admin config body schemas.
- Create `apps/map-server/src/controllers/admin-config/controller.ts`: DB config admin routes.
- Modify `apps/map-server/src/controllers/admin/controller.ts`: add provider-scoped sync/validate routes while preserving existing sync routes.
- Modify `apps/map-server/src/controllers/map/controller.ts`: export reusable map response builders where provider routes need them.
- Modify `apps/map-server/src/openapi.ts`: document new transport and config routes.
- Modify `apps/map-server/src/index.ts`: register the new transport/config routes and OpenAPI tags.
- Modify `apps/map-server/docs/data-sources.md`: rewrite as the transport-source roadmap from the approved design.

---

### Task 1: Shared Config Table And Service

**Files:**
- Modify: `apps/map-server/src/db/schema.ts`
- Modify: `apps/map-server/src/env.ts`
- Create: `apps/map-server/src/services/config.ts`
- Create: `apps/map-server/src/services/config.test.ts`

- [ ] **Step 1: Write config service tests**

Add `apps/map-server/src/services/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  getConfigUserFromToken,
  redactCredentials,
  validateCredentialKey,
} from "./config";

describe("config service helpers", () => {
  it("uses the token prefix as the config user", () => {
    expect(getConfigUserFromToken("local.secret-value")).toBe("local");
    expect(getConfigUserFromToken("ci.abc.def")).toBe("ci");
    expect(getConfigUserFromToken("production.token")).toBe("production");
  });

  it("falls back to admin when the token has no user prefix", () => {
    expect(getConfigUserFromToken("plain-token")).toBe("admin");
    expect(getConfigUserFromToken(undefined)).toBe("admin");
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

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/config.test.ts
```

Expected: fail because `apps/map-server/src/services/config.ts` does not exist.

- [ ] **Step 3: Add the config table**

In `apps/map-server/src/db/schema.ts`, keep the import list as:

```ts
import {
  bigserial,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
```

Then add this table near the existing `cache` table:

```ts
export const config = pgTable("config", {
  user: text("user").primaryKey(),
  credentials: jsonb("credentials")
    .$type<Record<string, string | null>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

- [ ] **Step 4: Loosen Transitland env bootstrap**

In `apps/map-server/src/env.ts`, change `TRANS_TRANSITLAND` so the server can boot before the DB config row is populated:

```ts
TRANS_TRANSITLAND: z.string().optional(),
```

Keep `runtimeEnv.TRANS_TRANSITLAND` unchanged.

- [ ] **Step 5: Add the config service**

Create `apps/map-server/src/services/config.ts`:

```ts
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { config } from "@/db/schema";
import { badRequest, notFound } from "@/lib/api-error";

export type CredentialMap = Record<string, string | null>;

const INVALID_CREDENTIAL_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const CREDENTIAL_KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export function getConfigUserFromToken(token: string | undefined) {
  if (!token) return "admin";
  const [prefix, secret] = token.split(".", 2);
  if (!prefix || !secret) return "admin";
  return prefix;
}

export function validateCredentialKey(key: string) {
  if (!CREDENTIAL_KEY_PATTERN.test(key)) {
    throw badRequest("Credential keys must use lowercase snake_case", { key });
  }
  if (INVALID_CREDENTIAL_KEYS.has(key)) {
    throw badRequest("Credential key is not allowed", { key });
  }
}

export function redactCredentials(credentials: CredentialMap) {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      { present: typeof value === "string" && value.length > 0 },
    ]),
  );
}

export async function getConfigForUser(user: string) {
  const [row] = await db
    .select()
    .from(config)
    .where(eq(config.user, user))
    .limit(1);
  if (!row) throw notFound("Config user not found", { user });
  return row;
}

export async function getActiveConfig(adminToken: string | undefined) {
  return getConfigForUser(getConfigUserFromToken(adminToken));
}

export async function upsertCredentials(user: string, credentials: CredentialMap) {
  for (const key of Object.keys(credentials)) validateCredentialKey(key);
  const [row] = await db
    .insert(config)
    .values({ user, credentials, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: config.user,
      set: {
        credentials: sql`excluded.credentials`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning();
  return row;
}

export async function patchCredential(
  user: string,
  key: string,
  value: string | null,
) {
  validateCredentialKey(key);
  const existing = await getConfigForUser(user).catch(() => ({
    user,
    credentials: {},
  }));
  return upsertCredentials(user, {
    ...(existing.credentials as CredentialMap),
    [key]: value,
  });
}

export async function removeCredential(user: string, key: string) {
  validateCredentialKey(key);
  const existing = await getConfigForUser(user);
  const next = { ...(existing.credentials as CredentialMap) };
  delete next[key];
  return upsertCredentials(user, next);
}
```

- [ ] **Step 6: Run the config test and verify it passes**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/config.test.ts
```

Expected: pass.

- [ ] **Step 7: Generate the Drizzle migration**

Run:

```bash
pnpm --filter @notion-kit/map-server db:generate
```

Expected: a migration file is generated by Drizzle for the `config` table.

- [ ] **Step 8: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add apps/map-server/src/db/schema.ts apps/map-server/src/env.ts apps/map-server/src/services/config.ts apps/map-server/src/services/config.test.ts apps/map-server/drizzle
git commit -m "feat(map-server): add shared provider config"
```

---

### Task 2: Provider Types, Errors, And Registry

**Files:**
- Create: `apps/map-server/src/services/transport/errors.ts`
- Create: `apps/map-server/src/services/transport/types.ts`
- Create: `apps/map-server/src/services/transport/registry.ts`
- Create: `apps/map-server/src/services/transport/registry.test.ts`

- [ ] **Step 1: Write registry tests**

Create `apps/map-server/src/services/transport/registry.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { ProviderError } from "./errors";
import {
  assertProviderCapability,
  createTransportProviderRegistry,
} from "./registry";
import type { TransportProviderAdapter } from "./types";

const simulator: TransportProviderAdapter = {
  key: "simulator",
  displayName: "Simulator",
  kind: "simulator",
  capabilities: ["static_schedule", "realtime_vehicles"],
  requiredCredentialKeys: [],
  healthCheck: async () => ({ ok: true }),
};

describe("transport provider registry", () => {
  it("looks up providers by key", () => {
    const registry = createTransportProviderRegistry([simulator]);
    expect(registry.get("simulator")).toBe(simulator);
  });

  it("throws a typed error for unknown providers", () => {
    const registry = createTransportProviderRegistry([simulator]);
    expect(() => registry.get("missing")).toThrow(ProviderError);
    expect(() => registry.get("missing")).toThrow("Provider not found");
  });

  it("validates provider capabilities", () => {
    expect(() =>
      assertProviderCapability(simulator, "static_schedule"),
    ).not.toThrow();
    expect(() => assertProviderCapability(simulator, "alerts")).toThrow(
      "Provider does not support capability",
    );
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/registry.test.ts
```

Expected: fail because transport service files do not exist.

- [ ] **Step 3: Add typed provider errors**

Create `apps/map-server/src/services/transport/errors.ts`:

```ts
import { ApiError } from "@/lib/api-error";

export type ProviderErrorCode =
  | "PROVIDER_NOT_FOUND"
  | "PROVIDER_DISABLED"
  | "MISSING_CREDENTIALS"
  | "UNSUPPORTED_CAPABILITY"
  | "UPSTREAM_UNAVAILABLE"
  | "SYNC_IN_PROGRESS"
  | "PARTIAL_DATA"
  | "STALE_DATA";

export class ProviderError extends ApiError {
  constructor(statusCode: number, code: ProviderErrorCode, message: string, details?: unknown) {
    super(statusCode, code, message, details);
  }
}

export function providerNotFound(provider: string) {
  return new ProviderError(404, "PROVIDER_NOT_FOUND", "Provider not found", {
    provider,
  });
}

export function unsupportedCapability(provider: string, capability: string) {
  return new ProviderError(
    400,
    "UNSUPPORTED_CAPABILITY",
    "Provider does not support capability",
    { provider, capability },
  );
}

export function missingCredentials(provider: string, keys: string[]) {
  return new ProviderError(
    401,
    "MISSING_CREDENTIALS",
    "Provider credentials are missing",
    { provider, keys },
  );
}
```

- [ ] **Step 4: Add provider types**

Create `apps/map-server/src/services/transport/types.ts`:

```ts
import type { FastifyBaseLogger } from "fastify";

import type { Bbox } from "@/lib/schemas";
import type { CredentialMap } from "@/services/config";
import type { StaticFeedStatusCandidate } from "@/services/static-feed-status";

export type TransportCapability =
  | "static_schedule"
  | "realtime_vehicles"
  | "trip_updates"
  | "alerts"
  | "departures";

export type TransportProviderKind =
  | "gtfs"
  | "gtfs_rest"
  | "country_api"
  | "simulator"
  | "flight_reserved";

export interface ProviderContext {
  configUser: string;
  credentials: CredentialMap;
  log: FastifyBaseLogger;
}

export interface ProviderHealth {
  ok: boolean;
  message?: string;
  credentialKeys?: Record<string, { present: boolean }>;
}

export interface StaticFeedDiscoveryInput {
  bbox: Bbox;
}

export interface StaticSyncInput {
  bbox?: Bbox;
  feedIds?: string[];
  force?: boolean;
}

export interface RealtimeSyncInput {
  bbox?: Bbox;
  feedIds?: string[];
}

export interface StopQuery {
  bbox?: Bbox;
  feedOnestopId?: string;
  includeAlerts?: boolean;
  limit: number;
}

export interface RouteQuery {
  feedOnestopId: string;
  routeType?: number;
  limit: number;
}

export interface TripQuery {
  routeId: string;
  serviceDate: string;
  startTime: string;
  endTime: string;
  directionId?: number;
  limit: number;
}

export interface RouteShapeQuery {
  routeId: string;
  includeShape: boolean;
}

export interface DepartureQuery {
  stopId: string;
  date: string;
  startTime: string;
  endTime: string;
  includeRealtime: boolean;
  includeAlerts: boolean;
  limit: number;
}

export interface VehicleQuery {
  bbox?: Bbox;
  feedOnestopId?: string;
  routeType?: number;
}

export interface TransportProviderAdapter {
  key: string;
  displayName: string;
  kind: TransportProviderKind;
  capabilities: TransportCapability[];
  requiredCredentialKeys: string[];

  healthCheck(context: ProviderContext): Promise<ProviderHealth>;
  discoverStaticFeeds?(
    input: StaticFeedDiscoveryInput,
    context: ProviderContext,
  ): Promise<{ candidates: StaticFeedStatusCandidate[]; meta: unknown }>;
  syncStatic?(input: StaticSyncInput, context: ProviderContext): Promise<unknown>;
  syncRealtime?(input: RealtimeSyncInput, context: ProviderContext): Promise<unknown>;
  findStops?(input: StopQuery, context: ProviderContext): Promise<unknown>;
  findRoutes?(input: RouteQuery, context: ProviderContext): Promise<unknown>;
  findTrips?(input: TripQuery, context: ProviderContext): Promise<unknown>;
  findRouteShape?(input: RouteShapeQuery, context: ProviderContext): Promise<unknown>;
  findDepartures?(input: DepartureQuery, context: ProviderContext): Promise<unknown>;
  findVehicles?(input: VehicleQuery, context: ProviderContext): Promise<unknown>;
}
```

- [ ] **Step 5: Add the registry**

Create `apps/map-server/src/services/transport/registry.ts`:

```ts
import {
  providerNotFound,
  unsupportedCapability,
} from "@/services/transport/errors";
import type {
  TransportCapability,
  TransportProviderAdapter,
} from "@/services/transport/types";

export interface TransportProviderRegistry {
  list(): TransportProviderAdapter[];
  get(provider: string): TransportProviderAdapter;
}

export function createTransportProviderRegistry(
  providers: TransportProviderAdapter[],
): TransportProviderRegistry {
  const byKey = new Map(providers.map((provider) => [provider.key, provider]));
  return {
    list: () => [...byKey.values()],
    get(provider: string) {
      const adapter = byKey.get(provider);
      if (!adapter) throw providerNotFound(provider);
      return adapter;
    },
  };
}

export function assertProviderCapability(
  provider: TransportProviderAdapter,
  capability: TransportCapability,
) {
  if (!provider.capabilities.includes(capability)) {
    throw unsupportedCapability(provider.key, capability);
  }
}
```

- [ ] **Step 6: Run registry tests**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/registry.test.ts
```

Expected: pass.

- [ ] **Step 7: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass.

- [ ] **Step 8: Commit**

```bash
git add apps/map-server/src/services/transport
git commit -m "feat(map-server): add transport provider registry"
```

---

### Task 3: Transitland Adapter Wrapper

**Files:**
- Modify: `apps/map-server/src/services/transitland/client.ts`
- Modify: `apps/map-server/src/controllers/map/controller.ts`
- Create: `apps/map-server/src/services/transport/transitland-adapter.ts`

- [ ] **Step 1: Update Transitland client to accept DB credentials**

Modify `apps/map-server/src/services/transitland/client.ts` so the constructor accepts an optional API key:

```ts
export class TransitlandClient {
  private readonly apiKey: string | undefined;
  private readonly baseUrl = "https://transit.land/api/v2/rest";

  constructor(apiKey = env.TRANS_TRANSITLAND) {
    this.apiKey = apiKey;
  }
```

Keep the rest of the class unchanged.

- [ ] **Step 2: Export reusable map response builders**

In `apps/map-server/src/controllers/map/controller.ts`, export the helper functions used by provider routes:

```ts
export async function buildStopsResponse(
  query: z.infer<typeof mapStopsQuerySchema>,
) {
```

Also export:

```ts
export async function getShapeResponseForTrip(
  trip: TripRow,
  includeShape: boolean,
) {
```

Keep their implementations unchanged.

- [ ] **Step 3: Add the Transitland adapter**

Create `apps/map-server/src/services/transport/transitland-adapter.ts`:

```ts
import { buildStaticImportResult } from "@/services/gtfs/data-transfer";
import { importGtfsStaticFeed } from "@/services/gtfs/static-import";
import { syncRealtimeFeeds } from "@/services/realtime/gtfs-rt";
import {
  findRoutes,
  findStops,
  findTripsByRoute,
  findTripsByRouteInTimeRange,
  getActiveServices,
  getFeedsByIds,
  getLatestVehicleSnapshots,
  getRoutesByIds,
  getShape,
  getStaticFeedCounts,
  getStopsByIds,
  getStopTimesByTrip,
  getTripsByRouteId,
} from "@/services/repository";
import { buildStaticFeedStatusCandidates } from "@/services/static-feed-status";
import {
  toRouteResponse,
  toRouteTripSummaryResponse,
  toShapeResponse,
  toStopResponse,
  toTripResponse,
  toVehicleResponse,
} from "@/services/transfer";
import {
  getFeedOnestopId,
  getFeedVersion,
  TransitlandClient,
} from "@/services/transitland/client";
import { missingCredentials } from "@/services/transport/errors";
import type { TransportProviderAdapter } from "@/services/transport/types";

export const transitlandAdapter: TransportProviderAdapter = {
  key: "transitland",
  displayName: "Transitland",
  kind: "gtfs",
  capabilities: [
    "static_schedule",
    "realtime_vehicles",
    "trip_updates",
    "alerts",
    "departures",
  ],
  requiredCredentialKeys: ["transit_api_key"],

  async healthCheck(context) {
    const apiKey = getTransitlandApiKey(context.credentials);
    return {
      ok: Boolean(apiKey),
      credentialKeys: {
        transit_api_key: { present: Boolean(apiKey) },
      },
      ...(apiKey ? {} : { message: "Missing transit_api_key" }),
    };
  },

  async discoverStaticFeeds(input, context) {
    const transitland = new TransitlandClient(requireTransitlandApiKey(context.credentials));
    const feeds = await transitland.discoverFeeds({ bbox: input.bbox });
    const candidates = await buildStaticFeedStatusCandidates(feeds);
    return {
      candidates,
      meta: {
        bbox: [...input.bbox],
        total: candidates.length,
        provider: "transitland",
      },
    };
  },

  async syncStatic(input, context) {
    const transitland = new TransitlandClient(requireTransitlandApiKey(context.credentials));
    const feeds = await transitland.discoverFeeds({
      bbox: input.bbox,
      feedIds: input.feedIds,
    });
    const existingFeeds = await getFeedsByIds(
      feeds.map(getFeedOnestopId).filter(Boolean),
    );
    const synced = [];
    const errors = [];
    let transitlandApiCallsUsed = input.feedIds?.length ?? 1;

    for (const feed of feeds) {
      const feedOnestopId = getFeedOnestopId(feed);
      const sha1 = getFeedVersion(feed)?.sha1 ?? null;
      const existingSha1 = existingFeeds.get(feedOnestopId)?.sha1Current ?? null;
      const existingCounts = await getStaticFeedCounts(feedOnestopId);
      const started = Date.now();
      try {
        if (
          !input.force &&
          sha1 &&
          sha1 === existingSha1 &&
          existingCounts.stops > 0 &&
          existingCounts.routes > 0 &&
          existingCounts.trips > 0
        ) {
          synced.push(
            buildStaticImportResult(
              feedOnestopId,
              sha1,
              "skipped",
              started,
              existingCounts,
            ),
          );
          continue;
        }
        const zipBuffer = await transitland.downloadLatestFeedVersion(feedOnestopId);
        transitlandApiCallsUsed += 1;
        synced.push(
          await importGtfsStaticFeed({
            feed,
            zipBuffer,
            force: input.force,
            existingSha1,
          }),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown static GTFS import error";
        context.log.error({ error: message, feedOnestopId }, "Static GTFS import failed");
        errors.push({ feedOnestopId, message });
        synced.push(
          buildStaticImportResult(feedOnestopId, sha1, "error", started, undefined, message),
        );
      }
    }

    return { synced, transitlandApiCallsUsed, errors };
  },

  async syncRealtime(input, context) {
    return syncRealtimeFeeds({
      bbox: input.bbox,
      feedIds: input.feedIds,
      timeoutMs: 10000,
      apiKey: requireTransitlandApiKey(context.credentials),
    });
  },

  async findStops(input) {
    const stops = await findStops({
      bbox: input.bbox,
      feedOnestopId: input.feedOnestopId,
      limit: input.limit,
    });
    return {
      stops: stops.map((stop) => ({
        ...toStopResponse(stop),
        provider_key: "transitland",
      })),
      meta: { total: stops.length, provider: "transitland" },
    };
  },

  async findRoutes(input) {
    const routes = await findRoutes({
      feedOnestopId: input.feedOnestopId,
      routeType: input.routeType,
      limit: input.limit,
    });
    return {
      routes: routes.map((route) => ({
        ...toRouteResponse(route),
        provider_key: "transitland",
      })),
      meta: {
        total: routes.length,
        provider: "transitland",
        feed_onestop_id: input.feedOnestopId,
      },
    };
  },

  async findTrips(input) {
    const routeMap = await getRoutesByIds([input.routeId]);
    const route = routeMap.get(input.routeId);
    if (!route) return { trips: [], meta: { total: 0, provider: "transitland" } };
    const activeServices = await getActiveServices(route.feedOnestopId, input.serviceDate);
    const staticCounts = await getStaticFeedCounts(route.feedOnestopId);
    const tripRows =
      staticCounts.stopTimes > 0 && activeServices.size > 0
        ? await findTripsByRouteInTimeRange({
            routeId: input.routeId,
            serviceIds: [...activeServices],
            startTime: input.startTime,
            endTime: input.endTime,
            directionId: input.directionId,
            limit: input.limit,
          })
        : (
            await findTripsByRoute({
              routeId: input.routeId,
              serviceIds: activeServices.size > 0 ? [...activeServices] : undefined,
              directionId: input.directionId,
              limit: input.limit,
            })
          ).map((trip) => ({
            trip,
            firstDepartureTime: null,
            lastDepartureTime: null,
            stopCount: 0,
          }));
    return {
      trips: tripRows.map((row) => ({
        ...toRouteTripSummaryResponse(row),
        provider_key: "transitland",
      })),
      meta: { total: tripRows.length, provider: "transitland" },
    };
  },

  async findRouteShape(input) {
    const routeMap = await getRoutesByIds([input.routeId]);
    const route = routeMap.get(input.routeId);
    if (!route) return { trip: null, route: null, shape: null };
    const [trip] = await getTripsByRouteId(input.routeId, 1);
    const shape = trip && input.includeShape && trip.shapeId
      ? toShapeResponse(await getShape(trip.shapeId))
      : null;
    return {
      trip: trip ? toTripResponse(trip) : null,
      route: { ...toRouteResponse(route), provider_key: "transitland" },
      shape,
    };
  },

  async findVehicles(input) {
    const vehicles = await getLatestVehicleSnapshots({
      bbox: input.bbox,
      feedOnestopId: input.feedOnestopId,
    });
    const routes = await getRoutesByIds(
      vehicles.flatMap((vehicle) => (vehicle.routeId ? [vehicle.routeId] : [])),
    );
    return {
      vehicles: vehicles
        .filter((vehicle) => {
          if (typeof input.routeType !== "number") return true;
          const route = vehicle.routeId ? routes.get(vehicle.routeId) : undefined;
          return route?.routeType === input.routeType;
        })
        .map((vehicle) => ({
          ...toVehicleResponse(vehicle, vehicle.routeId ? routes.get(vehicle.routeId) : undefined),
          provider_key: "transitland",
        })),
      meta: { total: vehicles.length, provider: "transitland" },
    };
  },
};

function getTransitlandApiKey(credentials: Record<string, string | null>) {
  const value = credentials.transit_api_key;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function requireTransitlandApiKey(credentials: Record<string, string | null>) {
  const apiKey = getTransitlandApiKey(credentials);
  if (!apiKey) throw missingCredentials("transitland", ["transit_api_key"]);
  return apiKey;
}
```

- [ ] **Step 4: Update realtime sync to accept an API key**

Modify `apps/map-server/src/services/realtime/gtfs-rt.ts` so `syncRealtimeFeeds` accepts `apiKey?: string` and passes it into `new TransitlandClient(apiKey)`. Keep existing callers working by making the field optional.

The changed function signature should be:

```ts
export async function syncRealtimeFeeds(input: {
  bbox?: Bbox;
  feedIds?: string[];
  timeoutMs: number;
  apiKey?: string;
}) {
  const transitland = new TransitlandClient(input.apiKey);
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: fix any type errors caused by exact existing row types, then pass.

- [ ] **Step 6: Commit**

```bash
git add apps/map-server/src/services/transitland/client.ts apps/map-server/src/services/realtime/gtfs-rt.ts apps/map-server/src/controllers/map/controller.ts apps/map-server/src/services/transport/transitland-adapter.ts
git commit -m "feat(map-server): wrap transitland as transport provider"
```

---

### Task 4: Simulator Provider

**Files:**
- Create: `apps/map-server/src/services/transport/simulator-adapter.ts`
- Create: `apps/map-server/src/services/transport/simulator-adapter.test.ts`
- Modify: `apps/map-server/src/services/transport/registry.ts`

- [ ] **Step 1: Write simulator adapter tests**

Create `apps/map-server/src/services/transport/simulator-adapter.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { simulatorAdapter } from "./simulator-adapter";

const context = {
  configUser: "test",
  credentials: {},
  log: console,
} as never;

describe("simulator transport adapter", () => {
  it("does not require credentials", async () => {
    await expect(simulatorAdapter.healthCheck(context)).resolves.toMatchObject({
      ok: true,
    });
    expect(simulatorAdapter.requiredCredentialKeys).toEqual([]);
  });

  it("returns normalized routes and stops", async () => {
    await expect(
      simulatorAdapter.findRoutes?.({
        feedOnestopId: "sim-feed",
        limit: 10,
      }),
    ).resolves.toMatchObject({
      routes: [
        {
          id: "sim-feed:route-blue",
          provider_key: "simulator",
          route_short_name: "BLUE",
        },
      ],
    });

    await expect(
      simulatorAdapter.findStops?.({
        feedOnestopId: "sim-feed",
        limit: 10,
      }),
    ).resolves.toMatchObject({
      stops: [
        {
          id: "sim-feed:stop-central",
          provider_key: "simulator",
          stop_name: "Central Station",
        },
      ],
    });
  });

  it("returns deterministic vehicles", async () => {
    await expect(simulatorAdapter.findVehicles?.({})).resolves.toMatchObject({
      vehicles: [
        {
          vehicle_id: "sim-vehicle-1",
          provider_key: "simulator",
          route_id: "sim-feed:route-blue",
        },
      ],
    });
  });
});
```

- [ ] **Step 2: Run simulator tests and verify they fail**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/simulator-adapter.test.ts
```

Expected: fail because `simulator-adapter.ts` does not exist.

- [ ] **Step 3: Implement simulator adapter**

Create `apps/map-server/src/services/transport/simulator-adapter.ts`:

```ts
import type { TransportProviderAdapter } from "@/services/transport/types";

const capturedAt = "2026-05-27T00:00:00.000Z";

export const simulatorAdapter: TransportProviderAdapter = {
  key: "simulator",
  displayName: "Simulator",
  kind: "simulator",
  capabilities: [
    "static_schedule",
    "realtime_vehicles",
    "trip_updates",
    "alerts",
    "departures",
  ],
  requiredCredentialKeys: [],

  async healthCheck() {
    return { ok: true };
  },

  async discoverStaticFeeds() {
    return {
      candidates: [
        {
          feed_lookup_key: "sim-feed",
          feed_onestop_id: "sim-feed",
          name: "Simulator Feed",
          spec: "GTFS",
          status: "current",
          is_strong_match: true,
          version: { sha1: "simulator", fetched_at: capturedAt },
          local: {
            exists: true,
            sha1: "simulator",
            fetched_at: capturedAt,
            last_static_sync: capturedAt,
            counts: { stops: 3, routes: 1, trips: 1, stopTimes: 3 },
          },
        },
      ],
      meta: { provider: "simulator", total: 1 },
    };
  },

  async syncStatic() {
    return {
      synced: [
        {
          feed_onestop_id: "sim-feed",
          sha1: "simulator",
          status: "skipped",
          duration_ms: 0,
          counts: { stops: 3, routes: 1, trips: 1, stopTimes: 3 },
        },
      ],
      errors: [],
    };
  },

  async syncRealtime() {
    return { synced: [{ feed_onestop_id: "sim-feed", vehicles: 1 }], errors: [] };
  },

  async findRoutes() {
    return {
      routes: [
        {
          id: "sim-feed:route-blue",
          provider_key: "simulator",
          feed_onestop_id: "sim-feed",
          route_id: "route-blue",
          agency_id: "sim-agency",
          route_short_name: "BLUE",
          route_long_name: "Central Loop",
          route_desc: null,
          route_type: 3,
          route_url: null,
          route_color: "246BFD",
          route_text_color: "FFFFFF",
          route_sort_order: 1,
          agency_name: "Simulator Transit",
        },
      ],
      meta: { total: 1, provider: "simulator", feed_onestop_id: "sim-feed" },
    };
  },

  async findStops() {
    return {
      stops: [
        {
          id: "sim-feed:stop-central",
          provider_key: "simulator",
          stop_id: "stop-central",
          stop_name: "Central Station",
          tts_stop_name: null,
          stop_desc: null,
          stop_code: "SIM1",
          stop_url: null,
          zone_id: null,
          parent_stop_id: null,
          stop_timezone: "UTC",
          platform_code: "1",
          level_id: null,
          stop_access: null,
          lat: 25.0478,
          lon: 121.517,
          location_type: 0,
          wheelchair_boarding: 1,
          feed_onestop_id: "sim-feed",
          alerts: [],
        },
      ],
      meta: { total: 1, provider: "simulator", feed_onestop_id: "sim-feed" },
    };
  },

  async findTrips() {
    return {
      trips: [
        {
          id: "sim-feed:trip-blue-1",
          provider_key: "simulator",
          trip_id: "trip-blue-1",
          route_id: "sim-feed:route-blue",
          service_id: "daily",
          shape_id: "shape-blue",
          trip_headsign: "Central Loop",
          trip_short_name: null,
          direction_id: 0,
          block_id: null,
          wheelchair_accessible: 1,
          bikes_allowed: 1,
          cars_allowed: null,
          safe_duration_factor: null,
          safe_duration_offset: null,
          first_departure_time: "08:00:00",
          last_departure_time: "08:20:00",
          matching_stop_times_count: 3,
        },
      ],
      meta: { total: 1, provider: "simulator" },
    };
  },

  async findRouteShape() {
    return {
      trip: { id: "sim-feed:trip-blue-1", trip_id: "trip-blue-1" },
      route: { id: "sim-feed:route-blue", provider_key: "simulator" },
      shape: {
        shape_id: "shape-blue",
        generated: false,
        geojson: {
          type: "LineString",
          coordinates: [
            [121.517, 25.0478],
            [121.525, 25.05],
          ],
        },
        points: [],
      },
    };
  },

  async findDepartures() {
    return {
      stop: { id: "sim-feed:stop-central", provider_key: "simulator" },
      departures: [
        {
          trip_id: "sim-feed:trip-blue-1",
          route_id: "sim-feed:route-blue",
          route_short_name: "BLUE",
          route_long_name: "Central Loop",
          route_color: "246BFD",
          route_type: 3,
          trip_headsign: "Central Loop",
          direction_id: 0,
          stop_sequence: 1,
          service_date: "2026-05-27",
          stop_id: "sim-feed:stop-central",
          scheduled_arrival: "08:00:00",
          scheduled_departure: "08:00:00",
          realtime_arrival_delay: 0,
          realtime_departure_delay: 0,
          estimated_departure: "08:00:00",
          schedule_relationship: "SCHEDULED",
          is_realtime: true,
        },
      ],
      alerts: [],
      meta: {
        date: "2026-05-27",
        start_time: "08:00:00",
        end_time: "09:00:00",
        realtime_available: true,
        provider: "simulator",
      },
    };
  },

  async findVehicles() {
    return {
      vehicles: [
        {
          vehicle_id: "sim-vehicle-1",
          provider_key: "simulator",
          vehicle_label: "Simulator 1",
          trip_id: "sim-feed:trip-blue-1",
          route_id: "sim-feed:route-blue",
          route_short_name: "BLUE",
          route_long_name: "Central Loop",
          route_color: "246BFD",
          route_type: 3,
          lat: 25.0478,
          lon: 121.517,
          bearing: 90,
          speed: 8,
          current_stop_sequence: 1,
          current_status: "IN_TRANSIT_TO",
          occupancy_status: "MANY_SEATS_AVAILABLE",
          captured_at: capturedAt,
        },
      ],
      meta: { total: 1, provider: "simulator" },
    };
  },
};
```

- [ ] **Step 4: Export the default registry**

Append to `apps/map-server/src/services/transport/registry.ts`:

```ts
import { simulatorAdapter } from "@/services/transport/simulator-adapter";
import { transitlandAdapter } from "@/services/transport/transitland-adapter";

export const transportProviderRegistry = createTransportProviderRegistry([
  transitlandAdapter,
  simulatorAdapter,
]);
```

Move these imports to the top of the file if lint requires import ordering.

- [ ] **Step 5: Run simulator and registry tests**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/transport/registry.test.ts src/services/transport/simulator-adapter.test.ts
```

Expected: pass.

- [ ] **Step 6: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add apps/map-server/src/services/transport
git commit -m "feat(map-server): add simulator transport provider"
```

---

### Task 5: Provider-Scoped Read Endpoints

**Files:**
- Create: `apps/map-server/src/controllers/transport/schema.ts`
- Create: `apps/map-server/src/controllers/transport/controller.ts`
- Modify: `apps/map-server/src/index.ts`

- [ ] **Step 1: Add transport route schemas**

Create `apps/map-server/src/controllers/transport/schema.ts`:

```ts
import { z } from "zod/v4";

import {
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
  mapVehiclesQuerySchema,
  staticFeedsStatusQuerySchema,
} from "@/controllers/map/schema";
import { departuresQuerySchema } from "@/controllers/stops/schema";
import { scopedIdSchema } from "@/lib/schemas";

export const providerParamsSchema = z.object({
  provider: z.string().min(1),
});

export const providerStopParamsSchema = z.object({
  provider: z.string().min(1),
  stopId: scopedIdSchema,
});

export {
  departuresQuerySchema,
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
  mapVehiclesQuerySchema,
  staticFeedsStatusQuerySchema,
};
```

- [ ] **Step 2: Add transport controller**

Create `apps/map-server/src/controllers/transport/controller.ts`:

```ts
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getActiveConfig, getConfigUserFromToken } from "@/services/config";
import { sendError } from "@/lib/api-error";
import {
  assertProviderCapability,
  transportProviderRegistry,
} from "@/services/transport/registry";
import type { ProviderContext } from "@/services/transport/types";

import {
  departuresQuerySchema,
  mapRouteShapeQuerySchema,
  mapRoutesQuerySchema,
  mapStopsQuerySchema,
  mapTripsQuerySchema,
  mapVehiclesQuerySchema,
  providerParamsSchema,
  providerStopParamsSchema,
  staticFeedsStatusQuerySchema,
} from "./schema";

export function registerTransportRoutes(app: FastifyInstance) {
  app.get("/api/transport/:provider/static-feeds/status", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = staticFeedsStatusQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "static_schedule");
      const response = await provider.discoverStaticFeeds?.(query, await buildProviderContext(app));
      return reply.send(response);
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/routes", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = mapRoutesQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "static_schedule");
      return reply.send(
        await provider.findRoutes?.({
          feedOnestopId: query.feed_onestop_id,
          routeType: query.route_type,
          limit: query.limit,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/stops", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = mapStopsQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "static_schedule");
      return reply.send(
        await provider.findStops?.({
          bbox: query.bbox,
          feedOnestopId: query.feed_onestop_id,
          includeAlerts: query.include_alerts,
          limit: query.limit,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/trips", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = mapTripsQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "static_schedule");
      return reply.send(
        await provider.findTrips?.({
          routeId: query.route_id,
          serviceDate: query.service_date,
          startTime: query.start_time,
          endTime: query.end_time,
          directionId: query.direction_id,
          limit: query.limit,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/route-shape", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = mapRouteShapeQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "static_schedule");
      return reply.send(
        await provider.findRouteShape?.({
          routeId: query.route_id,
          includeShape: query.include_shape,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/stops/:stopId/departures", async (request, reply) => {
    try {
      const params = providerStopParamsSchema.parse(request.params);
      const query = departuresQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "departures");
      return reply.send(
        await provider.findDepartures?.({
          stopId: params.stopId,
          date: query.date,
          startTime: query.start_time,
          endTime: query.end_time,
          includeRealtime: query.include_realtime,
          includeAlerts: query.include_alerts,
          limit: query.limit,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/transport/:provider/vehicles", async (request, reply) => {
    try {
      const params = providerParamsSchema.parse(request.params);
      const query = mapVehiclesQuerySchema.parse(request.query);
      const provider = transportProviderRegistry.get(params.provider);
      assertProviderCapability(provider, "realtime_vehicles");
      return reply.send(
        await provider.findVehicles?.({
          bbox: query.bbox,
          feedOnestopId: query.feed_onestop_id,
          routeType: query.route_type,
        }, await buildProviderContext(app)),
      );
    } catch (error) {
      return sendError(reply, error);
    }
  });
}

async function buildProviderContext(app: FastifyInstance): Promise<ProviderContext> {
  const active = await getActiveConfig(app.env.MAP_ADMIN_TOKEN).catch(() => ({
    user: getConfigUserFromToken(app.env.MAP_ADMIN_TOKEN),
    credentials: {},
  }));
  return {
    configUser: active.user,
    credentials: active.credentials as Record<string, string | null>,
    log: app.log,
  };
}
```

- [ ] **Step 3: Register transport routes**

Modify `apps/map-server/src/index.ts`:

```ts
import { registerTransportRoutes } from "@/controllers/transport/controller";
```

Add the route registration after `registerMapRoutes`:

```ts
await app.register(registerMapRoutes);
await app.register(registerTransportRoutes);
```

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass after correcting import order and optional adapter-method type narrowing.

- [ ] **Step 5: Smoke-test simulator endpoints**

Start the server:

```bash
PORT=4100 MAP_ADMIN_TOKEN=local.dev pnpm --filter @notion-kit/map-server dev
```

In another terminal:

```bash
curl -s 'http://127.0.0.1:4100/api/transport/simulator/routes?feed_onestop_id=sim-feed'
curl -s 'http://127.0.0.1:4100/api/transport/simulator/stops?feed_onestop_id=sim-feed'
curl -s 'http://127.0.0.1:4100/api/transport/simulator/vehicles'
```

Expected: JSON responses with `provider_key: "simulator"`.

- [ ] **Step 6: Commit**

```bash
git add apps/map-server/src/controllers/transport apps/map-server/src/index.ts
git commit -m "feat(map-server): add provider scoped transport reads"
```

---

### Task 6: Admin Config And Provider Sync Routes

**Files:**
- Create: `apps/map-server/src/controllers/admin-config/schema.ts`
- Create: `apps/map-server/src/controllers/admin-config/controller.ts`
- Modify: `apps/map-server/src/controllers/admin/controller.ts`
- Modify: `apps/map-server/src/index.ts`

- [ ] **Step 1: Add admin config schemas**

Create `apps/map-server/src/controllers/admin-config/schema.ts`:

```ts
import { z } from "zod/v4";

export const configUserParamsSchema = z.object({
  user: z.string().min(1),
});

export const patchCredentialsBodySchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1).nullable(),
});

export const upsertCredentialsBodySchema = z.object({
  credentials: z.record(z.string(), z.string().nullable()),
});
```

- [ ] **Step 2: Add admin config controller**

Create `apps/map-server/src/controllers/admin-config/controller.ts`:

```ts
import type { FastifyInstance } from "fastify";

import { sendError, unauthorized } from "@/lib/api-error";
import {
  getActiveConfig,
  getConfigForUser,
  getConfigUserFromToken,
  patchCredential,
  redactCredentials,
  upsertCredentials,
} from "@/services/config";

import {
  configUserParamsSchema,
  patchCredentialsBodySchema,
  upsertCredentialsBodySchema,
} from "./schema";

export function registerAdminConfigRoutes(app: FastifyInstance) {
  app.get("/api/admin/config", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const row = await getActiveConfig(app.env.MAP_ADMIN_TOKEN);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials as Record<string, string | null>),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.get("/api/admin/config/:user", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const row = await getConfigForUser(params.user);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials as Record<string, string | null>),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.put("/api/admin/config/:user/credentials", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const body = upsertCredentialsBodySchema.parse(request.body ?? {});
      const row = await upsertCredentials(params.user, body.credentials);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials as Record<string, string | null>),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });

  app.patch("/api/admin/config/:user/credentials", async (request, reply) => {
    try {
      assertAdmin(app, request);
      const params = configUserParamsSchema.parse(request.params);
      const body = patchCredentialsBodySchema.parse(request.body ?? {});
      const row = await patchCredential(params.user, body.key, body.value);
      return reply.send({
        user: row.user,
        credentials: redactCredentials(row.credentials as Record<string, string | null>),
      });
    } catch (error) {
      return sendError(reply, error);
    }
  });
}

function assertAdmin(app: FastifyInstance, request: FastifyRequest) {
  if (!app.env.MAP_ADMIN_TOKEN) return;
  const header = request.headers.authorization;
  if (header !== `Bearer ${app.env.MAP_ADMIN_TOKEN}`) {
    throw unauthorized();
  }
}
```

- [ ] **Step 3: Register admin config routes**

Modify `apps/map-server/src/index.ts`:

```ts
import { registerAdminConfigRoutes } from "@/controllers/admin-config/controller";
```

Register before `registerAdminRoutes`:

```ts
await app.register(registerAdminConfigRoutes);
await app.register(registerAdminRoutes);
```

- [ ] **Step 4: Add provider sync and validate routes**

Modify `apps/map-server/src/controllers/admin/controller.ts` by importing provider registry/context helpers and adding routes inside `registerAdminRoutes`:

```ts
import { getActiveConfig, getConfigUserFromToken } from "@/services/config";
import {
  assertProviderCapability,
  transportProviderRegistry,
} from "@/services/transport/registry";
import type { ProviderContext } from "@/services/transport/types";
```

Add routes before the legacy `/api/admin/sync/static` route:

```ts
app.post("/api/admin/transport/:provider/validate", async (request, reply) => {
  try {
    assertAdmin(app, request);
    const { provider: providerKey } = (request.params ?? {}) as { provider: string };
    const provider = transportProviderRegistry.get(providerKey);
    return reply.send(await provider.healthCheck(await buildProviderContext(app)));
  } catch (error) {
    return sendError(reply, error);
  }
});

app.post("/api/admin/transport/:provider/sync/static", async (request, reply) => {
  try {
    assertAdmin(app, request);
    const { provider: providerKey } = (request.params ?? {}) as { provider: string };
    const provider = transportProviderRegistry.get(providerKey);
    assertProviderCapability(provider, "static_schedule");
    const body = staticSyncBodySchema.parse(request.body ?? {});
    return reply.send(await provider.syncStatic?.(body, await buildProviderContext(app)));
  } catch (error) {
    return sendError(reply, error);
  }
});

app.post("/api/admin/transport/:provider/sync/realtime", async (request, reply) => {
  try {
    assertAdmin(app, request);
    const { provider: providerKey } = (request.params ?? {}) as { provider: string };
    const provider = transportProviderRegistry.get(providerKey);
    assertProviderCapability(provider, "realtime_vehicles");
    const body = realtimeSyncBodySchema.parse(request.body ?? {});
    const response = await provider.syncRealtime?.(body, await buildProviderContext(app));
    app.wsHub.broadcastVehicles().catch((error: unknown) => {
      app.log.error(error, "Failed to broadcast realtime vehicles");
    });
    return reply.send(response);
  } catch (error) {
    return sendError(reply, error);
  }
});
```

Add helper near the bottom of the file:

```ts
async function buildProviderContext(app: FastifyInstance): Promise<ProviderContext> {
  const active = await getActiveConfig(app.env.MAP_ADMIN_TOKEN).catch(() => ({
    user: getConfigUserFromToken(app.env.MAP_ADMIN_TOKEN),
    credentials: {},
  }));
  return {
    configUser: active.user,
    credentials: active.credentials as Record<string, string | null>,
    log: app.log,
  };
}
```

- [ ] **Step 5: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass.

- [ ] **Step 6: Smoke-test admin simulator validate**

Start the server:

```bash
PORT=4100 MAP_ADMIN_TOKEN=local.dev pnpm --filter @notion-kit/map-server dev
```

Run:

```bash
curl -s -X POST 'http://127.0.0.1:4100/api/admin/transport/simulator/validate' -H 'Authorization: Bearer local.dev'
```

Expected:

```json
{"ok":true}
```

- [ ] **Step 7: Commit**

```bash
git add apps/map-server/src/controllers/admin-config apps/map-server/src/controllers/admin/controller.ts apps/map-server/src/index.ts
git commit -m "feat(map-server): add transport admin routes"
```

---

### Task 7: OpenAPI And Documentation Rewrite

**Files:**
- Modify: `apps/map-server/src/openapi.ts`
- Modify: `apps/map-server/src/index.ts`
- Modify: `apps/map-server/docs/data-sources.md`

- [ ] **Step 1: Add OpenAPI tags**

In `apps/map-server/src/index.ts`, add tags in the Swagger registration:

```ts
{
  name: "Transport",
  description: "Provider-scoped normalized transportation APIs.",
},
{
  name: "Admin / Config",
  description: "Shared provider credential configuration.",
},
```

- [ ] **Step 2: Add route schemas to OpenAPI**

In `apps/map-server/src/openapi.ts`, add lightweight schema entries for provider routes. Keep them simple by reusing the existing response examples and `standardErrors`.

Add entries inside `openApi`:

```ts
transportRoutes: {
  tags: ["Transport"],
  summary: "List normalized routes for a transport provider",
  params: {
    type: "object",
    required: ["provider"],
    properties: { provider: { type: "string", example: "simulator" } },
  },
  querystring: {
    type: "object",
    required: ["feed_onestop_id"],
    properties: {
      feed_onestop_id: { type: "string", example: examples.feedOnestopId },
      route_type: { type: "integer", example: 3 },
      limit: { type: "integer", example: 200 },
    },
  },
  response: { ...standardErrors },
},
transportStops: {
  tags: ["Transport"],
  summary: "List normalized stops for a transport provider",
  params: {
    type: "object",
    required: ["provider"],
    properties: { provider: { type: "string", example: "simulator" } },
  },
  response: { ...standardErrors },
},
adminConfig: {
  tags: ["Admin / Config"],
  summary: "Read active shared provider config status",
  security: [{ adminBearer: [] }],
  response: {
    200: {
      type: "object",
      properties: {
        user: { type: "string", example: "local" },
        credentials: { type: "object", additionalProperties: true },
      },
    },
    ...standardErrors,
  },
},
```

Attach these schemas to the new routes in `controllers/transport/controller.ts` and `controllers/admin-config/controller.ts` where practical. If a route already has no schema, add at least the route groups that appear in the API reference first: routes, stops, vehicles, config, and provider validate.

- [ ] **Step 3: Rewrite data-sources.md**

Replace `apps/map-server/docs/data-sources.md` with:

```md
# Transport data sources

## Goal

Support multiple transportation data providers while returning normalized map-server schemas to the frontend. The first architecture phase focuses on GTFS-compatible data sources.

## Scope

V1 covers Transitland feeds, Transitland REST, country-specific transit APIs that can be mapped into GTFS-compatible concepts, and a simulator provider.

## Non-goals

V1 does not cover weather, ports as infrastructure, lighthouses, static GeoJSON infrastructure, or airport area overlays. Flight APIs are transportation sources, but flight schemas are deferred until the ground-transit provider architecture is stable.

## Current state

The server currently imports Transitland GTFS static feeds, syncs Transitland GTFS-RT realtime data, and serves cached map responses through `/api/map/...`.

Static and realtime sync are intentionally separate. Read endpoints do not import static GTFS rows as a side effect.

## Target architecture

Transport providers are implemented as adapters. Each adapter declares supported capabilities and maps upstream provider responses into normalized map-server DTOs.

V1 capabilities are:

- `static_schedule`
- `realtime_vehicles`
- `trip_updates`
- `alerts`
- `departures`

## Shared config table

Provider credentials live in the shared database `config` table:

```ts
config {
  user: string;
  credentials: jsonb;
}
```

`MAP_ADMIN_TOKEN` selects the active config user by token prefix. For example, `local.secret` reads the `local` config row.

## Provider-scoped endpoints

Provider-scoped endpoints make source selection explicit while preserving normalized responses:

```txt
GET /api/transport/:provider/static-feeds/status
GET /api/transport/:provider/routes
GET /api/transport/:provider/stops
GET /api/transport/:provider/route-shape
GET /api/transport/:provider/trips
GET /api/transport/:provider/stops/:stopId/departures
GET /api/transport/:provider/vehicles

POST /api/admin/transport/:provider/sync/static
POST /api/admin/transport/:provider/sync/realtime
POST /api/admin/transport/:provider/validate
```

## Roadmap

1. Add shared config storage and admin config APIs.
2. Wrap current Transitland behavior in a provider adapter.
3. Add provider-scoped transport endpoints.
4. Add a deterministic simulator provider for local development and E2E tests.
5. Add Transitland REST reads where direct API usage is better than local import.
6. Add country API adapters one at a time.
7. Design flight-specific normalized entities separately.

## Candidate country APIs

- Korea: https://www.data.go.kr/en/data/15143841/openapi.do
- Japan: https://www.odpt.org/en/overview/
- Taiwan: https://tdx.transportdata.tw/api-service/swagger

## Deferred map layers

- Airports as infrastructure areas.
- Lighthouses.
- Ports as infrastructure.
- Weather.
- Generic GeoJSON overlays.
```

- [ ] **Step 4: Run docs/type checks**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
pnpm --filter @notion-kit/map-server format
```

Expected: typecheck passes. Format may ignore Markdown by project config; if it reports formatting issues in TypeScript files, run the repo's formatter command or fix manually.

- [ ] **Step 5: Commit**

```bash
git add apps/map-server/src/openapi.ts apps/map-server/src/index.ts apps/map-server/docs/data-sources.md
git commit -m "docs(map-server): document transport data sources"
```

---

### Task 8: Final Verification And Cleanup

**Files:**
- Review all files changed by Tasks 1-7.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm --filter @notion-kit/map-server test src/services/config.test.ts src/services/transport/registry.test.ts src/services/transport/simulator-adapter.test.ts
```

Expected: pass.

- [ ] **Step 2: Run full map-server test suite**

Run:

```bash
pnpm --filter @notion-kit/map-server test
```

Expected: pass.

- [ ] **Step 3: Run typecheck**

Run:

```bash
pnpm --filter @notion-kit/map-server typecheck
```

Expected: pass.

- [ ] **Step 4: Run build**

Run:

```bash
pnpm --filter @notion-kit/map-server build
```

Expected: pass.

- [ ] **Step 5: Verify git state**

Run:

```bash
git status --short
```

Expected: only intentional user-owned files remain uncommitted. If `apps/map-server/docs/data-sources.md` was originally untracked by the user and Task 7 adopted it, it should now be tracked in the implementation branch.

- [ ] **Step 6: Commit final fixes if needed**

When verification requires fixes, commit them:

```bash
git add apps/map-server
git commit -m "fix(map-server): stabilize transport provider foundation"
```

When no fixes are needed, do not create an empty commit.
