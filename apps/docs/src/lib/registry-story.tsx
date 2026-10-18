import type { RegistryIndex } from "@notion-kit/registry";

import { registryStories } from "@/stories/registry.story";

export function RegistryStory({ name }: { name: RegistryIndex }) {
  const story = registryStories[name];
  return <story.WithControl />;
}
