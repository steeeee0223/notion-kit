import {
  buildRouteShapeResponse,
  buildRoutesResponse,
  buildStopsResponse,
  buildTripsResponse,
  buildVehiclesResponse,
} from "@/controllers/map/controller";
import { badRequest } from "@/lib/api-error";
import { buildStopDepartures } from "@/services/departures";
import { buildStaticImportResult } from "@/services/gtfs/data-transfer";
import { importGtfsStaticFeed } from "@/services/gtfs/static-import";
import { syncRealtimeFeeds } from "@/services/realtime/gtfs-rt";
import { getFeedsByIds, getStaticFeedCounts } from "@/services/repository";
import { buildStaticFeedStatusCandidates } from "@/services/static-feed-status";
import {
  getFeedOnestopId,
  getFeedVersion,
  TransitlandClient,
} from "@/services/transitland/client";

import { missingCredentials } from "./errors";
import type { ProviderContext, TransportProviderAdapter } from "./types";

const PROVIDER_KEY = "transit";
const TRANSITLAND_API_KEY = "transit_api_key";

export const transitlandAdapter: TransportProviderAdapter = {
  key: PROVIDER_KEY,
  displayName: "Transitland",
  kind: "gtfs",
  capabilities: [
    "static_schedule",
    "realtime_vehicles",
    "trip_updates",
    "alerts",
    "departures",
  ],
  requiredCredentialKeys: [TRANSITLAND_API_KEY],
  healthCheck: async (context) => {
    const present = Boolean(getTransitlandApiKey(context));
    return {
      ok: present,
      ...(present ? {} : { message: "Missing transit_api_key" }),
      credentialKeys: {
        transit_api_key: { present },
      },
    };
  },
  discoverStaticFeeds: async (input, context) => {
    const apiKey = requireTransitlandApiKey(context);
    const transitland = new TransitlandClient(apiKey);
    const feeds = await transitland.discoverFeeds({
      bbox: input.bbox,
      feedIds: input.providerFeedIds,
    });
    const candidates = await buildStaticFeedStatusCandidates(feeds);
    return {
      candidates,
      meta: {
        bbox: input.bbox,
        total: candidates.length,
        provider: PROVIDER_KEY,
      },
    };
  },
  syncStatic: async (input, context) => {
    const apiKey = requireTransitlandApiKey(context);
    const transitland = new TransitlandClient(apiKey);
    const feeds = await transitland.discoverFeeds({
      bbox: input.bbox,
      feedIds: input.feedIds,
    });
    if (feeds.length === 0) {
      throw badRequest("No Transitland GTFS feeds matched the request");
    }

    const existingFeeds = await getFeedsByIds(
      feeds.map(getFeedOnestopId).filter(Boolean),
    );
    const synced = [];
    const errors = [];
    let transitlandApiCallsUsed = input.feedIds?.length ?? 1;

    for (const feed of feeds) {
      const feedOnestopId = getFeedOnestopId(feed);
      const sha1 = getFeedVersion(feed)?.sha1 ?? null;
      const existingSha1 =
        existingFeeds.get(feedOnestopId)?.sha1Current ?? null;
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

        const zipBuffer =
          await transitland.downloadLatestFeedVersion(feedOnestopId);
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
        const message = getErrorMessage(error);
        context.log.error(
          { error: message, feedOnestopId },
          "Static GTFS import failed",
        );
        errors.push({ feedOnestopId, message });
        synced.push(
          buildStaticImportResult(
            feedOnestopId,
            sha1,
            "error",
            started,
            undefined,
            message,
          ),
        );
      }
    }

    return {
      synced,
      transitlandApiCallsUsed,
      errors,
    };
  },
  syncRealtime: async (input, context) => {
    const apiKey = requireTransitlandApiKey(context);
    return syncRealtimeFeeds({
      bbox: input.bbox,
      feedIds: input.feedIds,
      timeoutMs: input.timeoutMs ?? 10000,
      apiKey,
    });
  },
  findStops: async (input) => {
    return addProviderToCollection(
      await buildStopsResponse({
        bbox: input.bbox,
        feed_onestop_id: input.feedOnestopId,
        include_alerts: input.includeAlerts ?? false,
        limit: input.limit,
      }),
      "stops",
    );
  },
  findRoutes: async (input) => {
    return addProviderToCollection(
      await buildRoutesResponse({
        feed_onestop_id: input.feedOnestopId,
        route_type: input.routeType,
        limit: input.limit,
      }),
      "routes",
    );
  },
  findTrips: async (input) => {
    return addProviderToCollection(
      await buildTripsResponse({
        route_id: input.routeId,
        service_date: input.serviceDate,
        start_time: input.startTime,
        end_time: input.endTime,
        direction_id: input.directionId,
        limit: input.limit,
      }),
      "trips",
    );
  },
  findRouteShape: async (input) => {
    const response = await buildRouteShapeResponse({
      route_id: input.routeId,
      include_shape: input.includeShape,
    });
    return {
      ...response,
      route: isRecord(response.route)
        ? addProviderKey(response.route)
        : response.route,
      trip: isRecord(response.trip) ? addProviderKey(response.trip) : null,
    };
  },
  findDepartures: async (input) => {
    const data = await buildStopDepartures({
      stopId: input.stopId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      includeRealtime: input.includeRealtime,
      includeAlerts: input.includeAlerts,
      limit: input.limit,
    });

    return {
      stop: addProviderKey(data.stop),
      departures: data.departures.map((departure) => addProviderKey(departure)),
      alerts: data.alerts,
      meta: {
        date: input.date,
        start_time: input.startTime,
        end_time: input.endTime,
        realtime_available: data.realtimeAvailable,
      },
    };
  },
  findVehicles: async (input) => {
    return addProviderToCollection(
      await buildVehiclesResponse({
        bbox: input.bbox,
        feed_onestop_id: input.feedOnestopId,
        route_type: input.routeType,
      }),
      "vehicles",
    );
  },
};

