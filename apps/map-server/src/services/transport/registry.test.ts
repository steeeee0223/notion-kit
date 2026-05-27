import { describe, expect, it } from "vitest";

import { ProviderError } from "./errors";
import {
  assertProviderCapability,
  createTransportProviderRegistry,
} from "./registry";
import type { TransportProviderAdapter } from "./types";

const simulator: TransportProviderAdapter = {
  key: "simulator",
  displayName: "Simulator",
  kind: "simulator",
  capabilities: ["static_schedule", "realtime_vehicles"],
  requiredCredentialKeys: [],
  healthCheck: async () => ({ ok: true }),
};

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
