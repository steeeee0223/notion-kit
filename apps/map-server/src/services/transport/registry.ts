import { simulatorAdapter } from "@/services/transport/simulator-adapter";
import { transitlandAdapter } from "@/services/transport/transitland-adapter";

import { providerNotFound, unsupportedCapability } from "./errors";
import type {
  ProviderCapability,
  TransportProviderAdapter,
} from "./types";

export interface TransportProviderRegistry {
  list: () => TransportProviderAdapter[];
  get: (provider: string) => TransportProviderAdapter;
}

export function createTransportProviderRegistry(
  providers: TransportProviderAdapter[],
): TransportProviderRegistry {
  const providersByKey = new Map(
    providers.map((provider) => [provider.key, provider]),
  );

  return {
    list: () => [...providers],
    get: (provider) => {
      const adapter = providersByKey.get(provider);
      if (!adapter) throw providerNotFound(provider);
      return adapter;
    },
  };
}

export function assertProviderCapability(
  provider: TransportProviderAdapter,
  capability: ProviderCapability,
) {
  if (!provider.capabilities.includes(capability)) {
    throw unsupportedCapability(provider.key, capability);
  }
}

export const transportProviderRegistry = createTransportProviderRegistry([
  transitlandAdapter,
  simulatorAdapter,
]);
