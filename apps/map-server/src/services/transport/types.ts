import type { FastifyBaseLogger } from "fastify";

import type { Bbox } from "../../lib/schemas";
import type { CredentialMap } from "../config";
import type { StaticFeedStatusCandidate } from "../static-feed-status";

export type ProviderCapability =
  | "static_schedule"
  | "realtime_vehicles"
  | "trip_updates"
  | "alerts"
  | "departures";

export type ProviderKind =
  | "gtfs"
  | "gtfs_rest"
  | "country_api"
  | "simulator"
  | "flight_reserved";

export interface ProviderContext {
  configAdminToken: string;
  credentials: CredentialMap;
  log: FastifyBaseLogger;
}

export interface ProviderHealth {
  ok: boolean;
  message?: string;
  credentialKeys?: Record<string, { present: boolean }>;
}

export interface DiscoverStaticFeedsInput {
  bbox?: Bbox;
  query?: string;
  providerFeedIds?: string[];
  limit?: number;
}

export interface StaticSyncInput {
  bbox?: Bbox;
  feedIds?: string[];
  force?: boolean;
}

export interface SyncRealtimeInput {
  bbox?: Bbox;
  feedIds?: string[];
  timeoutMs?: number;
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
  kind: ProviderKind;
  capabilities: ProviderCapability[];
  requiredCredentialKeys: string[];
  healthCheck: (context: ProviderContext) => Promise<ProviderHealth>;
  discoverStaticFeeds?: (
    input: DiscoverStaticFeedsInput,
    context: ProviderContext,
  ) => Promise<{ candidates: StaticFeedStatusCandidate[]; meta: unknown }>;
  syncStatic?: (
    input: StaticSyncInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  syncRealtime?: (
    input: SyncRealtimeInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  findStops?: (input: StopQuery, context: ProviderContext) => Promise<unknown>;
  findRoutes?: (
    input: RouteQuery,
    context: ProviderContext,
  ) => Promise<unknown>;
  findTrips?: (input: TripQuery, context: ProviderContext) => Promise<unknown>;
  findRouteShape?: (
    input: RouteShapeQuery,
    context: ProviderContext,
  ) => Promise<unknown>;
  findDepartures?: (
    input: DepartureQuery,
    context: ProviderContext,
  ) => Promise<unknown>;
  findVehicles?: (
    input: VehicleQuery,
    context: ProviderContext,
  ) => Promise<unknown>;
}
