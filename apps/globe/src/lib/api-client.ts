import { createFetch } from "@better-fetch/fetch";

import { env } from "@/env";
import {
  adminTransportProviderPath,
  type MapServerTransportProviderId,
} from "@/lib/transport-provider";

export const MAP_WS_URL =
  env.VITE_MAP_WS_URL ??
  env.VITE_MAP_API_BASE_URL.replace(/^http/, "ws").replace(/\/$/, "") + "/ws";

export const mapApiClient = createFetch({
  baseURL: env.VITE_MAP_API_BASE_URL,
});

export interface RealtimeSyncResponse {
  polled?: {
    feedOnestopId: string;
    vehiclePositionsCount: number;
    tripUpdatesCount: number;
    alertsCount: number;
    durationMs: number;
  }[];
  synced?: {
    feedOnestopId: string;
    vehiclesCount: number;
  }[];
  errors: {
    feedOnestopId: string;
    message: string;
  }[];
  meta?: {
    requested_bbox?: [number, number, number, number] | null;
    requested_feed_ids?: string[];
    matched_realtime_feed_count?: number;
    message?: string;
  };
}

export interface StaticSyncResponse {
  synced: {
    feedOnestopId: string;
    sha1: string | null;
    status: "imported" | "updated" | "skipped" | "partial" | "error";
    stopsCount: number;
    routesCount: number;
    tripsCount: number;
    stopTimesCount: number;
    durationMs: number;
  }[];
  transitlandApiCallsUsed: number;
  errors: {
    feedOnestopId: string;
    message: string;
  }[];
}

export async function syncRealtimeSnapshots(
  input: { bbox?: string; provider?: MapServerTransportProviderId } = {},
) {
  const response = await fetch(
    `${env.VITE_MAP_API_BASE_URL}${adminTransportProviderPath(
      input.provider ?? "transitland",
      "/sync/realtime",
    )}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(env.VITE_MAP_ADMIN_TOKEN
          ? { authorization: `Bearer ${env.VITE_MAP_ADMIN_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({ bbox: input.bbox }),
    },
  );
  const data = (await response.json()) as RealtimeSyncResponse;
  if (!response.ok) {
    throw new Error(`Realtime sync failed with status ${response.status}`);
  }
  return data;
}

export async function syncStaticTransitData(input: {
  bbox?: string;
  feedIds?: string[];
  provider?: MapServerTransportProviderId;
}) {
  return postAdminSync<StaticSyncResponse>(
    adminTransportProviderPath(input.provider ?? "transitland", "/sync/static"),
    {
      bbox: input.bbox,
      feedIds: input.feedIds,
      force: false,
    },
  );
}

async function postAdminSync<T>(path: string, body: unknown) {
  const response = await fetch(`${env.VITE_MAP_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(env.VITE_MAP_ADMIN_TOKEN
        ? { authorization: `Bearer ${env.VITE_MAP_ADMIN_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error(`Sync failed with status ${response.status}`);
  }
  return data;
}
