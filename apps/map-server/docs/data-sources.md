# Transport data sources

## Goal

Support multiple transportation data providers while returning normalized map-server schemas to the frontend. The first architecture phase focuses on GTFS-compatible data sources.

## Scope

V1 covers Transitland feeds, Transitland REST, country-specific transit APIs that can be mapped into GTFS-compatible concepts, and a simulator provider.

## Non-goals

V1 does not cover weather, ports as infrastructure, lighthouses, static GeoJSON infrastructure, or airport area overlays. Flight APIs are transportation sources, but flight schemas are deferred until the ground-transit provider architecture is stable.

## Current state

The server exposes concrete, provider-scoped transportation read and sync endpoints for both the `transit` (Transitland-backed) and `simulator` providers. Read endpoints call into normalized provider adapters under the hood.

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
  admin_token: string;
  credentials: jsonb;
}
```

`MAP_ADMIN_TOKEN` selects the active config by matching the token exactly. For example, `local.secret` reads the `local.secret` config row. If unset, it defaults to `admin`.

## Provider-scoped endpoints

Concrete provider-scoped endpoints make source selection explicit while preserving normalized responses:

```txt
GET /api/transport/transit/static-feeds/status
GET /api/transport/transit/routes
GET /api/transport/transit/stops
GET /api/transport/transit/route-shape
GET /api/transport/transit/trips
GET /api/transport/transit/stops/:stopId/departures
GET /api/transport/transit/vehicles
GET /api/transport/transit/trips/:tripId/route
GET /api/transport/transit/trips/:tripId/stop-times

GET /api/transport/simulator/static-feeds/status
GET /api/transport/simulator/routes
GET /api/transport/simulator/stops
GET /api/transport/simulator/route-shape
GET /api/transport/simulator/trips
GET /api/transport/simulator/stops/:stopId/departures
GET /api/transport/simulator/vehicles
GET /api/transport/simulator/trips/:tripId/route
GET /api/transport/simulator/trips/:tripId/stop-times

POST /api/admin/transport/transit/sync/static
POST /api/admin/transport/transit/sync/realtime
POST /api/admin/transport/transit/validate

POST /api/admin/transport/simulator/sync/static
POST /api/admin/transport/simulator/sync/realtime
POST /api/admin/transport/simulator/validate
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
