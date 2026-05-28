# Transport Provider Cleanup Design

## Goal

Finish the migration from Transitland-first map APIs to provider-scoped transport APIs that are clear in code, correct in OpenAPI, and complete enough for `apps/globe` to switch between the Transitland-backed provider and the simulator provider without special cases.

## Scope

This design covers four related fixes:

- Make `MAP_ADMIN_TOKEN` the exact key used to select the active config row.
- Remove legacy Transitland-default map and sync endpoints when `apps/globe` no longer uses them.
- Expose concrete provider paths in OpenAPI, grouped by provider.
- Complete provider-scoped trip detail and simulator behavior for `apps/globe`.

## Non-Goals

This design does not add new external transit providers. It does not redesign GTFS import storage, replay storage, WebSocket behavior, or the visual UI of `apps/globe` beyond the URL changes needed to consume provider-scoped APIs.

## Config Identity

The `config` table should identify rows by admin token, not by a parsed user prefix. Rename the row identity from `config.user` to `config.admin_token`, and store the exact same secret value as `env.MAP_ADMIN_TOKEN`.

`getActiveConfig(adminToken)` should query `config.admin_token === adminToken`. The existing behavior where `local.secret` selects row `local` should be removed. A missing token can still fall back to a local development identity if the server supports unauthenticated local mode, but a configured token must use exact matching.

Admin config code and docs should stop presenting this value as a user. Responses should not echo raw secrets unless a specific endpoint is intentionally managing a named row. Normal status responses should focus on redacted credential presence.

## Transitland Credential Flow

Transitland API credentials should come from `config.credentials.transit_api_key`. Since `TransitlandClient` now requires an explicit API key, every caller must receive that key through provider context or be removed.

The preferred architecture is a single Transitland-backed provider path. Legacy endpoints should not instantiate `TransitlandClient` directly. Missing `transit_api_key` should return the typed missing-credentials error from the provider adapter.

## Legacy Endpoint Removal

If no non-globe consumer is being preserved, stop registering and documenting these legacy endpoints:

```txt
GET /api/map/static-feeds/status
GET /api/map/routes
GET /api/map/stops
GET /api/map/trips
GET /api/map/route-shape
GET /api/map/vehicles

POST /api/admin/sync/static
POST /api/admin/sync/realtime
```

Shared builder functions may remain if provider adapters still reuse them. The public API surface and OpenAPI reference should favor provider-scoped routes only.

Docs that still describe `/api/map/...` or `/api/admin/sync/...` flows should be updated to provider-scoped equivalents.

## Provider Routing And OpenAPI

The transport controller should expose concrete provider paths while preserving shared adapter dispatch internally. The primary public provider slugs are:

- `transit`, backed by the existing Transitland adapter.
- `simulator`, backed by the deterministic simulator adapter.

OpenAPI should show provider-specific paths and tags, for example:

```txt
Transport / Transit
GET /api/transport/transit/static-feeds/status
GET /api/transport/transit/routes
GET /api/transport/transit/stops
GET /api/transport/transit/trips
GET /api/transport/transit/route-shape
GET /api/transport/transit/stops/{stopId}/departures
GET /api/transport/transit/vehicles
GET /api/transport/transit/trips/{tripId}/route
GET /api/transport/transit/trips/{tripId}/stop-times

Transport / Simulator
GET /api/transport/simulator/static-feeds/status
GET /api/transport/simulator/routes
GET /api/transport/simulator/stops
GET /api/transport/simulator/trips
GET /api/transport/simulator/route-shape
GET /api/transport/simulator/stops/{stopId}/departures
GET /api/transport/simulator/vehicles
GET /api/transport/simulator/trips/{tripId}/route
GET /api/transport/simulator/trips/{tripId}/stop-times

Admin / Transport / Transit
POST /api/admin/transport/transit/validate
POST /api/admin/transport/transit/sync/static
POST /api/admin/transport/transit/sync/realtime

Admin / Transport / Simulator
POST /api/admin/transport/simulator/validate
POST /api/admin/transport/simulator/sync/static
POST /api/admin/transport/simulator/sync/realtime
```

The generic `:provider` controller helper can still exist internally, but `/api/transport/{provider}` should not be the primary docs surface.

## Provider-Scoped Trip Details

Replace the unscoped Transitland trip detail routes with provider-scoped equivalents:

```txt
GET /api/transport/transit/trips/:tripId/route
GET /api/transport/transit/trips/:tripId/stop-times
GET /api/transport/simulator/trips/:tripId/route
GET /api/transport/simulator/trips/:tripId/stop-times
```

These routes should return the same response shapes currently consumed by `apps/globe` from `/api/trips/:tripId/route` and `/api/trips/:tripId/stop-times`.

The Transitland adapter can reuse the current repository-backed implementation, including fallback route behavior when a realtime trip id does not exist in static GTFS tables. The simulator adapter should return its deterministic route, shape, empty alerts array, and stop times for its simulator trip.

After `apps/globe` uses these provider-scoped routes, stop registering and documenting the unscoped `/api/trips/:tripId/route` and `/api/trips/:tripId/stop-times` endpoints unless another repo consumer is intentionally preserved.

## Simulator Completeness

The simulator adapter should behave like a tiny complete GTFS-compatible provider for `apps/globe`.

It should provide:

- One static feed.
- One route.
- At least one trip.
- Multiple stops.
- A route shape.
- Stop times for the simulator trip.
- Departures.
- At least one realtime vehicle.

The frontend should be able to select Simulator, load the simulator feed, search/select the route, see the route line, see stops for the selected route or trip, inspect trip stop-times, and see vehicles when the map viewport includes the simulator coordinates.

The implementation should fix contract mismatches at the provider/API boundary instead of adding simulator-only UI behavior. IDs should remain internally consistent across feed, route, trip, stop, shape, departure, and vehicle responses.

## Frontend Migration

`apps/globe` should build all map-server transport URLs through provider-aware helpers. Transitland-specific hooks can keep their filenames initially, but calls should use the selected provider for:

- Static feed status.
- Static sync.
- Routes.
- Stops.
- Trips.
- Route shape.
- Trip route details.
- Trip stop-times.
- Stop departures.
- Vehicles.

The public provider id exposed to the frontend should be `transit` rather than `transitland` once the API slug migration is made. Any internal compatibility alias from `transitland` to `transit` should be temporary and should not appear as the preferred OpenAPI path.

## Testing

Add or update focused tests for:

- Config lookup uses exact `MAP_ADMIN_TOKEN` matching against `config.admin_token`.
- Transitland adapter reports missing credentials when `transit_api_key` is absent.
- No no-argument `new TransitlandClient()` call remains.
- Simulator adapter returns stops, vehicles, route shape, trip route details, trip stop-times, and departures.
- Provider-scoped transport routes dispatch `transit` and `simulator` correctly.
- OpenAPI groups concrete provider endpoints under provider-specific tags.
- `apps/globe` URL helpers point to provider-scoped endpoints for trip route and stop-times.

## Rollout

Implement the migration in small steps:

1. Rename config identity and update config docs/tests.
2. Fix remaining Transitland credential consumers.
3. Add provider aliasing and concrete provider route registration.
4. Add provider-scoped trip detail methods and simulator responses.
5. Move `apps/globe` off unscoped trip detail routes.
6. Remove legacy route registration and OpenAPI entries.
7. Update docs and run targeted map-server and globe checks.
