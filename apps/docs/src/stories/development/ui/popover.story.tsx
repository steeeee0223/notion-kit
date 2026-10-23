import { defineStory } from "@/lib/story";
import { uiPopover } from "@/stories/development.lazy";

export const Detach = defineStory({
  Component: uiPopover.DetachExample,
  displayName: "Detach",
  args: { initial: {} },
  frame: {
    src: "/story/development/ui/popover/Detach",
    width: 1280,
    height: 800,
  },
});
