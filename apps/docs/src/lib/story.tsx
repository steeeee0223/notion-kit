import type { ReactNode } from "react";
import { defineStoryFactory } from "@fumadocs/story/vite/client";

const factory = defineStoryFactory();

function StoryViewport({ children }: { children: ReactNode }) {
  return <div data-story-viewport>{children}</div>;
}

export const defineStory: typeof factory.defineStory = (options) =>
  factory.defineStory({
    ...options,
    frame: options.frame && { ...options.frame, Container: StoryViewport },
  });

export function storyTitle(name: string) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
