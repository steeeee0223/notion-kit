import type { FastifyBaseLogger } from "fastify";
import { describe, expect, it } from "vitest";

import { simulatorAdapter } from "./simulator-adapter";
import type { ProviderContext } from "./types";

const context: ProviderContext = {
  configAdminToken: "test",
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
    )) as { routes: Record<string, unknown>[] };

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
    )) as { stops: Record<string, unknown>[] };

    expect(response.stops[0]).toMatchObject({
      id: "sim-feed:stop-central",
      provider_key: "simulator",
      stop_name: "Central Station",
    });
  });

  it("returns deterministic simulator vehicles", async () => {
    const response = (await simulatorAdapter.findVehicles?.({}, context)) as {
      vehicles: Record<string, unknown>[];
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
    )) as { departures: Record<string, unknown>[] };

    expect(response.departures[0]).toMatchObject({
      realtime_arrival_delay: null,
      realtime_departure_delay: null,
      schedule_relationship: "STATIC",
      is_realtime: false,
    });
  });

  it("returns deterministic simulator trip route details", async () => {
    const response = (await simulatorAdapter.findTripRoute?.(
      {
        tripId: "sim-feed:trip-blue-1",
        includeShape: true,
      },
      context,
    )) as {
      trip: Record<string, unknown>;
      route: Record<string, unknown>;
      shape: Record<string, unknown> | null;
      alerts: unknown[];
    };

    expect(response.trip).toMatchObject({
      id: "sim-feed:trip-blue-1",
      route_id: "sim-feed:route-blue",
    });
    expect(response.route).toMatchObject({
      id: "sim-feed:route-blue",
      provider_key: "simulator",
    });
    expect(response.shape).toMatchObject({
      shape_id: "sim-feed:shape-blue",
    });
    expect(response.alerts).toEqual([]);
  });

  it("returns deterministic simulator trip stop times", async () => {
    const response = (await simulatorAdapter.findTripStopTimes?.(
      {
        tripId: "sim-feed:trip-blue-1",
        date: "2026-05-27",
        includeRealtime: true,
        includeGeometry: true,
      },
      context,
    )) as {
      trip_id: string;
      route_short_name: string | null;
      service_date: string;
      stop_times: Record<string, unknown>[];
    };

    expect(response.trip_id).toBe("sim-feed:trip-blue-1");
    expect(response.route_short_name).toBe("BLUE");
    expect(response.stop_times).toHaveLength(3);
    expect(response.stop_times[0]).toMatchObject({
      stop_id: "sim-feed:stop-central",
      stop_name: "Central Station",
      stop_sequence: 1,
      is_timepoint: true,
    });
  });
});
