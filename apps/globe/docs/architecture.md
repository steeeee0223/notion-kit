# Globe UI Architecture

This document defines the architectural patterns for the `@notion-kit/globe` application. Specifically, it outlines how the map visualization layer is decoupled from its underlying data sources, allowing maximum reusability and clean separation of concerns.

## 1. Core Concepts

To prevent code duplication (e.g., repeating the same UI components for different APIs), the architecture is split into two primary domains: **Map Plugins** and **Source Adapters**.

### 1.1 Map Plugins (Visual Layer)

A Map Plugin is strictly responsible for _how_ data is rendered on the map and _how_ the user interacts with it. It does not know where the data comes from.

- **Examples:** `VehiclesPlugin`, `RoutesPlugin`, `StopsPlugin`, `TrafficPlugin`, `HeatmapPlugin`.
- **Responsibilities:**
  - Rendering GeoJSON feature layers (e.g., points, lines, polygons).
  - Providing custom Mapbox/Maplibre styling.
  - Handling user interactions on the map (clicks, hovers).
  - Rendering associated DOM overlays (e.g., tooltips, popups).
  - Providing UI panels for the sidebar (e.g., filtering options).

### 1.2 Source Adapters (Data Layer)

A Source Adapter is strictly responsible for _fetching and normalizing_ data into a standardized format that the Map Plugins can consume.

- **Examples:** `BKKAdapter`, `TransitlandAdapter`.
- **Responsibilities:**
  - Managing API endpoints, WebSockets, or polling intervals.
  - Translating domain-specific schemas (e.g., GTFS-RT) into unified local types (e.g., `VehiclePosition`).
  - Handling geographic bounding box synchronization with the map.

## 2. Directory Structure

```text
apps/globe/src/
├── plugins/
│   ├── vehicles/          # Renders vehicle points and popup tooltips
│   ├── routes/            # Renders transit line geometries
│   ├── stops/             # Renders bus/tram stops
│   ├── traffic/           # (Other conceptual layers)
│   └── ...
├── adapters/
│   ├── bkk/               # Fetches from BKK Futar API
│   ├── transitland/       # Fetches from Transitland API
│   └── index.ts           # Adapter Registry & Context Providers
├── lib/
│   └── types.ts           # Standardized interfaces (e.g., VehiclePosition)
```

## 3. Data Flow & Context Management

The connection between Plugins and Adapters is managed via React Context and Zustand stores.

1. **Global Adapter State:** The application maintains a global state defining the _Active Source Adapter_ (e.g., `activeAdapter: "transitland"`).
2. **Standardized Hooks:** We expose standard hooks like `useVehiclePositions()` which internally route the request to the active adapter.
   ```ts
   export function useVehiclePositions() {
     const adapter = useActiveAdapter();
     if (adapter === "bkk") return useBKKVehicles();
     if (adapter === "transitland") return useTransitlandVehicles();
   }
   ```
3. **Plugin Consumption:** The `VehiclesPlugin` simply calls `useVehiclePositions()` and renders the returned array of `VehiclePosition` items. It does not care if the data came via WebSocket from BKK or HTTP polling from Transitland.

## 4. Layer Sidebar UI

The sidebar implements a dual-mode grouping system to allow users to customize their map experience:

- **Mode A: Grouped by Plugin (Visual Features)**
  - Users toggle specific visual elements (e.g., "Show Vehicles", "Show Routes").
  - Under this mode, changing the active data source applies globally to all enabled plugins.
- **Mode B: Grouped by Source (Providers)**
  - Users toggle specific data providers (e.g., "BKK System", "Global Transitland").
  - Under this mode, enabling a source automatically provisions the necessary visual layers for that source.
