# Transport Data Sources Design

## Goal

Design a shared transportation data-source architecture for `apps/map-server` that lets the frontend consume normalized transportation data across multiple upstream providers. The first implementation phase focuses on GTFS-compatible providers while reserving room for future transportation families such as flights.

The design also provides the structure for rewriting `apps/map-server/docs/data-sources.md` from a loose TODO list into a prioritized roadmap.

## Scope

V1 covers transportation data sources that can be represented with GTFS-compatible concepts:

- Transitland static GTFS feed import, which is the current implementation.
- Transitland REST-backed reads, where direct API usage can reduce local parsing or storage.
- Country-specific transit APIs such as TDX, BKK, Korea, or Japan APIs, when their responses can be normalized into GTFS-like entities.
- A simulator provider for local development, demos, and frontend E2E tests.

The normalized V1 model covers feeds or sources, agencies, stops, routes, trips, stop times, calendar data, shapes, realtime vehicles, trip updates, alerts, and departures.

## Non-goals

V1 does not design or implement non-transport map layers such as weather, ports as infrastructure, lighthouses, GeoJSON areas, or static infrastructure overlays. Those can use a similar registry pattern later, but they should not complicate the transportation contracts now.

V1 also does not implement flight schemas. Flights are transportation data sources, but they are likely to need their own canonical entities instead of being forced into GTFS shapes. The registry and endpoint naming should leave room for a future flight adapter family.

## Current State

The map server currently has a Transitland-first architecture:

- Static GTFS sync imports Transitland feeds into local GTFS tables through `/api/admin/sync/static`.
- Realtime GTFS-RT sync is separate and writes snapshot tables through `/api/admin/sync/realtime`.
- Read endpoints under `/api/map/...` return stops, routes, trips, route shapes, departures, vehicles, and static-feed status.
- Static reads are intentionally read-only. Layer toggles and list reads do not import GTFS as a side effect.
- Static sync has explicit result states: `imported`, `updated`, `skipped`, `partial`, and `error`.

Those decisions should be preserved. The next architecture layer should make Transitland one provider adapter rather than the architectural center.

## Target Architecture

Introduce a transport provider adapter boundary inside `map-server`.

Each provider adapter is responsible for calling one upstream source family, interpreting provider-specific configuration, and translating upstream data into normalized map-server entities. Controllers and frontend-facing APIs should depend on provider capabilities, not on Transitland-specific code.

Provider capabilities should include:

- `static_schedule`
- `realtime_vehicles`
- `trip_updates`
- `alerts`
- `departures`

Not every provider supports every capability. Missing capabilities should return a typed unsupported-capability error instead of fake data.

The first concrete adapter should wrap the current Transitland feed implementation with minimal behavior changes. Later adapters can cover simulator data, Transitland REST, and country-specific APIs.

## Shared Config Table

Use a shared database table named `config` as the single credential source for all runtimes:

```ts
config {
  user: string;        // primary key: "admin", "local", "ci", "production", etc.
  credentials: jsonb;  // { transit_api_key, bkk_api_key, tdx_api_key, ... }
}
```

`MAP_ADMIN_TOKEN` is the only required bootstrap environment value. It identifies both the authenticated runtime and the `config.user` row the server may read by convention. For V1, use a token format such as `<config-user>.<secret>`, where the prefix before the first dot selects the config user and the full token remains the admin secret. For example, local development can use a token prefixed with `local`, CI can use `ci`, and production can use `production`, while all rows live in the same shared database table.

Provider credentials must not be duplicated into local, CI, or Vercel environment variables. Those environments only need their own `MAP_ADMIN_TOKEN`, which selects the appropriate shared config row.

Provider adapters read only the credential keys they require from the active config row:

- Transitland uses `transit_api_key`.
- Taiwan TDX uses `tdx_api_key`.
- BKK uses `bkk_api_key`.
- The simulator uses no credential.

Admin APIs should manage this table:

- Get the active config status.
- Upsert credentials for a config user.
- Patch one credential key.
- Remove one credential key.
- Validate provider credentials through adapter health checks.

Admin responses should not return raw secret values by default. They should return credential key presence, last validation status, and validation errors when available.

## Provider Adapter Interface

Each adapter should declare its identity, supported capabilities, required credential keys, and callable operations. A TypeScript shape like this is sufficient for V1:

```ts
interface TransportProviderAdapter {
  key: string;
  displayName: string;
  kind: "gtfs" | "gtfs_rest" | "country_api" | "simulator" | "flight_reserved";
  capabilities: TransportCapability[];
  requiredCredentialKeys: string[];

  healthCheck(context: ProviderContext): Promise<ProviderHealth>;
  discoverStaticFeeds?(
    input: StaticFeedDiscoveryInput,
    context: ProviderContext,
  ): Promise<StaticFeedStatusCandidate[]>;
  syncStatic?(
    input: StaticSyncInput,
    context: ProviderContext,
  ): Promise<StaticSyncResponse>;
  syncRealtime?(
    input: RealtimeSyncInput,
    context: ProviderContext,
  ): Promise<RealtimeSyncResponse>;
  findStops?(
    input: StopQuery,
    context: ProviderContext,
  ): Promise<NormalizedStopResponse>;
  findRoutes?(
    input: RouteQuery,
    context: ProviderContext,
  ): Promise<NormalizedRouteResponse>;
  findTrips?(
    input: TripQuery,
    context: ProviderContext,
  ): Promise<NormalizedTripResponse>;
  findDepartures?(
    input: DepartureQuery,
    context: ProviderContext,
  ): Promise<NormalizedDepartureResponse>;
  findVehicles?(
    input: VehicleQuery,
    context: ProviderContext,
  ): Promise<NormalizedVehicleResponse>;
}
```