function getTransitlandApiKey(context: ProviderContext) {
  const value = context.credentials[TRANSITLAND_API_KEY];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function requireTransitlandApiKey(context: ProviderContext) {
  const apiKey = getTransitlandApiKey(context);
  if (!apiKey) throw missingCredentials(PROVIDER_KEY, [TRANSITLAND_API_KEY]);
  return apiKey;
}

function addProviderToCollection<T extends Record<string, unknown>>(
  response: T,
  key: string,
) {
  const records = response[key];
  if (!Array.isArray(records)) return response;
  return {
    ...response,
    [key]: records.map((record) =>
      isRecord(record) ? addProviderKey(record) : record,
    ),
  };
}

function addProviderKey<T extends Record<string, unknown>>(record: T) {
  return {
    ...record,
    provider_key: PROVIDER_KEY,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

const MAX_IMPORT_ERROR_MESSAGE_LENGTH = 2000;

function getErrorMessage(error: unknown) {
  const causeMessage = getNestedErrorMessage(error);
  if (causeMessage) return truncateErrorMessage(causeMessage);
  if (error instanceof Error && error.message) {
    return truncateErrorMessage(error.message);
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return truncateErrorMessage(message);
    }
  }
  if (typeof error === "string" && error.length > 0) {
    return truncateErrorMessage(error);
  }

  try {
    const serialized = JSON.stringify(error);
    if (serialized && serialized !== "{}") {
      return truncateErrorMessage(serialized);
    }
  } catch {
    // Fall through to the generic message.
  }

  return "Unknown static GTFS import error";
}

function getNestedErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object" || !("cause" in error)) return null;
  const cause = (error as { cause?: unknown }).cause;
  if (cause instanceof Error && cause.message) return cause.message;
  if (cause && typeof cause === "object" && "message" in cause) {
    const message = (cause as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return null;
}

function truncateErrorMessage(message: string) {
  if (message.length <= MAX_IMPORT_ERROR_MESSAGE_LENGTH) return message;
  return `${message.slice(0, MAX_IMPORT_ERROR_MESSAGE_LENGTH)}...`;
}
