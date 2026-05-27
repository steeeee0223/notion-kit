import { describe, expect, it, vi } from "vitest";

import { ProviderError } from "./errors";
import {
  assertProviderCapability,
  createTransportProviderRegistry,
} from "./registry";
import type { TransportProviderAdapter } from "./types";

const adapters = vi.hoisted(() => ({
  simulator: {
    key: "simulator",
    displayName: "Simulator",
    kind: "simulator",
    capabilities: ["static_schedule", "realtime_vehicles"],
    requiredCredentialKeys: [],
    healthCheck: async () => ({ ok: true }),
  },
  transitland: {
    key: "transitland",
    displayName: "Transitland",
    kind: "gtfs",
    capabilities: ["static_schedule"],
    requiredCredentialKeys: ["transit_api_key"],
    healthCheck: async () => ({ ok: true }),
  },
}));

vi.mock("@/services/transport/simulator-adapter", () => ({
  simulatorAdapter: adapters.simulator,
}));

vi.mock("@/services/transport/transitland-adapter", () => ({
  transitlandAdapter: adapters.transitland,
}));

const simulator = adapters.simulator as TransportProviderAdapter;

describe("transport provider registry", () => {
  it("returns a provider by key", () => {
    const registry = createTransportProviderRegistry([simulator]);

    expect(registry.get("simulator")).toBe(simulator);
  });

  it("throws when a provider is not found", () => {
    const registry = createTransportProviderRegistry([simulator]);

    expect(() => registry.get("missing")).toThrow(ProviderError);
    expect(() => registry.get("missing")).toThrow("Provider not found");
  });

  it("asserts provider capabilities", () => {
    expect(() =>
      assertProviderCapability(simulator, "static_schedule"),
    ).not.toThrow();

    expect(() => assertProviderCapability(simulator, "alerts")).toThrow(
      "Provider does not support capability",
    );
  });
});
