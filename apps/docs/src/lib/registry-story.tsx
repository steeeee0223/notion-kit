import { lazy, useMemo } from "react";

import type { RegistryIndex } from "@notion-kit/registry";

import { registryExamples } from "@/stories/registry.lazy";

import { defineStory, storyTitle } from "./story";

export function buildRegistryStory(
  index: RegistryIndex,
  displayName: string = storyTitle(index),
) {
  const Example = lazy(registryExamples[index]);
  const height =
    /^(calendar|settings-panel|sidebar|table-view|timeline|kanban)/.test(index)
      ? 800
      : index.startsWith("map-")
        ? 600
        : 320;

  return defineStory({
    Component: Example,
    displayName,
    // Registry examples own their state and have no editable story arguments.
    args: {
      initial: {},
      controls: { node: { type: "object", properties: [] } },
    },
    frame: { src: `/story/registry/${index}/story`, height },
  });
}

export function RegistryStory({ name }: { name: RegistryIndex }) {
  const story = useMemo(() => buildRegistryStory(name), [name]);
  return <story.WithControl />;
}
