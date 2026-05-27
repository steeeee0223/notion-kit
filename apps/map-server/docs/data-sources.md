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