`ProviderContext` should include the active config user, resolved credentials, runtime metadata, logger, and repository/cache helpers.

## Normalized GTFS-Compatible Model

V1 should normalize GTFS-compatible providers into the internal concepts already used by the map server:

- Feed or source metadata.
- Agency.
- Stop.
- Route.
- Trip.
- Stop time.
- Calendar and calendar-date service data.
- Shape.
- Realtime vehicle position.
- Trip update.
- Alert.
- Departure.

Provider adapters may fetch data differently, but provider-scoped endpoints should return the same DTO shape for equivalent resources. Country-specific APIs may not provide every GTFS field, so normalized DTOs should allow nullable provider-missing fields when the map can still behave correctly.

Every normalized record should carry source metadata where useful:

- `provider_key`
- Source feed or source id.
- Upstream version, hash, or fetched timestamp when available.
- Optional provider metadata for diagnostics.

The frontend should not need provider-specific response parsing for V1 transport features.

## Provider-Scoped Endpoints

Add explicit provider-scoped endpoints while keeping existing aggregate `/api/map/...` endpoints during migration.

Recommended V1 read endpoints:

```txt
GET /api/transport/:provider/static-feeds/status
GET /api/transport/:provider/routes
GET /api/transport/:provider/stops
GET /api/transport/:provider/route-shape
GET /api/transport/:provider/trips
GET /api/transport/:provider/departures
GET /api/transport/:provider/vehicles
```

Recommended V1 admin endpoints:

```txt
POST /api/admin/transport/:provider/sync/static
POST /api/admin/transport/:provider/sync/realtime
GET /api/admin/config
PATCH /api/admin/config/:user/credentials
POST /api/admin/transport/:provider/validate
```

`:provider` is a stable adapter key such as `transitland`, `transitland-rest`, `tdx`, `bkk`, or `simulator`.

These endpoints return normalized map-server schemas, not raw upstream payloads. Existing `/api/map/...` endpoints can continue as aggregate or default-provider endpoints and can gradually delegate to provider adapters.

## Data Flow And Sync Semantics

Provider-scoped read endpoints are read-only by default. They should not import large datasets as a side effect. If cached static data is missing or stale, they return normalized empty or partial results plus metadata that tells the frontend whether a sync is needed.

The request flow is:

```txt
request
  -> resolve active config user
  -> load credentials from config.credentials
  -> resolve provider adapter
  -> validate provider capability
  -> discover, sync, or read
  -> normalize
  -> read/write repository or cache as needed
  -> return normalized response
```

Static sync should preserve current result semantics: `imported`, `updated`, `skipped`, `partial`, and `error`.

Realtime sync remains separate from static sync. Static sync must not poll GTFS-RT vehicles, and realtime sync must not import static GTFS rows.

The simulator provider implements the same interfaces but generates deterministic normalized data without external credentials. Frontend E2E tests can use `/api/transport/simulator/...` without live Transitland or country API access.

## Storage Strategy

Keep the existing GTFS tables as canonical V1 storage for normalized GTFS-compatible static data. Add source metadata only where implementation needs it, such as provider key, source id or feed id, upstream version/hash, fetched/synced timestamps, and optional provider metadata.

Do not introduce a completely separate normalized storage schema until a second real provider proves which extra columns or tables are necessary.

## Error Handling

Provider-scoped endpoints should expose clear typed errors:

- `provider_not_found`
- `provider_disabled`
- `missing_credentials`
- `unsupported_capability`
- `upstream_unavailable`
- `sync_in_progress`
- `partial_data`
- `stale_data`

The frontend should be able to distinguish "provider is not configured" from "provider is configured but upstream failed" and from "data exists but needs sync."

## Migration Plan

Implement the architecture incrementally:

1. Add the `config` table and admin config APIs.
2. Add the adapter interface and a Transitland adapter wrapper around existing code.
3. Add provider-scoped endpoints that call the Transitland adapter.
4. Keep existing `/api/map/...` and `/api/admin/sync/...` routes working.
5. Add the simulator adapter.
6. Rewrite frontend and E2E flows to use provider-scoped endpoints where explicit source control helps.
7. Add Transitland REST only where direct reads are better than local parsing/storage.
8. Add country API adapters one by one.
9. Later, decide whether `/api/map/...` should aggregate multiple providers.

## Testing Strategy

Add focused coverage at three levels:

- Adapter contract tests that map fixture inputs into normalized outputs.
- Endpoint tests proving provider-scoped routes return the same DTO shape across Transitland and simulator.
- Config tests proving credentials are read from the DB, secrets are not returned by default, and missing credentials produce clear errors.

The simulator provider should become the default E2E-friendly provider because it removes live API and quota dependency from frontend tests.

## Documentation Roadmap

Rewrite `apps/map-server/docs/data-sources.md` around the approved architecture:

```txt
# Transport data sources
## Goal
## Scope
## Non-goals
## Current state
## Target architecture
## Shared config table
## Provider adapters
## Normalized GTFS-compatible model
## Provider-scoped endpoints
## Sync semantics
## Roadmap
## Deferred work
```

The rewritten document should keep the useful upstream API references from the current draft, but separate transportation providers from non-transport map layers.

## Deferred Work

Deferred transportation work:

- Flight provider schemas and endpoints.
- Multi-provider aggregation rules for `/api/map/...`.
- Historical static GTFS versioning for replay.
- Production job semantics for very large static imports.

Deferred non-transport map-layer work:

- Weather.
- Ports as infrastructure layers.
- Lighthouses.
- Airports as static infrastructure areas.
- Generic GeoJSON overlays.
