# Specification: Simulator Provider Parameter Validation Fix & E2E Testing

## Goal

Resolve the `500 Internal Server Error` (validation errors/error serialization failures) on the concrete transport provider endpoints (`routes`, `stops`, `vehicles`, and admin `validate`), and introduce automated E2E integration tests using Fastify `inject()` to guarantee stability.

---

## 1. Context & Problem Statement

The map-server registers endpoints using provider-specific tags under:
- `/api/transport/simulator/stops`
- `/api/transport/simulator/routes`
- `/api/transport/simulator/vehicles`
- `/api/admin/transport/simulator/validate`

Because these routes have hardcoded provider names in their paths (e.g. `simulator`), they do not receive a dynamic `:provider` path parameter. However, `openapi.ts` retains `required: ["provider"]` inside the schemas' `params` configuration for these routes. This causes Fastify parameter validation to fail because the request has no dynamic provider parameter, returning a `500 Internal Server Error` to the client.

---

## 2. Proposed Changes

### [map-server]

#### [MODIFY] [openapi.ts](file:///Users/steven.yu/Documents/notion-kit/apps/map-server/src/openapi.ts)
* Update `withProviderTag` and `withAdminProviderTag` to destructure `params` off the original schema.
* Completely exclude the `params` property from the generated endpoint schema if all parameters are stripped (i.e. if only `provider` existed in the properties).

#### [NEW] [routes.test.ts](file:///Users/steven.yu/Documents/notion-kit/apps/map-server/src/routes.test.ts)
* Bootstrap Fastify instance with a mocked DB connection.
* Add E2E tests using `app.inject()` calling:
  - `GET /api/transport/simulator/stops`
  - `GET /api/transport/simulator/routes`
  - `GET /api/transport/simulator/vehicles`
  - `POST /api/admin/transport/simulator/validate` (with correct authorization headers)
* Assert status code `200` and inspect returned response properties.

---

## 3. Verification Plan

### Automated Tests
* Run `pnpm test` in the `apps/map-server` package to verify all unit tests and new integration/E2E tests pass successfully.
* Run `pnpm typecheck` to verify no TypeScript compilation issues.

### Manual Verification
* Start the dev server (`pnpm -F map-server dev`) and curl the endpoints to verify `200 OK` status and correct JSON body structure.
