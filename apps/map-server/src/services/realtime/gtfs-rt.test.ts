import gtfsRealtimeBindings from "gtfs-realtime-bindings";
import { afterEach, expect, it, vi } from "vitest";

import {
  insertRealtimeSnapshotRows,
  listFeedsForRealtime,
} from "@/services/repository";

import { syncRealtimeFeeds } from "./gtfs-rt";

vi.mock("@/services/repository", () => ({
  insertRealtimeSnapshotRows: vi.fn(),
  listFeedsForRealtime: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

it("polls the stored feed URL and decodes the protobuf response", async () => {
  const feedUrl = "https://feed.example.com/vehicles.pb?token=signed%2Bvalue";
  vi.mocked(listFeedsForRealtime).mockResolvedValue([
    {
      onestopId: "f-vehicles",
      name: null,
      spec: null,
      staticUrl: null,
      rtVehiclePositionsUrl: feedUrl,
      rtTripUpdatesUrl: null,
      rtAlertsUrl: null,
      sha1Current: null,
      fetchedAt: null,
      lastStaticSync: null,
      createdAt: null,
      updatedAt: null,
    },
  ]);

  const body = gtfsRealtimeBindings.transit_realtime.FeedMessage.encode({
    header: { gtfsRealtimeVersion: "2.0" },
    entity: [
      {
        id: "entity-1",
        vehicle: {
          vehicle: { id: "vehicle-1" },
          position: { latitude: 24, longitude: 121 },
        },
      },
    ],
  }).finish();
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
    new Response(Uint8Array.from(body), {
      headers: { "content-type": "application/x-protobuf" },
    }),
  );
  vi.stubGlobal("fetch", fetch);

  const result = await syncRealtimeFeeds({ timeoutMs: 1_000 });

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    feedUrl,
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  expect(result.errors).toEqual([]);
  expect(result.polled).toEqual([
    expect.objectContaining({
      feedOnestopId: "f-vehicles",
      vehiclePositionsCount: 1,
    }),
  ]);
  expect(insertRealtimeSnapshotRows).toHaveBeenCalledWith(
    expect.objectContaining({
      vehiclePositions: [expect.objectContaining({ vehicleId: "vehicle-1" })],
    }),
  );
});
