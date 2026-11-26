import { afterEach, expect, it, vi } from "vitest";

import { TransitlandClient } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("encodes feed IDs once in Transitland requests", async () => {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValueOnce(Response.json({ feeds: [{ onestop_id: "f/北" }] }))
    .mockResolvedValueOnce(Response.json({ entity: [] }))
    .mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "application/octet-stream" },
      }),
    );
  vi.stubGlobal("fetch", fetch);

  const client = new TransitlandClient("test-key");
  await expect(client.getFeed("f/北")).resolves.toEqual({ onestop_id: "f/北" });
  await expect(
    client.downloadLatestRealtimeVehiclePositions("f/北"),
  ).resolves.toEqual({ entity: [] });
  await expect(client.downloadLatestFeedVersion("f/北")).resolves.toEqual(
    Buffer.from([1, 2, 3]),
  );

  expect(
    fetch.mock.calls.map(([input]) => {
      if (input instanceof Request) return input.url;
      if (input instanceof URL) return input.href;
      return input;
    }),
  ).toEqual([
    "https://transit.land/api/v2/rest/feeds/f%2F%E5%8C%97?apikey=test-key",
    "https://transit.land/api/v2/rest/feeds/f%2F%E5%8C%97/download_latest_rt/vehicle_positions.json?apikey=test-key",
    "https://transit.land/api/v2/rest/feeds/f%2F%E5%8C%97/download_latest_feed_version?apikey=test-key",
  ]);
});
