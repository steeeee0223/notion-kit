# Unified Transit API Architecture

The `map-api` service provides a unified transit API that abstracts multiple underlying transit data providers (e.g., local BKK FUTAR and global Transitland APIs) into a single, standardized frontend-facing interface.

This documentation outlines the architectural patterns and endpoint structures used to maintain consistency across various transit providers.

## Core Design Principles

1. **Standardized Resource Paths**: Endpoints must follow a uniform RESTful path structure regardless of the underlying provider.
2. **Standardized Parameters**: Query and path parameters should share the same naming conventions. Provider-specific concepts (like Transitland's `operator_onestop_id`) are mapped to generalized parameter names (like `operatorId`).
3. **Unified Data Models**: The API transforms provider-specific schemas (e.g., GTFS Realtime feeds, proprietary BKK JSON) into generic, TypeScript-defined shapes for the frontend (`VehiclePosition`, `RouteShape`, `RouteStop`, `StopDeparture`).

## Endpoint Structure

All transit endpoints follow the base pattern:
`/api/transit/[provider]/[resource]`

### 1. Route Shapes

Retrieves the geographic path (GeoJSON coordinates) for a given route.

**Endpoint:** `GET /api/transit/[provider]/route-shapes/:routeId`

**Parameters:**

- `routeId` (Path): The identifier for the route.
- `operatorId` (Query, Optional): The identifier for the transit operator. Required for global providers (like Transitland) where a `routeId` (e.g., "0975") might be ambiguous across different cities. Ignored by regional providers (like BKK) where `routeId` is globally unique.

**Example Calls:**

- `/api/transit/bkk/route-shapes/BKK_3040`
- `/api/transit/transitland/route-shapes/0975?operatorId=o-u2mw-bkk`

### 2. Route Stops

Retrieves the ordered sequence of transit stops for a specific route.

**Endpoint:** `GET /api/transit/[provider]/route-stops/:routeId`

**Parameters:**

- `routeId` (Path): The identifier for the route.
- `operatorId` (Query, Optional): Used to disambiguate the route globally.

### 3. Stop Departures

Retrieves real-time or scheduled upcoming departures for a given stop.

**Endpoint:** `GET /api/transit/[provider]/stops/:stopKey/departures`

**Parameters:**

- `stopKey` (Path): The unique identifier for the physical stop.
- `next` (Query, Optional): Time window in seconds to look ahead (default: 7200).

### 4. Vehicle Positions

Retrieves real-time vehicle locations within a specified bounding box.

**Endpoint:** `GET /api/transit/[provider]/vehicles`

**Parameters:**

- `bbox` (Query): Geographic bounding box formatted as `minLon,minLat,maxLon,maxLat`.

## Parameter Normalization: `routeId` and `operatorId`

When integrating multiple transit systems, identifiers often have mismatched scopes:

- **Regional Providers (e.g., BKK):** The `routeId` (e.g., `BKK_3040`) is internally globally unique. The API requires only the `routeId` to accurately resolve shapes and stops.
- **Global Aggregators (e.g., Transitland):** The system aggregates thousands of GTFS feeds. A `routeId` like `"1"` or `"0975"` might exist in hundreds of cities simultaneously. To resolve the correct route, the API requires context about the operator providing the feed. This is handled by extracting the `operator_onestop_id` from the GTFS feed when vehicles are queried, returning it to the frontend as `operatorId`, and requiring it in subsequent route-specific requests.

By exposing `operatorId` as a standard query parameter, the API interface remains strictly identical for the frontend client regardless of which adapter is actively selected in the application state.
