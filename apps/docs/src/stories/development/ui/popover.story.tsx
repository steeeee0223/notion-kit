import { defineStory } from "@/lib/story";

import { DetachExample } from "./popover.lazy";

export const Detach = defineStory({
  Component: DetachExample,
  displayName: "Detach",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/popover/Detach",
    width: 1280,
    height: 800,
  },
});
