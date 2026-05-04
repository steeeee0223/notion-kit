import type { IconFactoryConfig, IconFactoryResult } from "./types";

export function createIconFactories(
  config: IconFactoryConfig,
): IconFactoryResult[] {
  const ids = new Set<string>();
  for (const provider of config.providers) {
    if (ids.has(provider.id)) {
      console.warn(
        `[icon-menu] Duplicate factory id: "${provider.id}". Each factory must have a unique id.`,
      );
    }
    ids.add(provider.id);
  }
  return config.providers;
}
