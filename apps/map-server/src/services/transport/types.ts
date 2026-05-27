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
  configUser: string;
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

export interface SyncStaticFeedInput {
  feedId: string;
  force?: boolean;
}

export interface SyncRealtimeInput {
  bbox?: Bbox;
  feedIds?: string[];
  timeoutMs?: number;
}

export interface ListStopsInput {
  bbox?: Bbox;
  feedIds?: string[];
  routeId?: string;
  limit?: number;
}

export interface ListRoutesInput {
  bbox?: Bbox;
  feedIds?: string[];
  query?: string;
  limit?: number;
}

export interface ListTripsInput {
  routeId?: string;
  feedId?: string;
  serviceDate?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

export interface GetRouteShapeInput {
  routeId: string;
  tripId?: string;
  serviceDate?: string;
}

export interface GetDeparturesInput {
  stopId: string;
  serviceDate?: string;
  startTime?: string;
  endTime?: string;
  includeRealtime?: boolean;
  includeAlerts?: boolean;
  limit?: number;
}

export interface ListVehiclesInput {
  bbox?: Bbox;
  feedIds?: string[];
  routeId?: string;
  tripId?: string;
  limit?: number;
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
  syncStaticFeed?: (
    input: SyncStaticFeedInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  syncRealtime?: (
    input: SyncRealtimeInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  listStops?: (
    input: ListStopsInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  listRoutes?: (
    input: ListRoutesInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  listTrips?: (
    input: ListTripsInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  getRouteShape?: (
    input: GetRouteShapeInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  getDepartures?: (
    input: GetDeparturesInput,
    context: ProviderContext,
  ) => Promise<unknown>;
  listVehicles?: (
    input: ListVehiclesInput,
    context: ProviderContext,
  ) => Promise<unknown>;
}
