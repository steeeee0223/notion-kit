import type { FastifyBaseLogger } from "fastify";
import { describe, expect, it } from "vitest";

import { simulatorAdapter } from "./simulator-adapter";
import type { ProviderContext } from "./types";

const context: ProviderContext = {
  configUser: "test",
  credentials: {},
  log: console as unknown as FastifyBaseLogger,
};

describe("simulator transport provider adapter", () => {
  it("reports healthy without credentials", async () => {
    await expect(simulatorAdapter.healthCheck(context)).resolves.toEqual({
      ok: true,
    });
    expect(simulatorAdapter.requiredCredentialKeys).toEqual([]);
  });

  it("returns deterministic simulator routes", async () => {
    const response = (await simulatorAdapter.findRoutes?.(
      {
        feedOnestopId: "sim-feed",
        limit: 10,
      },
      context,
    )) as { routes: Array<Record<string, unknown>> };

    expect(response.routes[0]).toMatchObject({
      id: "sim-feed:route-blue",
      provider_key: "simulator",
      route_short_name: "BLUE",
    });
  });

  it("returns deterministic simulator stops", async () => {
    const response = (await simulatorAdapter.findStops?.(
      {
        feedOnestopId: "sim-feed",
        limit: 10,
      },
      context,
    )) as { stops: Array<Record<string, unknown>> };

    expect(response.stops[0]).toMatchObject({
      id: "sim-feed:stop-central",
      provider_key: "simulator",
      stop_name: "Central Station",
    });
  });

  it("returns deterministic simulator vehicles", async () => {
    const response = (await simulatorAdapter.findVehicles?.({}, context)) as {
      vehicles: Array<Record<string, unknown>>;
    };

    expect(response.vehicles[0]).toMatchObject({
      vehicle_id: "sim-vehicle-1",
      provider_key: "simulator",
      route_id: "sim-feed:route-blue",
    });
  });

  it("rejects route shape requests for unknown routes", async () => {
    await expect(
      simulatorAdapter.findRouteShape?.(
        {
          routeId: "sim-feed:route-missing",
          includeShape: true,
        },
        context,
      ),
    ).rejects.toThrow("Route not found");
  });

  it("rejects departure requests for unknown stops", async () => {
    await expect(
      simulatorAdapter.findDepartures?.(
        {
          stopId: "sim-feed:stop-missing",
          date: "2026-05-27",
          startTime: "08:00:00",
          endTime: "09:00:00",
          includeRealtime: true,
          includeAlerts: false,
          limit: 10,
        },
        context,
      ),
    ).rejects.toThrow("Stop not found");
  });

  it("returns static departures when realtime is not requested", async () => {
    const response = (await simulatorAdapter.findDepartures?.(
      {
        stopId: "sim-feed:stop-central",
        date: "2026-05-27",
        startTime: "08:00:00",
        endTime: "09:00:00",
        includeRealtime: false,
        includeAlerts: false,
        limit: 10,
      },
      context,
    )) as { departures: Array<Record<string, unknown>> };

    expect(response.departures[0]).toMatchObject({
      realtime_arrival_delay: null,
      realtime_departure_delay: null,
      schedule_relationship: "STATIC",
      is_realtime: false,
    });
  });
});
